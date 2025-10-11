import NextAuth, { NextAuthOptions } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { initializeSecrets } from '@/lib/awsSecretsManager';

const prisma = new PrismaClient();

// Initialize secrets once at module load
let secretsInitialized = false;
let authOptions: NextAuthOptions | null = null;

const initializeAuth = async () => {
  if (!secretsInitialized) {
    await initializeSecrets();
    secretsInitialized = true;
  }

  if (!authOptions) {
    authOptions = {
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
      debug: process.env.NODE_ENV === "development",
    };
  }

  return NextAuth(authOptions);
};

// Create handlers that properly await the auth initialization
export const GET = async (request: Request) => {
  const handler = await initializeAuth();
  return handler(request);
};

export const POST = async (request: Request) => {
  const handler = await initializeAuth();
  return handler(request);
};
