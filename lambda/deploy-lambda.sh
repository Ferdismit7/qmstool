#!/bin/bash

# Deploy Lambda function for secrets management
# This script creates and deploys the getSecrets Lambda function

set -e

echo "🚀 Deploying Lambda function for secrets management..."

# Configuration
FUNCTION_NAME="getSecrets"
REGION="eu-north-1"
ROLE_NAME="qms-lambda-secrets-role"
POLICY_NAME="qms-lambda-secrets-policy"

# Create IAM role for Lambda function
echo "📋 Creating IAM role for Lambda function..."

# Create trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the role
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document file://trust-policy.json \
  --region $REGION || echo "Role may already exist"

# Create policy for Secrets Manager access
cat > secrets-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:${REGION}:*:secret:qmssecretnamedb*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:${REGION}:*:*"
    }
  ]
}
EOF

# Attach the policy
aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name $POLICY_NAME \
  --policy-document file://secrets-policy.json \
  --region $REGION

# Get the role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
echo "Role ARN: $ROLE_ARN"

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 10

# Create deployment package
echo "📦 Creating deployment package..."
cd getSecrets
npm install --production
zip -r ../getSecrets.zip . -x "*.git*" "*.DS_Store*"
cd ..

# Deploy or update Lambda function
echo "🚀 Deploying Lambda function..."

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://getSecrets.zip \
    --region $REGION
else
  echo "Creating new Lambda function..."
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs18.x \
    --role $ROLE_ARN \
    --handler index.handler \
    --zip-file fileb://getSecrets.zip \
    --region $REGION \
    --timeout 30 \
    --memory-size 256
fi

# Clean up
rm -f trust-policy.json secrets-policy.json getSecrets.zip

echo "✅ Lambda function deployed successfully!"
echo "Function Name: $FUNCTION_NAME"
echo "Region: $REGION"
echo ""
echo "🔧 Next steps:"
echo "1. Set the LAMBDA_FUNCTION_NAME environment variable in your Amplify app:"
echo "   LAMBDA_FUNCTION_NAME=$FUNCTION_NAME"
echo "2. Set the AWS_REGION environment variable:"
echo "   AWS_REGION=$REGION"
echo "3. Test the function with: curl https://your-app.amplifyapp.com/api/test-lambda-secrets"
