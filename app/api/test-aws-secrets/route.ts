import { NextResponse } from 'next/server';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export async function GET() {
  try {
    console.log('Testing AWS Secrets Manager connection...');
    
    const secret_name = "qmssecretnamedb";
    
    const client = new SecretsManagerClient({
      region: "eu-north-1",
    });
    
    console.log('AWS client created, attempting to get secret...');
    
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );
    
    console.log('Secret retrieved successfully');
    
    if (!response.SecretString) {
      return NextResponse.json({ 
        error: "No secret string found in response",
        success: false 
      });
    }
    
    const secrets = JSON.parse(response.SecretString);
    
    // Return only the keys (not the values) for security
    const secretKeys = Object.keys(secrets);
    
    return NextResponse.json({ 
      success: true,
      message: "AWS Secrets Manager connection successful",
      secretKeys: secretKeys,
      hasJwtSecret: !!secrets.JWT_SECRET,
      jwtSecretLength: secrets.JWT_SECRET ? secrets.JWT_SECRET.length : 0
    });
    
  } catch (error) {
    console.error('AWS Secrets Manager test failed:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 });
  }
}
