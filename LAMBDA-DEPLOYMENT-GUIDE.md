# Lambda Function Deployment Guide

This guide will help you deploy the Lambda function for secrets management in your QMS Tool application.

## 🎯 Overview

The Lambda function acts as a secure proxy between your Next.js app and AWS Secrets Manager, solving the issue where Amplify Hosting containers don't have AWS credentials.

## 📋 Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Node.js 18+** installed
3. **The secret `qmssecretnamedb`** exists in AWS Secrets Manager
4. **AWS Account** with permissions to create Lambda functions and IAM roles

## 🚀 Quick Deployment

### Step 1: Deploy the Lambda Function

#### Windows (PowerShell):
```powershell
cd lambda
.\deploy-lambda.ps1
```

#### Linux/Mac (Bash):
```bash
cd lambda
chmod +x deploy-lambda.sh
./deploy-lambda.sh
```

### Step 2: Set Environment Variables in Amplify

In your AWS Amplify Console:

1. Go to your app → **Environment variables**
2. Add these variables:
   ```
   LAMBDA_FUNCTION_NAME=getSecrets
   AWS_REGION=eu-north-1
   ```

### Step 3: Test the Deployment

After deployment, test the Lambda function:
```bash
curl https://your-app.amplifyapp.com/api/test-lambda-secrets
```

## 🔧 Manual Deployment (Alternative)

If the automated script doesn't work, follow these manual steps:

### 1. Create IAM Role

```bash
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
  --role-name qms-lambda-secrets-role \
  --assume-role-policy-document file://trust-policy.json
```

### 2. Attach IAM Policy

```bash
# Create secrets policy
cat > secrets-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:eu-north-1:*:secret:qmssecretnamedb*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:eu-north-1:*:*"
    }
  ]
}
EOF

# Attach the policy
aws iam put-role-policy \
  --role-name qms-lambda-secrets-role \
  --policy-name qms-lambda-secrets-policy \
  --policy-document file://secrets-policy.json
```

### 3. Create Deployment Package

```bash
cd lambda/getSecrets
npm install --production
zip -r ../getSecrets.zip .
cd ..
```

### 4. Deploy Lambda Function

```bash
# Get the role ARN
ROLE_ARN=$(aws iam get-role --role-name qms-lambda-secrets-role --query 'Role.Arn' --output text)

# Create the function
aws lambda create-function \
  --function-name getSecrets \
  --runtime nodejs18.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://getSecrets.zip \
  --region eu-north-1 \
  --timeout 30 \
  --memory-size 256
```

## 🧪 Testing

### Test the Lambda Function Directly

```bash
aws lambda invoke \
  --function-name getSecrets \
  --payload '{"action":"fetch"}' \
  --region eu-north-1 \
  response.json

cat response.json
```

### Test via API Endpoint

```bash
curl https://your-app.amplifyapp.com/api/test-lambda-secrets
```

Expected response:
```json
{
  "success": true,
  "message": "Lambda-based secrets manager working correctly",
  "environmentVariables": {
    "DATABASE_URL": "SET",
    "JWT_SECRET": "SET",
    "S3_BUCKET_NAME": "SET",
    "REGION": "SET",
    "LAMBDA_FUNCTION_NAME": "SET",
    "AWS_REGION": "SET"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Role not ready"**
   - Wait 2-3 minutes after creating the IAM role
   - AWS needs time to propagate the role

2. **"Access Denied"**
   - Check IAM permissions
   - Verify the secret ARN matches your region
   - Ensure the secret exists in Secrets Manager

3. **"Function not found"**
   - Verify function name and region
   - Check if function was created successfully

4. **"Timeout"**
   - Increase Lambda timeout in AWS Console
   - Check CloudWatch logs for errors

### Debug Steps

1. **Check CloudWatch Logs**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/getSecrets"
   ```

2. **Test IAM Permissions**:
   ```bash
   aws iam get-role --role-name qms-lambda-secrets-role
   aws iam get-role-policy --role-name qms-lambda-secrets-role --policy-name qms-lambda-secrets-policy
   ```

3. **Verify Secret Exists**:
   ```bash
   aws secretsmanager describe-secret --secret-id qmssecretnamedb --region eu-north-1
   ```

## 📊 Monitoring

### CloudWatch Metrics

Monitor these metrics:
- **Invocations**: Number of function calls
- **Errors**: Failed invocations
- **Duration**: Execution time
- **Memory Usage**: Memory consumption

### Set Up Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "Lambda-Secrets-High-Error-Rate" \
  --alarm-description "High error rate for secrets Lambda" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=getSecrets
```

## 🔒 Security Best Practices

1. **Least Privilege**: Lambda function only has access to the specific secret
2. **No Credentials in Code**: All access is via IAM roles
3. **Encryption**: Secrets are encrypted at rest and in transit
4. **Logging**: All access is logged in CloudWatch
5. **Caching**: Secrets cached in memory to reduce API calls

## 💰 Cost Optimization

- **Memory**: 256MB (sufficient for secrets retrieval)
- **Timeout**: 30 seconds (generous for API calls)
- **Caching**: Reduces Lambda invocations
- **Free Tier**: First 1M requests per month are free

## 🔄 Updates

To update the Lambda function:

```bash
cd lambda/getSecrets
# Make your changes
npm install --production
zip -r ../getSecrets.zip .
cd ..

aws lambda update-function-code \
  --function-name getSecrets \
  --zip-file fileb://getSecrets.zip \
  --region eu-north-1
```

## 📞 Support

If you encounter issues:

1. Check CloudWatch logs
2. Verify IAM permissions
3. Test the secret exists
4. Check environment variables
5. Review the troubleshooting section above

## ✅ Verification Checklist

- [ ] Lambda function deployed successfully
- [ ] IAM role has correct permissions
- [ ] Environment variables set in Amplify
- [ ] Test endpoint returns success
- [ ] CloudWatch logs show no errors
- [ ] Application can access secrets
