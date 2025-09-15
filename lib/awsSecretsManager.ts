import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "qmssecretnamedb";

const client = new SecretsManagerClient({
  region: "eu-north-1",
  // AWS Amplify will automatically use the IAM role attached to the service
});

interface Secrets {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbInstanceIdentifier: string;
  JWT_SECRET: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  REGION: string;
}

let cachedSecrets: Secrets | null = null;

/**
 * Retrieve secrets from AWS Secrets Manager
 * Uses caching to avoid multiple API calls
 */
export const getSecrets = async (): Promise<Secrets> => {
  // Return cached secrets if available
  if (cachedSecrets) {
    return cachedSecrets;
  }

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );

    if (!response.SecretString) {
      throw new Error("No secret string found in response");
    }

    const secrets: Secrets = JSON.parse(response.SecretString);
    
    // Build DATABASE_URL from individual components
    const databaseUrl = `mysql://${secrets.username}:${secrets.password}@${secrets.host}:${secrets.port}/${secrets.dbInstanceIdentifier}`;
    
    // Set environment variables
    process.env.DATABASE_URL = databaseUrl;
    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.ACCESS_KEY_ID = secrets.ACCESS_KEY_ID;
    process.env.SECRET_ACCESS_KEY = secrets.SECRET_ACCESS_KEY;
    process.env.S3_BUCKET_NAME = secrets.S3_BUCKET_NAME;
    process.env.REGION = secrets.REGION;

    // Cache the secrets
    cachedSecrets = secrets;
    
    return secrets;
  } catch (error) {
    console.error("Error retrieving secrets from AWS Secrets Manager:", error);
    throw new Error("Failed to retrieve secrets from AWS Secrets Manager");
  }
};

/**
 * Initialize secrets at application startup
 * Call this function at the beginning of your API routes
 */
export const initializeSecrets = async (): Promise<void> => {
  try {
    await getSecrets();
    console.log("✅ Secrets initialized successfully from AWS Secrets Manager");
  } catch (error) {
    console.error("❌ Failed to initialize secrets:", error);
    throw error;
  }
};
