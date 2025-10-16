import NextAuth from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if NextAuth can initialize with just environment variables
    NextAuth({
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
      debug: true,
    });

    return NextResponse.json({
      success: true,
      message: "NextAuth configuration test successful",
      envCheck: {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
        OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
        OKTA_ISSUER: !!process.env.OKTA_ISSUER,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
        OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
        OKTA_ISSUER: !!process.env.OKTA_ISSUER,
      }
    }, { status: 500 });
  }
}
