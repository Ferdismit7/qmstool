// lib/awsSecretsManager.ts - Lambda Function URL Integration for Secrets Management

interface LambdaSecretsResponse {
  success: boolean;
  secrets?: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    S3_BUCKET_NAME: string;
    REGION: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    OKTA_CLIENT_ID: string;
    OKTA_CLIENT_SECRET: string;
    OKTA_ISSUER: string;
    ACCESS_KEY_ID: string;
    SECRET_ACCESS_KEY: string;
  };
  error?: string;
}

interface Secrets {
  DATABASE_URL: string;
  JWT_SECRET: string;
  S3_BUCKET_NAME: string;
  REGION: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  OKTA_CLIENT_ID: string;
  OKTA_CLIENT_SECRET: string;
  OKTA_ISSUER: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
}

let cachedSecrets: Secrets | null = null;

/**
 * Retrieve secrets from Lambda function URL
 * Uses caching to avoid multiple API calls
 * PRIORITIZES environment variables if they're already set (build-time config)
 */
export const getSecrets = async (): Promise<Secrets> => {
  // Return cached secrets if available
  if (cachedSecrets) {
    return cachedSecrets;
  }

  // PRIORITY 1: Check if critical environment variables are already set (build-time in Amplify)
  // If they are, use them directly without calling Lambda
  const hasCriticalEnvVars = !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_URL &&
    process.env.OKTA_CLIENT_ID &&
    process.env.OKTA_CLIENT_SECRET &&
    process.env.OKTA_ISSUER
  );

  if (hasCriticalEnvVars) {
    console.log("✅ [Secrets] Critical environment variables are already set, using them directly");
    console.log("🔑 [Secrets] Environment variables check:");
    console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '⚠️ OPTIONAL'}`);
    console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '⚠️ OPTIONAL'}`);
    console.log(`  - NEXTAUTH_SECRET: ✅ SET`);
    console.log(`  - NEXTAUTH_URL: ✅ SET`);
    console.log(`  - OKTA_CLIENT_ID: ✅ SET`);
    console.log(`  - OKTA_CLIENT_SECRET: ✅ SET`);
    console.log(`  - OKTA_ISSUER: ✅ SET`);
    
    const envSecrets: Secrets = {
      DATABASE_URL: process.env.DATABASE_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1',
      REGION: process.env.REGION || 'eu-north-1',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET || '',
      OKTA_ISSUER: process.env.OKTA_ISSUER || '',
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID || '',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY || '',
    };
    
    cachedSecrets = envSecrets;
    console.log("✅ [Secrets] Using environment variables directly (skip Lambda call)");
    return envSecrets;
  }

  // PRIORITY 2: Try Lambda function if environment variables are not available
  try {
    console.log("🔑 [Secrets] Critical env vars not found, calling Lambda function URL for secrets...");
    
    // Get Lambda function URL from environment variable
    const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    
    if (!lambdaUrl) {
      console.warn("⚠️ [Secrets] LAMBDA_FUNCTION_URL not set, using fallback environment variables");
      
      console.log("🔑 [Secrets] Checking fallback environment variables:");
      console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING'}`);
      console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ MISSING'}`);
      console.log(`  - NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING'}`);
      console.log(`  - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅ SET' : '❌ MISSING'}`);
      console.log(`  - OKTA_CLIENT_ID: ${process.env.OKTA_CLIENT_ID ? '✅ SET' : '❌ MISSING'}`);
      console.log(`  - OKTA_CLIENT_SECRET: ${process.env.OKTA_CLIENT_SECRET ? '✅ SET' : '❌ MISSING'}`);
      console.log(`  - OKTA_ISSUER: ${process.env.OKTA_ISSUER ? '✅ SET' : '❌ MISSING'}`);
      
      // For NextAuth, we only need NextAuth-specific variables
      // JWT_SECRET and DATABASE_URL can be empty for NextAuth-only auth
      const fallbackSecrets: Secrets = {
        DATABASE_URL: process.env.DATABASE_URL || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1',
        REGION: process.env.REGION || 'eu-north-1',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
        OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
        OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET || '',
        OKTA_ISSUER: process.env.OKTA_ISSUER || '',
        ACCESS_KEY_ID: process.env.ACCESS_KEY_ID || '',
        SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY || '',
      };
      
    cachedSecrets = fallbackSecrets;
    console.log("✅ [Secrets] Using fallback environment variables");
    console.log("🔑 [Secrets] Fallback AWS Credentials check:", {
      hasAccessKey: !!fallbackSecrets.ACCESS_KEY_ID,
      accessKeyLength: fallbackSecrets.ACCESS_KEY_ID?.length || 0,
      accessKeyPreview: fallbackSecrets.ACCESS_KEY_ID ? `${fallbackSecrets.ACCESS_KEY_ID.substring(0, 4)}...` : 'EMPTY',
      hasSecretKey: !!fallbackSecrets.SECRET_ACCESS_KEY,
      secretKeyLength: fallbackSecrets.SECRET_ACCESS_KEY?.length || 0
    });
    return fallbackSecrets;
    }

    console.log("🔑 [Secrets] Lambda URL:", lambdaUrl);
    
    const response = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("🔑 [Secrets] Lambda response status:", response.status);

    if (!response.ok) {
      throw new Error(`Lambda function returned status: ${response.status}`);
    }

    const data: LambdaSecretsResponse = await response.json();
    console.log("Lambda response data:", data);

    if (!data.success || !data.secrets) {
      console.error("Lambda function failed:", data.error);
      throw new Error(data.error || "Lambda function returned unsuccessful response");
    }

    const secrets: Secrets = {
      DATABASE_URL: data.secrets.DATABASE_URL,
      JWT_SECRET: data.secrets.JWT_SECRET,
      S3_BUCKET_NAME: data.secrets.S3_BUCKET_NAME,
      REGION: data.secrets.REGION,
      NEXTAUTH_SECRET: data.secrets.NEXTAUTH_SECRET,
      NEXTAUTH_URL: data.secrets.NEXTAUTH_URL,
      OKTA_CLIENT_ID: data.secrets.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: data.secrets.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: data.secrets.OKTA_ISSUER,
      ACCESS_KEY_ID: data.secrets.ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: data.secrets.SECRET_ACCESS_KEY,
    };
    
    // Set environment variables
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.S3_BUCKET_NAME = secrets.S3_BUCKET_NAME;
    process.env.REGION = secrets.REGION;
    process.env.NEXTAUTH_SECRET = secrets.NEXTAUTH_SECRET;
    process.env.NEXTAUTH_URL = secrets.NEXTAUTH_URL;
    process.env.OKTA_CLIENT_ID = secrets.OKTA_CLIENT_ID;
    process.env.OKTA_CLIENT_SECRET = secrets.OKTA_CLIENT_SECRET;
    process.env.OKTA_ISSUER = secrets.OKTA_ISSUER;
    process.env.ACCESS_KEY_ID = secrets.ACCESS_KEY_ID;
    process.env.SECRET_ACCESS_KEY = secrets.SECRET_ACCESS_KEY;

    // Cache the secrets
    cachedSecrets = secrets;
    
    console.log("✅ Secrets retrieved successfully from Lambda function URL");
    console.log("🔑 [Secrets] AWS Credentials check:", {
      hasAccessKey: !!secrets.ACCESS_KEY_ID,
      accessKeyLength: secrets.ACCESS_KEY_ID?.length || 0,
      accessKeyPreview: secrets.ACCESS_KEY_ID ? `${secrets.ACCESS_KEY_ID.substring(0, 4)}...` : 'EMPTY',
      hasSecretKey: !!secrets.SECRET_ACCESS_KEY,
      secretKeyLength: secrets.SECRET_ACCESS_KEY?.length || 0
    });
    return secrets;
  } catch (error) {
    console.error("❌ [Secrets] Error retrieving secrets from Lambda function URL:", error);
    console.error("❌ [Secrets] Error details:", error instanceof Error ? error.message : 'Unknown error');
    
    // Fallback to environment variables if Lambda fails
    console.warn("⚠️ [Secrets] Lambda function failed, attempting fallback to environment variables");
    
    // Log what's available
    console.log("🔑 [Secrets] Available environment variables:");
    console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
    console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅' : '❌'}`);
    console.log(`  - NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅' : '❌'}`);
    console.log(`  - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅' : '❌'}`);
    console.log(`  - OKTA_CLIENT_ID: ${process.env.OKTA_CLIENT_ID ? '✅' : '❌'}`);
    console.log(`  - OKTA_CLIENT_SECRET: ${process.env.OKTA_CLIENT_SECRET ? '✅' : '❌'}`);
    console.log(`  - OKTA_ISSUER: ${process.env.OKTA_ISSUER ? '✅' : '❌'}`);
    
    // For NextAuth, we only absolutely need NEXTAUTH_SECRET and NEXTAUTH_URL
    // JWT_SECRET and DATABASE_URL can be empty for NextAuth-only auth
    const fallbackSecrets: Secrets = {
      DATABASE_URL: process.env.DATABASE_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1',
      REGION: process.env.REGION || 'eu-north-1',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET || '',
      OKTA_ISSUER: process.env.OKTA_ISSUER || '',
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID || '',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY || '',
    };
    
    cachedSecrets = fallbackSecrets;
    console.log("✅ [Secrets] Using fallback environment variables");
    console.log("🔑 [Secrets] Fallback AWS Credentials check:", {
      hasAccessKey: !!fallbackSecrets.ACCESS_KEY_ID,
      accessKeyLength: fallbackSecrets.ACCESS_KEY_ID?.length || 0,
      accessKeyPreview: fallbackSecrets.ACCESS_KEY_ID ? `${fallbackSecrets.ACCESS_KEY_ID.substring(0, 4)}...` : 'EMPTY',
      hasSecretKey: !!fallbackSecrets.SECRET_ACCESS_KEY,
      secretKeyLength: fallbackSecrets.SECRET_ACCESS_KEY?.length || 0
    });
    return fallbackSecrets;
  }
};

