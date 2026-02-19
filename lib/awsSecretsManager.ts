const SECRET_KEYS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "S3_BUCKET_NAME",
  "REGION",
  "ACCESS_KEY_ID",
  "SECRET_ACCESS_KEY",
] as const;

type SecretKey = (typeof SECRET_KEYS)[number];

export type Secrets = Record<SecretKey, string>;

interface LambdaSecretsResponse {
  success: boolean;
  secrets?: Partial<Record<SecretKey, string>>;
  error?: string;
}

let cachedSecrets: Secrets | null = null;

const trimValue = (value?: string | null) => (typeof value === "string" ? value.trim() : undefined);

const hasAllSecrets = (candidate: Partial<Record<SecretKey, string>>): candidate is Secrets =>
  SECRET_KEYS.every((key) => {
    const value = candidate[key];
    return typeof value === "string" && value.trim().length > 0;
  });

const syncProcessEnv = (secrets: Secrets) => {
  SECRET_KEYS.forEach((key) => {
    process.env[key] = secrets[key];
  });
};

const readSecretsFromEnv = (): Secrets | null => {
  const fromEnv: Partial<Record<SecretKey, string>> = {};

  SECRET_KEYS.forEach((key) => {
    const value = trimValue(process.env[key]);
    if (value) {
      fromEnv[key] = value;
    }
  });

  if (hasAllSecrets(fromEnv)) {
    return fromEnv;
  }

  return null;
};

const fetchSecretsFromLambda = async (): Promise<Secrets> => {
  const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;

  if (!lambdaUrl) {
    const error = new Error("LAMBDA_FUNCTION_URL is not configured and secrets are not available in the environment.");
    console.error('Secrets initialization failed:', error.message);
    throw error;
  }

  try {
    console.log('Fetching secrets from Lambda:', lambdaUrl);
    const response = await fetch(lambdaUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read response body');
      const error = new Error(`Lambda function returned status: ${response.status}. Response: ${errorText}`);
      console.error('Lambda function error:', error.message);
      throw error;
    }

    const data = (await response.json()) as LambdaSecretsResponse;

    if (!data.success || !data.secrets || !hasAllSecrets(data.secrets)) {
      const error = new Error(data.error || "Lambda function did not return the required secrets.");
      console.error('Lambda secrets validation failed:', error.message);
      console.error('Response data:', JSON.stringify(data, null, 2));
      throw error;
    }

    console.log('Secrets successfully fetched from Lambda');
    return data.secrets;
  } catch (error) {
    console.error('Failed to fetch secrets from Lambda:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching secrets from Lambda');
  }
};

export const getSecretValue = (key: SecretKey): string | undefined => {
  if (process.env[key]) {
    return process.env[key];
  }

  if (cachedSecrets?.[key]) {
    return cachedSecrets[key];
  }

  return undefined;
};

export const getSecrets = async (): Promise<Secrets> => {
  if (cachedSecrets) {
    console.log('Using cached secrets');
    return cachedSecrets;
  }

  console.log('Initializing secrets...');
  
  // In Next.js 16 on Amplify, env vars set during build may not be available at runtime
  // Always try Lambda first for runtime, then fall back to env vars if Lambda fails
  const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
  
  if (lambdaUrl) {
    try {
      console.log('Fetching secrets from Lambda (preferred for Next.js 16 runtime)...');
      const lambdaSecrets = await fetchSecretsFromLambda();
      cachedSecrets = lambdaSecrets;
      syncProcessEnv(lambdaSecrets);
      console.log('Secrets successfully fetched from Lambda');
      return lambdaSecrets;
    } catch (lambdaError) {
      console.warn('Lambda fetch failed, falling back to environment variables:', lambdaError);
      // Fall through to try env vars
    }
  } else {
    console.log('No Lambda URL configured, checking environment variables...');
  }

  // Fallback to environment variables if Lambda is not available or fails
  const envSecrets = readSecretsFromEnv();
  if (envSecrets) {
    console.log('Secrets found in environment variables');
    cachedSecrets = envSecrets;
    syncProcessEnv(envSecrets);
    
    // Verify DATABASE_URL is actually accessible at runtime (Next.js 16 check)
    if (!process.env.DATABASE_URL) {
      const error = new Error(
        'DATABASE_URL is configured but not accessible at runtime. ' +
        'In Next.js 16 on Amplify, environment variables set during build may not be available at runtime. ' +
        'Ensure LAMBDA_FUNCTION_URL or NEXT_PUBLIC_LAMBDA_FUNCTION_URL is set to fetch secrets at runtime.'
      );
      console.error(error.message);
      throw error;
    }
    return envSecrets;
  }

  // If neither Lambda nor env vars work, throw error
  const error = new Error(
    'Unable to initialize secrets. ' +
    'Either set LAMBDA_FUNCTION_URL/NEXT_PUBLIC_LAMBDA_FUNCTION_URL for runtime secret fetching, ' +
    'or ensure all required environment variables (DATABASE_URL, JWT_SECRET, etc.) are available at runtime.'
  );
  console.error(error.message);
  throw error;
};

export const initializeSecrets = async (): Promise<void> => {
  await getSecrets();
};