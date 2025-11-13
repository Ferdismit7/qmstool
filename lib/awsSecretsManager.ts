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
  OKTA_ENABLED: string;
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
  // IMPORTANT: Check for non-empty strings, not just truthy values
  const hasCriticalEnvVars = !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_SECRET.trim().length > 0 &&
    process.env.NEXTAUTH_URL &&
    process.env.NEXTAUTH_URL.trim().length > 0 &&
    process.env.OKTA_CLIENT_ID &&
    process.env.OKTA_CLIENT_ID.trim().length > 0 &&
    process.env.OKTA_CLIENT_SECRET &&
    process.env.OKTA_CLIENT_SECRET.trim().length > 0 &&
    process.env.OKTA_ISSUER &&
    process.env.OKTA_ISSUER.trim().length > 0
  );

  if (hasCriticalEnvVars) {
    // TypeScript-safe: we know these exist from the check above
    const nextAuthSecret = process.env.NEXTAUTH_SECRET!;
    const nextAuthUrl = process.env.NEXTAUTH_URL!;
    const oktaClientId = process.env.OKTA_CLIENT_ID!;
    const oktaClientSecret = process.env.OKTA_CLIENT_SECRET!;
    const oktaIssuer = process.env.OKTA_ISSUER!;
    
    console.log("✅ [Secrets] Critical environment variables are already set, using them directly");
    console.log("🔑 [Secrets] Environment variables check:");
    console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '⚠️ OPTIONAL'}`);
    console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '⚠️ OPTIONAL'}`);
    console.log(`  - NEXTAUTH_SECRET: ✅ SET (${nextAuthSecret.length} chars)`);
    console.log(`  - NEXTAUTH_URL: ✅ SET (${nextAuthUrl})`);
    console.log(`  - OKTA_CLIENT_ID: ✅ SET (${oktaClientId.substring(0, 8)}...)`);
    console.log(`  - OKTA_CLIENT_SECRET: ✅ SET (${oktaClientSecret.length} chars)`);
    console.log(`  - OKTA_ISSUER: ✅ SET (${oktaIssuer})`);
    
    const oktaEnabledEnv = process.env.OKTA_ENABLED?.trim() ?? 'false';
    const envSecrets: Secrets = {
      DATABASE_URL: process.env.DATABASE_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1',
      REGION: process.env.REGION || 'eu-north-1',
      NEXTAUTH_SECRET: nextAuthSecret.trim(),
      NEXTAUTH_URL: nextAuthUrl.trim(),
      OKTA_CLIENT_ID: oktaClientId.trim(),
      OKTA_CLIENT_SECRET: oktaClientSecret.trim(),
      OKTA_ISSUER: oktaIssuer.trim(),
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID || '',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY || '',
      OKTA_ENABLED: oktaEnabledEnv === '' ? 'false' : oktaEnabledEnv,
    };
    
    // Ensure process.env is set with trimmed values
    process.env.NEXTAUTH_SECRET = envSecrets.NEXTAUTH_SECRET;
    process.env.NEXTAUTH_URL = envSecrets.NEXTAUTH_URL;
    process.env.OKTA_CLIENT_ID = envSecrets.OKTA_CLIENT_ID;
    process.env.OKTA_CLIENT_SECRET = envSecrets.OKTA_CLIENT_SECRET;
    process.env.OKTA_ISSUER = envSecrets.OKTA_ISSUER;
    process.env.OKTA_ENABLED = envSecrets.OKTA_ENABLED;
    process.env.NEXT_PUBLIC_OKTA_ENABLED = envSecrets.OKTA_ENABLED;
    
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
      const oktaEnabledFallback = process.env.OKTA_ENABLED?.trim() ?? 'false';
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
        OKTA_ENABLED: oktaEnabledFallback === '' ? 'false' : oktaEnabledFallback,
      };
      
    cachedSecrets = fallbackSecrets;
    process.env.OKTA_ENABLED = fallbackSecrets.OKTA_ENABLED;
    process.env.NEXT_PUBLIC_OKTA_ENABLED = fallbackSecrets.OKTA_ENABLED;
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

    const oktaEnabled = (data.secrets.OKTA_ENABLED ?? '').toString().trim() || 'false';
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
      OKTA_ENABLED: oktaEnabled,
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
    process.env.OKTA_ENABLED = secrets.OKTA_ENABLED;
    process.env.NEXT_PUBLIC_OKTA_ENABLED = secrets.OKTA_ENABLED;

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
    
    // Log what's available (check for non-empty strings)
    console.log("🔑 [Secrets] Available environment variables:");
    console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET?.trim() ? '✅' : '❌'}`);
    console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL?.trim() ? '✅' : '❌'}`);
    const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
    const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
    const oktaClientId = process.env.OKTA_CLIENT_ID?.trim();
    const oktaClientSecret = process.env.OKTA_CLIENT_SECRET?.trim();
    const oktaIssuer = process.env.OKTA_ISSUER?.trim();
    console.log(`  - NEXTAUTH_SECRET: ${nextAuthSecret ? `✅ (${nextAuthSecret.length} chars)` : '❌'}`);
    console.log(`  - NEXTAUTH_URL: ${nextAuthUrl ? `✅ (${nextAuthUrl})` : '❌'}`);
    console.log(`  - OKTA_CLIENT_ID: ${oktaClientId ? `✅ (${oktaClientId.substring(0, 8)}...)` : '❌'}`);
    console.log(`  - OKTA_CLIENT_SECRET: ${oktaClientSecret ? `✅ (${oktaClientSecret.length} chars)` : '❌'}`);
    console.log(`  - OKTA_ISSUER: ${oktaIssuer ? `✅ (${oktaIssuer})` : '❌'}`);
    
    // Check if critical NextAuth variables are available (even if Lambda failed)
    const oktaEnabledFromEnv = process.env.OKTA_ENABLED === 'true';
    const hasFallbackSecrets = !!(
      process.env.NEXTAUTH_SECRET &&
      process.env.NEXTAUTH_SECRET.trim().length > 0 &&
      process.env.NEXTAUTH_URL &&
      process.env.NEXTAUTH_URL.trim().length > 0 &&
      (
        !oktaEnabledFromEnv ||
        (
          process.env.OKTA_CLIENT_ID &&
          process.env.OKTA_CLIENT_ID.trim().length > 0 &&
          process.env.OKTA_CLIENT_SECRET &&
          process.env.OKTA_CLIENT_SECRET.trim().length > 0 &&
          process.env.OKTA_ISSUER &&
          process.env.OKTA_ISSUER.trim().length > 0
        )
      )
    );
    
    if (!hasFallbackSecrets) {
      console.error("❌ [Secrets] CRITICAL: Required NextAuth environment variables are missing!");
      console.error("❌ [Secrets] Please ensure these are set in AWS Amplify Console:");
      console.error("   - NEXTAUTH_SECRET");
      console.error("   - NEXTAUTH_URL");
      if (oktaEnabledFromEnv) {
        console.error("   - OKTA_CLIENT_ID");
        console.error("   - OKTA_CLIENT_SECRET");
        console.error("   - OKTA_ISSUER");
      }
      throw new Error("Required NextAuth environment variables are not available from either Lambda or Amplify Console");
    }
    
    // For NextAuth, we only absolutely need NEXTAUTH_SECRET and NEXTAUTH_URL
    // JWT_SECRET and DATABASE_URL can be empty for NextAuth-only auth
    const fallbackOktaEnabled = process.env.OKTA_ENABLED?.trim() ?? 'false';
    const fallbackSecrets: Secrets = {
      DATABASE_URL: process.env.DATABASE_URL?.trim() || '',
      JWT_SECRET: process.env.JWT_SECRET?.trim() || '',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME?.trim() || 'qms-tool-documents-qms-1',
      REGION: process.env.REGION?.trim() || 'eu-north-1',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!.trim(),
      NEXTAUTH_URL: process.env.NEXTAUTH_URL!.trim(),
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID?.trim()
        ? process.env.OKTA_CLIENT_ID.trim()
        : '',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET?.trim()
        ? process.env.OKTA_CLIENT_SECRET.trim()
        : '',
      OKTA_ISSUER: process.env.OKTA_ISSUER?.trim()
        ? process.env.OKTA_ISSUER.trim()
        : '',
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID?.trim() || '',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY?.trim() || '',
      OKTA_ENABLED: fallbackOktaEnabled === '' ? 'false' : fallbackOktaEnabled,
    };
    
    // Ensure process.env is set with trimmed values
    process.env.NEXTAUTH_SECRET = fallbackSecrets.NEXTAUTH_SECRET;
    process.env.NEXTAUTH_URL = fallbackSecrets.NEXTAUTH_URL;
    process.env.OKTA_CLIENT_ID = fallbackSecrets.OKTA_CLIENT_ID;
    process.env.OKTA_CLIENT_SECRET = fallbackSecrets.OKTA_CLIENT_SECRET;
    process.env.OKTA_ISSUER = fallbackSecrets.OKTA_ISSUER;
    process.env.OKTA_ENABLED = fallbackSecrets.OKTA_ENABLED;
    process.env.NEXT_PUBLIC_OKTA_ENABLED = fallbackSecrets.OKTA_ENABLED;
    
    cachedSecrets = fallbackSecrets;
    console.log("✅ [Secrets] Using fallback environment variables from Amplify Console");
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
 * This function prioritizes environment variables but always tries Lambda as fallback
 */