/**
 * Initialize secrets at application startup
 * Call this function at the beginning of your API routes
 * This function now prioritizes environment variables (build-time in Amplify) over Lambda
 */
export const initializeSecrets = async (): Promise<void> => {
  try {
    // First check if environment variables are already set (they should be in Amplify)
    const hasEnvVars = !!(
      process.env.NEXTAUTH_SECRET && 
      process.env.NEXTAUTH_URL &&
      process.env.OKTA_CLIENT_ID &&
      process.env.OKTA_CLIENT_SECRET &&
      process.env.OKTA_ISSUER
    );

    if (hasEnvVars) {
      console.log("✅ [Secrets] Environment variables already available (build-time config), skipping Lambda call");
      console.log("🔑 [Secrets] Verified environment variables:", {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
        OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
        OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
        OKTA_ISSUER: process.env.OKTA_ISSUER || 'MISSING',
      });
      // Still call getSecrets to populate cache, but it will use env vars
      await getSecrets();
      console.log("✅ [Secrets] All critical secrets verified and available from environment variables");
      return;
    }

    // If env vars not available, try to get from Lambda/cache
    const secrets = await getSecrets();
    console.log("✅ Secrets retrieved from cache or Lambda");
    
    // Verify critical secrets are available
    if (!secrets.NEXTAUTH_SECRET || !secrets.NEXTAUTH_URL) {
      console.warn("⚠️ [Secrets] Critical NextAuth secrets missing from retrieved secrets!");
      // Check if they're in environment variables (might have been set directly)
      if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
        throw new Error("Critical secrets (NEXTAUTH_SECRET, NEXTAUTH_URL) are not available");
      }
      console.log("✅ [Secrets] Using environment variables as fallback");
    }
    
    // Double-check environment variables are set after getSecrets
    console.log("🔑 [Secrets] Verifying environment variables after initialization:", {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
      OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: process.env.OKTA_ISSUER || 'MISSING',
    });
    
    if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL || 
        !process.env.OKTA_CLIENT_ID || !process.env.OKTA_CLIENT_SECRET || !process.env.OKTA_ISSUER) {
      console.error("❌ [Secrets] CRITICAL: Required environment variables are missing after initialization!");
      throw new Error("Required NextAuth and Okta environment variables are not set");
    }
    
    console.log("✅ [Secrets] All critical secrets verified and available");
  } catch (error) {
    console.error("❌ Failed to initialize secrets:", error);
    // Check if we have the minimum required vars for NextAuth to work
    const hasMinimum = !!(
      process.env.NEXTAUTH_SECRET && 
      process.env.NEXTAUTH_URL &&
      process.env.OKTA_CLIENT_ID &&
      process.env.OKTA_CLIENT_SECRET &&
      process.env.OKTA_ISSUER
    );
    
    if (hasMinimum) {
      console.log("✅ [Secrets] Fallback: All required environment variables are available");
      return;
    }
    
    throw error;
  }
};