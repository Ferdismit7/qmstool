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
  const envSecrets = readSecretsFromEnv();
  if (envSecrets) {
    console.log('Secrets found in environment variables');
    cachedSecrets = envSecrets;
    syncProcessEnv(envSecrets);
    return envSecrets;
  }

  console.log('Secrets not found in environment, fetching from Lambda...');
  try {
    const lambdaSecrets = await fetchSecretsFromLambda();
    cachedSecrets = lambdaSecrets;
    syncProcessEnv(lambdaSecrets);
    console.log('Secrets successfully initialized');
    return lambdaSecrets;
  } catch (error) {
    console.error('Failed to get secrets:', error);
    throw error;
  }
};

export const initializeSecrets = async (): Promise<void> => {
  await getSecrets();
};