// Lambda function to retrieve secrets from AWS Secrets Manager
// This function acts as a secure proxy for the Next.js app

const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ 
  region: process.env.AWS_REGION || "eu-north-1" 
});

exports.handler = async (event) => {
  console.log('Lambda function invoked with event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the request body if it's a POST request
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (parseError) {
        console.log('No JSON body or parse error, treating as GET request');
      }
    }
    
    // Handle file upload action
    if (requestBody.action === 'uploadFile') {
      return await handleFileUpload(requestBody);
    }
    
    // Default: Get secrets (existing functionality)
    return await getSecrets();
    
  } catch (error) {
    console.error('Error in Lambda handler:', error);
    
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

// Handle file upload to S3
const handleFileUpload = async (requestBody) => {
  const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
  
  const { fileData, fileName, contentType, businessArea, documentType, recordId } = requestBody;
  
  if (!fileData || !fileName || !contentType || !businessArea || !documentType) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: 'Missing required parameters'
      })
    };
  }
  
  // Get secrets from AWS Secrets Manager
  const secretsResponse = await client.send(
    new GetSecretValueCommand({
      SecretId: "qmssecretnamedb",
      VersionStage: "AWSCURRENT",
    })
  );
  
  if (!secretsResponse.SecretString) {
    throw new Error('No secret string found in response');
  }
  
  const secrets = JSON.parse(secretsResponse.SecretString);
  
  // Create S3 client with credentials from secrets
  const s3Client = new S3Client({
    region: secrets.REGION || "eu-north-1",
    credentials: {
      accessKeyId: secrets.ACCESS_KEY_ID,
      secretAccessKey: secrets.SECRET_ACCESS_KEY
    }
  });
  
  // Create organized file path
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${documentType}/${businessArea}/${recordId ? `${recordId}_` : ''}${timestamp}_${sanitizedFileName}`;
  
  console.log('Uploading to S3 with key:', key);
  
  // Convert base64 file data to buffer
  const fileBuffer = Buffer.from(fileData, 'base64');
  
  const command = new PutObjectCommand({
    Bucket: secrets.S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: {
      'business-area': businessArea,
      'document-type': documentType,
      'original-filename': fileName,
      'upload-date': new Date().toISOString(),
      'record-id': recordId?.toString() || '',
    },
  });
  
  await s3Client.send(command);
  console.log('S3 upload successful');
  
  // Return the file URL
  const url = `https://${secrets.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  
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
      data: {
        key: key,
        url: url,
        fileName: fileName,
        fileSize: fileBuffer.length,
        fileType: contentType,
        uploadedAt: new Date().toISOString()
      }
    })
  };
};

// Get secrets (existing functionality)
const getSecrets = async () => {
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
  // Use qmstool database which contains the actual application data
  const databaseName = 'qmstool';

  // Properly encode the password to handle special characters
  let encodedPassword;
  try {
    // First decode if it's already encoded, then re-encode properly
    const decodedPassword = decodeURIComponent(rawSecrets.password);
    encodedPassword = encodeURIComponent(decodedPassword);
  } catch (error) {
    // If decoding fails, just encode the raw password
    encodedPassword = encodeURIComponent(rawSecrets.password);
  }
  
  const databaseUrl = `mysql://${rawSecrets.username}:${encodedPassword}@${rawSecrets.host}:${rawSecrets.port}/${databaseName}`;
  
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
};
