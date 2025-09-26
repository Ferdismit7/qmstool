// lib/secretsManager.ts - AWS Secrets Manager Integration

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  // Let AWS SDK automatically find credentials from IAM role
});

interface Secrets {
  DATABASE_URL: string;
  JWT_SECRET: string;
  S3_BUCKET_NAME: string;
  REGION: string;
}

let cachedSecrets: Secrets | null = null;

/**
 * Get secrets from AWS Secrets Manager
 * This works at runtime in AWS Amplify
 */
export const getSecretsFromAWS = async (): Promise<Secrets> => {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  try {
    console.log('Fetching secrets from AWS Secrets Manager...');
    console.log('Region:', process.env.AWS_REGION || 'eu-north-1');
    console.log('Secret ID: qmssecretnamedb');
    
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: 'qmssecretnamedb',
        VersionStage: 'AWSCURRENT',
      })
    );
    
    console.log('AWS Secrets Manager response received');

    if (!response.SecretString) {
      throw new Error('No secret string found in response');
    }

    const rawSecrets = JSON.parse(response.SecretString);
    
    // Build DATABASE_URL from individual components
    const databaseUrl = `mysql://${rawSecrets.username}:${rawSecrets.password}@${rawSecrets.host}:${rawSecrets.port}/${rawSecrets.dbInstanceIdentifier}`;
    
    const secrets: Secrets = {
      DATABASE_URL: databaseUrl,
      JWT_SECRET: rawSecrets.JWT_SECRET,
      S3_BUCKET_NAME: rawSecrets.S3_BUCKET_NAME,
      REGION: rawSecrets.REGION,
    };

    // Set environment variables for the current process
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.S3_BUCKET_NAME = secrets.S3_BUCKET_NAME;
    process.env.REGION = secrets.REGION;

    cachedSecrets = secrets;
    console.log('✅ Secrets loaded from AWS Secrets Manager');
    
    return secrets;
  } catch (error) {
    console.error('❌ Failed to get secrets from AWS Secrets Manager:', error);
    throw error;
  }
};

/**
 * Initialize secrets - call this at the start of API routes
 */
export const initializeSecrets = async (): Promise<void> => {
  try {
    await getSecretsFromAWS();
  } catch (error) {
    console.error('Failed to initialize secrets:', error);
    throw error;
  }
};
