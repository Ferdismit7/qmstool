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
    throw new Error("LAMBDA_FUNCTION_URL is not configured and secrets are not available in the environment.");
  }

  const response = await fetch(lambdaUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Lambda function returned status: ${response.status}`);
  }

  const data = (await response.json()) as LambdaSecretsResponse;

  if (!data.success || !data.secrets || !hasAllSecrets(data.secrets)) {
    throw new Error(data.error || "Lambda function did not return the required secrets.");
  }

  return data.secrets;
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
    return cachedSecrets;
  }

  const envSecrets = readSecretsFromEnv();
  if (envSecrets) {
    cachedSecrets = envSecrets;
    syncProcessEnv(envSecrets);
    return envSecrets;
  }

  const lambdaSecrets = await fetchSecretsFromLambda();
  cachedSecrets = lambdaSecrets;
  syncProcessEnv(lambdaSecrets);
  return lambdaSecrets;
};

export const initializeSecrets = async (): Promise<void> => {
  await getSecrets();
};