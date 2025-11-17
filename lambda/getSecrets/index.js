const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "eu-north-1",
});

exports.handler = async (event) => {
  console.log("Lambda function invoked with event:", JSON.stringify(event, null, 2));

  try {
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch {
        console.log("No JSON body or parse error, treating as GET request");
      }
    }

    if (requestBody.action === "uploadFile") {
      return await handleFileUpload(requestBody);
    }

    return await getSecrets();
  } catch (error) {
    console.error("Error in Lambda handler:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

const getSecrets = async () => {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: "qmssecretnamedb",
      VersionStage: "AWSCURRENT",
    }),
  );

  console.log("Secret retrieved successfully from AWS Secrets Manager");

  if (!response.SecretString) {
    throw new Error("No secret string found in response");
  }

  const rawSecrets = JSON.parse(response.SecretString);

  const databaseName = "qmstool";
  let encodedPassword;
  try {
    const decodedPassword = decodeURIComponent(rawSecrets.password);
    encodedPassword = encodeURIComponent(decodedPassword);
  } catch {
    encodedPassword = encodeURIComponent(rawSecrets.password);
  }

  const databaseUrl = `mysql://${rawSecrets.username}:${encodedPassword}@${rawSecrets.host}:${rawSecrets.port}/${databaseName}`;

  const secrets = {
    DATABASE_URL: databaseUrl,
    JWT_SECRET: rawSecrets.JWT_SECRET,
    S3_BUCKET_NAME: rawSecrets.S3_BUCKET_NAME,
    REGION: rawSecrets.REGION,
    ACCESS_KEY_ID: rawSecrets.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: rawSecrets.SECRET_ACCESS_KEY,
  };

  console.log("Secrets processed successfully");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
    body: JSON.stringify({
      success: true,
      secrets,
      timestamp: new Date().toISOString(),
    }),
  };
};

const handleFileUpload = async (requestBody) => {
  const { fileData, fileName, contentType, businessArea, documentType, recordId } = requestBody;

  if (!fileData || !fileName || !contentType || !businessArea || !documentType) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        error: "Missing required parameters",
      }),
    };
  }

  const secretsResponse = await client.send(
    new GetSecretValueCommand({
      SecretId: "qmssecretnamedb",
      VersionStage: "AWSCURRENT",
    }),
  );

  if (!secretsResponse.SecretString) {
    throw new Error("No secret string found in response");
  }

  const secrets = JSON.parse(secretsResponse.SecretString);

  const s3Client = new S3Client({
    region: secrets.REGION || "eu-north-1",
    credentials: {
      accessKeyId: secrets.ACCESS_KEY_ID,
      secretAccessKey: secrets.SECRET_ACCESS_KEY,
    },
  });

  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${documentType}/${businessArea}/${recordId ? `${recordId}_` : ""}${timestamp}_${sanitizedFileName}`;

  console.log("Uploading to S3 with key:", key);

  const fileBuffer = Buffer.from(fileData, "base64");

  const command = new PutObjectCommand({
    Bucket: secrets.S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: {
      "business-area": businessArea,
      "document-type": documentType,
      "original-filename": fileName,
      "upload-date": new Date().toISOString(),
      "record-id": recordId?.toString() || "",
    },
  });

  await s3Client.send(command);
  console.log("S3 upload successful");

  const url = `https://${secrets.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify({
      success: true,
      data: {
        key,
        url,
        fileName,
        fileSize: fileBuffer.length,
        fileType: contentType,
        uploadedAt: new Date().toISOString(),
      },
    }),
  };
};
