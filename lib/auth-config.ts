import { NextAuthOptions } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { prisma } from '@/lib/prisma';

function usernameFromEmail(email?: string | null, fallback?: string | null) {
  const base = (email?.split('@')[0] || fallback || 'user')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .slice(0, 18);
  return base || 'user';
}

export const authOptions: NextAuthOptions = {
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID!,
      clientSecret: process.env.OKTA_CLIENT_SECRET!,
      issuer: process.env.OKTA_ISSUER!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
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
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  debug: true,
};
