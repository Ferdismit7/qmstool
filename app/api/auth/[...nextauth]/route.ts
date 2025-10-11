import NextAuth, { NextAuthOptions } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Initialize secrets once at module load
let secretsInitialized = false;
let authOptions: NextAuthOptions | null = null;

const initializeAuth = async () => {
  try {
    console.log('🔐 [NextAuth] Starting initialization...');
    
    if (!secretsInitialized) {
      console.log('🔐 [NextAuth] Initializing secrets from Lambda...');
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
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      const error = `Missing required environment variables: ${missingVars.join(', ')}`;
      console.error('❌ [NextAuth] Configuration Error:', error);
      throw new Error(error);
    }

    if (!authOptions) {
      console.log('🔐 [NextAuth] Creating authOptions configuration...');
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
        debug: true, // Always enable debug for better error tracking
      };
      console.log('✅ [NextAuth] authOptions configured successfully');
    }

    console.log('🔐 [NextAuth] Creating NextAuth handler...');
    return NextAuth(authOptions);
  } catch (error) {
    console.error('❌ [NextAuth] Initialization failed:', error);
    console.error('❌ [NextAuth] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

// Create handlers that properly await the auth initialization
export const GET = async (request: Request) => {
  try {
    console.log('🔐 [NextAuth GET] Request received:', request.url);
    const handler = await initializeAuth();
    return handler(request);
  } catch (error) {
    console.error('❌ [NextAuth GET] Handler error:', error);
    return NextResponse.json(
      { 
        error: 'NextAuth initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    console.log('🔐 [NextAuth POST] Request received:', request.url);
    const handler = await initializeAuth();
    return handler(request);
  } catch (error) {
    console.error('❌ [NextAuth POST] Handler error:', error);
    return NextResponse.json(
      { 
        error: 'NextAuth initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
};
