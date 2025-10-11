import NextAuth from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { initializeSecrets } from '@/lib/awsSecretsManager';

const prisma = new PrismaClient();

// Initialize secrets at module load
console.log('🔐 [NextAuth] Module loading, initializing secrets...');
await initializeSecrets();
console.log('✅ [NextAuth] Secrets initialized');

// Log environment variable status
console.log('🔐 [NextAuth] Environment check:');
console.log(`  NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅' : '❌'}`);
console.log(`  NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅' : '❌'}`);
console.log(`  OKTA_CLIENT_ID: ${process.env.OKTA_CLIENT_ID ? '✅' : '❌'}`);
console.log(`  OKTA_CLIENT_SECRET: ${process.env.OKTA_CLIENT_SECRET ? '✅' : '❌'}`);
console.log(`  OKTA_ISSUER: ${process.env.OKTA_ISSUER ? '✅' : '❌'}`);

// Create NextAuth handler with configuration
const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
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
});

export { handler as GET, handler as POST };
