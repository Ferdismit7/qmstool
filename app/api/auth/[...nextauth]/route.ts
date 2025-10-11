import NextAuth, { NextAuthOptions } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { initializeSecrets } from '@/lib/awsSecretsManager';

const prisma = new PrismaClient();

// Initialize secrets once at module load
let secretsInitialized = false;

// Lazy initialization of NextAuth configuration
const getAuthOptions = async (): Promise<NextAuthOptions> => {
  if (!secretsInitialized) {
    console.log('🔐 [NextAuth] Initializing secrets...');
    await initializeSecrets();
    secretsInitialized = true;
    console.log('✅ [NextAuth] Secrets initialized successfully');
  }

  // Validate required environment variables
  const requiredEnvVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID,
    OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
    OKTA_ISSUER: process.env.OKTA_ISSUER,
  };

  console.log('🔐 [NextAuth] Environment variables status:');
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    const status = value ? '✅ SET' : '❌ MISSING';
    const display = value ? `${value.substring(0, 10)}...` : 'undefined';
    console.log(`  ${status} ${key}: ${display}`);
  });

  // Check for missing variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const error = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ [NextAuth] Configuration Error:', error);
    throw new Error(error);
  }

  console.log('🔐 [NextAuth] Creating authOptions configuration...');
  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      OktaProvider({
        clientId: process.env.OKTA_CLIENT_ID as string,
        clientSecret: process.env.OKTA_CLIENT_SECRET as string,
        issuer: process.env.OKTA_ISSUER as string,
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
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
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
};

// Create the NextAuth handler with lazy initialization
const handler = async (req: Request) => {
  const authOptions = await getAuthOptions();
  const nextAuthHandler = NextAuth(authOptions);
  // NextAuth returns { GET, POST } handlers
  // @ts-ignore - NextAuth types are complex, using any for simplicity
  return nextAuthHandler;
};

// Export GET and POST that call the handler
export async function GET(req: Request) {
  try {
    const authOptions = await getAuthOptions();
    const nextAuthHandler = NextAuth(authOptions);
    // @ts-ignore
    return nextAuthHandler.GET(req);
  } catch (error) {
    console.error('❌ [NextAuth GET] Error:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const authOptions = await getAuthOptions();
    const nextAuthHandler = NextAuth(authOptions);
    // @ts-ignore
    return nextAuthHandler.POST(req);
  } catch (error) {
    console.error('❌ [NextAuth POST] Error:', error);
    throw error;
  }
}
