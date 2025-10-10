// lib/awsSecretsManager.ts - Lambda Function URL Integration for Secrets Management

interface LambdaSecretsResponse {
  success: boolean;
  secrets?: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    S3_BUCKET_NAME: string;
    REGION: string;
    NEXTAUTH_SECRET: string;
    OKTA_CLIENT_ID: string;
    OKTA_CLIENT_SECRET: string;
    OKTA_ISSUER: string;
  };
  error?: string;
}

interface Secrets {
  DATABASE_URL: string;
  JWT_SECRET: string;
  S3_BUCKET_NAME: string;
  REGION: string;
  NEXTAUTH_SECRET: string;
  OKTA_CLIENT_ID: string;
  OKTA_CLIENT_SECRET: string;
  OKTA_ISSUER: string;
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
    console.log("Calling Lambda function URL for secrets...");
    
    // Get Lambda function URL from environment variable
    const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    
    if (!lambdaUrl) {
      console.warn("LAMBDA_FUNCTION_URL not set, using fallback environment variables");
      // Fallback to environment variables if Lambda URL is not set
      const jwtSecret = process.env.JWT_SECRET;
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!jwtSecret || !databaseUrl) {
        throw new Error("Neither Lambda function URL nor required environment variables are set");
      }
      
      const fallbackSecrets: Secrets = {
        DATABASE_URL: databaseUrl,
        JWT_SECRET: jwtSecret,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1',
        REGION: process.env.REGION || 'eu-north-1',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
        OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
        OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET || '',
        OKTA_ISSUER: process.env.OKTA_ISSUER || '',
      };
      
      cachedSecrets = fallbackSecrets;
      return fallbackSecrets;
    }

    console.log("Lambda URL:", lambdaUrl);
    
    const response = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Lambda response status:", response.status);

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
      OKTA_CLIENT_ID: data.secrets.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: data.secrets.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: data.secrets.OKTA_ISSUER,
    };
    
    // Set environment variables
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.S3_BUCKET_NAME = secrets.S3_BUCKET_NAME;
    process.env.REGION = secrets.REGION;
    process.env.NEXTAUTH_SECRET = secrets.NEXTAUTH_SECRET;
    process.env.OKTA_CLIENT_ID = secrets.OKTA_CLIENT_ID;
    process.env.OKTA_CLIENT_SECRET = secrets.OKTA_CLIENT_SECRET;
    process.env.OKTA_ISSUER = secrets.OKTA_ISSUER;

    // Cache the secrets
    cachedSecrets = secrets;
    
    console.log("✅ Secrets retrieved successfully from Lambda function URL");
    return secrets;
  } catch (error) {
    console.error("Error retrieving secrets from Lambda function URL:", error);
    
    // Fallback to environment variables if Lambda fails
    console.warn("Lambda function failed, attempting fallback to environment variables");
    const jwtSecret = process.env.JWT_SECRET;
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!jwtSecret || !databaseUrl) {
      throw new Error("Lambda function failed and required environment variables are not set");
    }
    
    const fallbackSecrets: Secrets = {
      DATABASE_URL: databaseUrl,
      JWT_SECRET: jwtSecret,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1',
      REGION: process.env.REGION || 'eu-north-1',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET || '',
      OKTA_ISSUER: process.env.OKTA_ISSUER || '',
    };
    
    cachedSecrets = fallbackSecrets;
    console.log("✅ Using fallback environment variables");
    return fallbackSecrets;
  }
};

/**
 * Initialize secrets at application startup
 * Call this function at the beginning of your API routes
 */
export const initializeSecrets = async (): Promise<void> => {
  try {
    await getSecrets();
    console.log("✅ Secrets initialized successfully from Lambda function");
  } catch (error) {
    console.error("❌ Failed to initialize secrets:", error);
    throw error;
  }
};