export const initializeSecrets = async (): Promise<void> => {
  try {
    // First check if environment variables are already set (from Amplify Console)
    const oktaEnabledFlag = process.env.OKTA_ENABLED === 'true';
    const hasEnvVars = !!(
      process.env.NEXTAUTH_SECRET && 
      process.env.NEXTAUTH_URL &&
      (
        !oktaEnabledFlag ||
        (
          process.env.OKTA_CLIENT_ID &&
          process.env.OKTA_CLIENT_SECRET &&
          process.env.OKTA_ISSUER
        )
      )
    );

    if (hasEnvVars) {
      console.log("✅ [Secrets] Environment variables detected, verifying they're available...");
      console.log("🔑 [Secrets] Environment variables check:", {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
        OKTA_ENABLED: process.env.OKTA_ENABLED || 'MISSING',
        OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
        OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
        OKTA_ISSUER: process.env.OKTA_ISSUER || 'MISSING',
      });
      
      // Verify the values are not empty strings
      if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL && 
          (!oktaEnabledFlag || (process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET && 
          process.env.OKTA_ISSUER))) {
        console.log("✅ [Secrets] All critical environment variables verified and available");
        // Still call getSecrets to populate cache
        await getSecrets();
        return;
      } else {
        console.warn("⚠️ [Secrets] Environment variables detected but some are empty, will try Lambda as fallback");
      }
    } else {
      console.log("⚠️ [Secrets] Environment variables not immediately available, will try Lambda");
    }

    // If env vars not available or incomplete, try to get from Lambda/cache
    try {
      await getSecrets();
      console.log("✅ [Secrets] Secrets retrieved from cache or Lambda");
      
      // getSecrets should have set process.env from either Lambda or env vars
      // Now verify they're actually set
      const finalCheck = !!(
        process.env.NEXTAUTH_SECRET && 
        process.env.NEXTAUTH_URL &&
        (
          process.env.OKTA_ENABLED !== 'true' ||
          (
            process.env.OKTA_CLIENT_ID &&
            process.env.OKTA_CLIENT_SECRET &&
            process.env.OKTA_ISSUER
          )
        )
      );
      
      if (!finalCheck) {
        console.error("❌ [Secrets] CRITICAL: Required environment variables are missing after getSecrets!");
        console.error("❌ [Secrets] Missing variables:", {
          NEXTAUTH_SECRET: !process.env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: !process.env.NEXTAUTH_URL,
        OKTA_ENABLED: process.env.OKTA_ENABLED,
        OKTA_CLIENT_ID: process.env.OKTA_ENABLED === 'true' ? !process.env.OKTA_CLIENT_ID : 'skipped',
        OKTA_CLIENT_SECRET: process.env.OKTA_ENABLED === 'true' ? !process.env.OKTA_CLIENT_SECRET : 'skipped',
        OKTA_ISSUER: process.env.OKTA_ENABLED === 'true' ? !process.env.OKTA_ISSUER : 'skipped',
        });
        throw new Error("Required NextAuth and Okta environment variables are not available from either environment variables or Lambda");
      }
      
      console.log("✅ [Secrets] All critical secrets verified and available after getSecrets");
    } catch (lambdaError) {
      console.error("❌ [Secrets] Error getting secrets from Lambda:", lambdaError);
      
      // Final fallback: check if env vars are now available (might have been set by Amplify)
      const finalEnvCheck = !!(
        process.env.NEXTAUTH_SECRET && 
        process.env.NEXTAUTH_URL &&
        (
          process.env.OKTA_ENABLED !== 'true' ||
          (
            process.env.OKTA_CLIENT_ID &&
            process.env.OKTA_CLIENT_SECRET &&
            process.env.OKTA_ISSUER
          )
        )
      );
      
      if (finalEnvCheck) {
        console.log("✅ [Secrets] Environment variables available after Lambda error (Amplify runtime injection)");
        return;
      }
      
      // If we get here, neither source worked
      throw lambdaError;
    }
  } catch (error) {
    console.error("❌ [Secrets] Failed to initialize secrets:", error);
    console.error("❌ [Secrets] Current process.env state:", {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
      OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: process.env.OKTA_ISSUER || 'MISSING',
      LAMBDA_FUNCTION_URL: !!process.env.LAMBDA_FUNCTION_URL,
      NEXT_PUBLIC_LAMBDA_FUNCTION_URL: !!process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL,
    });
    
    // Final check - sometimes Amplify injects them late
    const hasMinimum = !!(
      process.env.NEXTAUTH_SECRET && 
      process.env.NEXTAUTH_URL &&
      (
        process.env.OKTA_ENABLED !== 'true' ||
        (
          process.env.OKTA_CLIENT_ID &&
          process.env.OKTA_CLIENT_SECRET &&
          process.env.OKTA_ISSUER
        )
      )
    );
    
    if (hasMinimum) {
      console.log("✅ [Secrets] Final fallback: Environment variables are now available");
      return;
    }
    
    throw error;
  }
};