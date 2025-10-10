import NextAuth, { NextAuthOptions } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { initializeSecrets } from '@/lib/awsSecretsManager';

const prisma = new PrismaClient();

// Initialize secrets before creating NextAuth handler
let secretsInitialized = false;
let authHandler: any = null;

// Function to get or create the NextAuth handler
async function getAuthHandler() {
  if (!secretsInitialized) {
    await initializeSecrets();
    secretsInitialized = true;
  }

  if (!authHandler) {
    const authOptions: NextAuthOptions = {
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
          // Persist the OAuth access_token and or the user id to the token right after signin
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
          // Send properties to the client
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
          // Allow sign in
          return true;
        },
      },
      pages: {
        signIn: "/auth",
        error: "/auth/error",
      },
      debug: process.env.NODE_ENV === "development",
    };

    authHandler = NextAuth(authOptions);
  }

  return authHandler;
}

// Wrapper functions to ensure secrets are initialized
export async function GET(request: Request) {
  try {
    const handler = await getAuthHandler();
    return handler(request);
  } catch (error) {
    console.error('Failed to initialize NextAuth:', error);
    return new Response('Configuration error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const handler = await getAuthHandler();
    return handler(request);
  } catch (error) {
    console.error('Failed to initialize NextAuth:', error);
    return new Response('Configuration error', { status: 500 });
  }
}
