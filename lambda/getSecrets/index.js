// Lambda function to retrieve secrets from AWS Secrets Manager
// This function acts as a secure proxy for the Next.js app

const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ 
  region: process.env.AWS_REGION || "eu-north-1" 
});

exports.handler = async (event) => {
  console.log('Lambda function invoked with event:', JSON.stringify(event, null, 2));
  
  try {
    // Get the secret from AWS Secrets Manager
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: "qmssecretnamedb",
        VersionStage: "AWSCURRENT",
      })
    );
    
    console.log('Secret retrieved successfully from AWS Secrets Manager');
    
    if (!response.SecretString) {
      throw new Error('No secret string found in response');
    }

    const rawSecrets = JSON.parse(response.SecretString);
    
    // Build DATABASE_URL from individual components
    const databaseUrl = `mysql://${rawSecrets.username}:${rawSecrets.password}@${rawSecrets.host}:${rawSecrets.port}/${rawSecrets.dbInstanceIdentifier}`;
    
    const secrets = {
      DATABASE_URL: databaseUrl,
      JWT_SECRET: rawSecrets.JWT_SECRET,
      S3_BUCKET_NAME: rawSecrets.S3_BUCKET_NAME,
      REGION: rawSecrets.REGION,
    };

    console.log('Secrets processed successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        secrets: secrets,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error retrieving secrets:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
