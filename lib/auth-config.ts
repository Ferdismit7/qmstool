import { NextAuthOptions } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import CredentialsProvider from "next-auth/providers/credentials";
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { prisma } from '@/lib/prisma';

function usernameFromEmail(email?: string | null, fallback?: string | null) {
  const base = (email?.split('@')[0] || fallback || 'user')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .slice(0, 18);
  return base || 'user';
}

// Create auth options function that ensures secrets are loaded
export const getAuthOptions = async (): Promise<NextAuthOptions> => {
  // Ensure secrets are initialized (this should already be done, but be safe)
  await initializeSecrets();
  
  const oktaEnabled = process.env.OKTA_ENABLED === 'true';

  // Verify required environment variables are set
  if (oktaEnabled && (!process.env.OKTA_CLIENT_ID || !process.env.OKTA_CLIENT_SECRET || !process.env.OKTA_ISSUER)) {
    console.error('[NextAuth] Missing Okta configuration:', {
      OKTA_ENABLED: process.env.OKTA_ENABLED,
      OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: !!process.env.OKTA_ISSUER,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    });
    throw new Error('Okta configuration is missing while OKTA_ENABLED=true. Please check environment variables.');
  }

  if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    console.error('[NextAuth] Missing NextAuth configuration:', {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    });
    throw new Error('NextAuth configuration is missing. Please check environment variables.');
  }

  if (oktaEnabled) {
    console.log('[NextAuth] Initializing Okta provider with:', {
      issuer: process.env.OKTA_ISSUER,
      clientId: process.env.OKTA_CLIENT_ID?.substring(0, 8) + '...',
      nextAuthUrl: process.env.NEXTAUTH_URL,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/okta`,
    });
  } else {
    console.log('[NextAuth] OKTA_ENABLED flag is false - Okta provider will be disabled');
  }

  const providers = [];

  if (oktaEnabled) {
    const oktaClientId = process.env.OKTA_CLIENT_ID as string;
    const oktaClientSecret = process.env.OKTA_CLIENT_SECRET as string;
    const oktaIssuer = process.env.OKTA_ISSUER as string;

    providers.push(
      OktaProvider({
        clientId: oktaClientId,
        clientSecret: oktaClientSecret,
        issuer: oktaIssuer,
        authorization: {
          params: {
            scope: "openid email profile offline_access", // offline_access enables refresh tokens
          },
        },
        checks: ["pkce", "state"], // PKCE enabled - matches Okta configuration
      })
    );
  } else {
    providers.push(
      CredentialsProvider({
        name: 'Email/Password (QMS Tool)',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize() {
          throw new Error('Email/password login is handled by the dedicated QMS endpoints.');
        },
      })
    );
  }

  return {
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user, account }) {
        // Initial sign in - store tokens
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.provider = account.provider;
          token.expiresAt = account.expires_at ? account.expires_at * 1000 : undefined; // Convert to milliseconds
        }
        
        // Refresh token if expired (only if refresh token exists)
        if (token.refreshToken && typeof token.expiresAt === 'number' && Date.now() >= token.expiresAt) {
          try {
            console.log('[NextAuth] Access token expired, attempting refresh...');
            // Construct token endpoint URL - works for both default and custom authorization servers
            // If issuer includes /oauth2/, use it directly; otherwise append /oauth2/v1/token for default server
            const issuer = process.env.OKTA_ISSUER!;
            let tokenEndpoint: string;
            if (issuer.includes('/oauth2/')) {
              // Custom authorization server (e.g., https://domain.okta.com/oauth2/default)
              tokenEndpoint = `${issuer.replace(/\/$/, '')}/v1/token`;
            } else {
              // Default authorization server (e.g., https://domain.okta.com)
              tokenEndpoint = `${issuer.replace(/\/$/, '')}/oauth2/v1/token`;
            }
            
            const response = await fetch(tokenEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken as string,
                client_id: process.env.OKTA_CLIENT_ID!,
                client_secret: process.env.OKTA_CLIENT_SECRET!,
              }),
            });

            if (response.ok) {
              const refreshedTokens = await response.json();
              token.accessToken = refreshedTokens.access_token;
              token.expiresAt = Date.now() + (refreshedTokens.expires_in * 1000);
              
              // Update refresh token if a new one is provided
              if (refreshedTokens.refresh_token) {
                token.refreshToken = refreshedTokens.refresh_token;
              }
              
              console.log('[NextAuth] Token refreshed successfully');
            } else {
              console.error('[NextAuth] Token refresh failed:', response.status);
              // Clear tokens to force re-authentication
              token.accessToken = undefined;
              token.refreshToken = undefined;
              token.expiresAt = undefined;
            }
          } catch (error) {
            console.error('[NextAuth] Token refresh error:', error);
            // Clear tokens to force re-authentication
            token.accessToken = undefined;
            token.refreshToken = undefined;
            token.expiresAt = undefined;
          }
        }
        if (user || token?.email) {
          // Ensure DB user exists and attach dbUserId
          try {
            await initializeSecrets();
            const email = (user?.email || token.email) as string | undefined;
            const name = (user?.name || token.name) as string | undefined;
            if (email) {
              const baseUsername = usernameFromEmail(email, name || null);
              // Make username unique if needed
              const candidate = baseUsername;
              // Attempt up to 5 variations to avoid conflicts on the 20-char limit
              // Prefer stable username if available
              const existing = await prisma.user.findUnique({ where: { email } });
              const dbUser = existing ?? await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                  email,
                  username: candidate,
                },
              });
              token.dbUserId = dbUser.id;
            }
          } catch (e) {
            // Don't block auth on provisioning failure
            // eslint-disable-next-line no-console
            console.log('[NextAuth][jwt] provisioning skipped:', e);
          }
          token.id = (token.id || user?.id) as string | undefined;
          token.email = (token.email || user?.email) as string | undefined;
          token.name = (token.name || user?.name) as string | undefined;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.accessToken = token.accessToken as string;
          session.provider = token.provider as string;
          // Expose db user id for server-side lookups if needed
          // @ts-expect-error augmenting session
          session.user.dbUserId = token.dbUserId as number | undefined;
        }
        return session;
      },
      async signIn() {
        return true;
      },
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // Allows callback URLs on the same origin
        if (new URL(url).origin === baseUrl) return url;
        // Default redirect to dashboard
        return `${baseUrl}/dashboard`;
      },
    },
    pages: {
      signIn: "/auth",
      error: "/auth/error",
    },
    debug: true,
  };
};
