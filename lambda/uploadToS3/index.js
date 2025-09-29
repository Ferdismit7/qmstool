// Lambda function to upload files to S3
// This function acts as a secure proxy for S3 operations

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secretsClient = new SecretsManagerClient({ 
  region: process.env.AWS_REGION || "eu-north-1" 
});

exports.handler = async (event) => {
  console.log('S3 upload Lambda function invoked');
  
  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { fileData, fileName, contentType, businessArea, documentType, recordId } = body;
    
    if (!fileData || !fileName || !contentType || !businessArea || !documentType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required parameters'
        })
      };
    }
    
    // Get secrets from AWS Secrets Manager
    const secretsResponse = await secretsClient.send(
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    
  } catch (error) {
    console.error('S3 upload error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
