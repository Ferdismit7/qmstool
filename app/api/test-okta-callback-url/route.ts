import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await initializeSecrets();

    const nextAuthUrl = process.env.NEXTAUTH_URL || '';
    const callbackUrl = `${nextAuthUrl}/api/auth/callback/okta`;
    const signInUrl = `${nextAuthUrl}/api/auth/signin/okta`;

    const result = {
      timestamp: new Date().toISOString(),
      configuration: {
        NEXTAUTH_URL: nextAuthUrl || 'NOT SET',
        callbackUrl: callbackUrl || 'NOT SET',
        signInUrl: signInUrl || 'NOT SET',
      },
      instructions: {
        step1: 'Copy the callbackUrl below',
        step2: 'Log into your Okta Admin Console',
        step3: 'Go to Applications > Your Application > General Settings',
        step4: 'Under "Sign-in redirect URIs", add the callbackUrl',
        step5: 'Under "Sign-out redirect URIs" (optional), add your NEXTAUTH_URL',
        step6: 'Click "Save"',
      },
      callbackUrl: callbackUrl,
      redirectUris: {
        required: [callbackUrl],
        optional: [nextAuthUrl, `${nextAuthUrl}/dashboard`],
      },
      verification: {
        callbackUrlMustContain: '/api/auth/callback/okta',
        callbackUrlMustStartWith: nextAuthUrl || 'Your NEXTAUTH_URL',
        isValid: callbackUrl.includes('/api/auth/callback/okta') && !!nextAuthUrl,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

