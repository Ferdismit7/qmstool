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
 */
export const getSecrets = async (): Promise<Secrets> => {
  // Return cached secrets if available
  if (cachedSecrets) {
    return cachedSecrets;
  }

  try {
    console.log("🔑 [Secrets] Calling Lambda function URL for secrets...");
    
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
    return fallbackSecrets;
  }
};

/**
 * Initialize secrets at application startup
 * Call this function at the beginning of your API routes
 */
export const initializeSecrets = async (): Promise<void> => {
  try {
    const secrets = await getSecrets();
    console.log("✅ Secrets initialized successfully");
    
    // Verify critical secrets are available
    if (!secrets.NEXTAUTH_SECRET || !secrets.NEXTAUTH_URL) {
      console.warn("⚠️ [Secrets] Critical NextAuth secrets missing!");
      throw new Error("Critical secrets (NEXTAUTH_SECRET, NEXTAUTH_URL) are not available");
    }
    
    console.log("✅ [Secrets] All critical secrets verified");
  } catch (error) {
    console.error("❌ Failed to initialize secrets:", error);
    // Don't throw if we're using fallback environment variables successfully
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL) {
      console.log("✅ [Secrets] Fallback environment variables are available, continuing...");
      return;
    }
    throw error;
  }
};