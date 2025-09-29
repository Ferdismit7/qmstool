# Lambda Function for Secrets Management

This Lambda function acts as a secure proxy to retrieve secrets from AWS Secrets Manager for the QMS Tool application.

## Why This Approach?

AWS Amplify Hosting containers don't have AWS credentials by design for security reasons. This Lambda function provides a secure way to access secrets without exposing credentials to the frontend.

## Architecture

```
Next.js App (Amplify Hosting) → Lambda Function → AWS Secrets Manager
```

- **Next.js App**: Calls Lambda function via AWS SDK
- **Lambda Function**: Has IAM role with Secrets Manager permissions
- **AWS Secrets Manager**: Stores encrypted secrets

## Deployment

### Prerequisites

1. AWS CLI configured with appropriate permissions
2. Node.js 18+ installed
3. The secret `qmssecretnamedb` exists in AWS Secrets Manager

### Deploy the Lambda Function

#### Option 1: PowerShell (Windows)
```powershell
cd lambda
.\deploy-lambda.ps1
```

#### Option 2: Bash (Linux/Mac)
```bash
cd lambda
chmod +x deploy-lambda.sh
./deploy-lambda.sh
```

#### Option 3: Manual Deployment

1. **Create IAM Role**:
   ```bash
   aws iam create-role --role-name qms-lambda-secrets-role --assume-role-policy-document file://trust-policy.json
   ```

2. **Attach Policy**:
   ```bash
   aws iam put-role-policy --role-name qms-lambda-secrets-role --policy-name qms-lambda-secrets-policy --policy-document file://secrets-policy.json
   ```

3. **Create Deployment Package**:
   ```bash
   cd getSecrets
   npm install --production
   zip -r ../getSecrets.zip .
   cd ..
   ```

4. **Deploy Lambda Function**:
   ```bash
   aws lambda create-function \
     --function-name getSecrets \
     --runtime nodejs18.x \
     --role arn:aws:iam::YOUR_ACCOUNT:role/qms-lambda-secrets-role \
     --handler index.handler \
     --zip-file fileb://getSecrets.zip \
     --region eu-north-1
   ```

## Environment Variables

Set these environment variables in your Amplify app:

- `LAMBDA_FUNCTION_NAME`: Name of the Lambda function (default: "getSecrets")
- `AWS_REGION`: AWS region (default: "eu-north-1")

## Testing

After deployment, test the Lambda function:

```bash
curl https://your-app.amplifyapp.com/api/test-lambda-secrets
```

## IAM Permissions

The Lambda function needs these permissions:

```json
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
```

## Security Features

1. **No Credentials in Frontend**: The Next.js app never handles AWS credentials directly
2. **IAM Role-based Access**: Lambda function uses IAM role with minimal required permissions
3. **Secret Caching**: Secrets are cached in memory to reduce API calls
4. **Error Handling**: Graceful fallback to environment variables if Lambda fails
5. **CORS Headers**: Proper CORS configuration for web requests

## Troubleshooting

### Common Issues

1. **"Role not ready"**: Wait a few minutes after creating the IAM role
2. **"Access Denied"**: Check IAM permissions and secret ARN
3. **"Function not found"**: Verify function name and region
4. **"Timeout"**: Increase Lambda timeout in AWS Console

### Debug Steps

1. Check CloudWatch logs for the Lambda function
2. Verify IAM role permissions
3. Test the secret exists in Secrets Manager
4. Check environment variables in Amplify

### Logs

Lambda function logs are available in CloudWatch:
- Log Group: `/aws/lambda/getSecrets`
- Log Stream: Function execution logs

## Cost Optimization

- **Memory**: 256MB (sufficient for secrets retrieval)
- **Timeout**: 30 seconds (generous for API calls)
- **Caching**: Secrets cached in Next.js app to reduce Lambda invocations

## Monitoring

Monitor the Lambda function:
- Invocation count
- Error rate
- Duration
- Memory usage

Set up CloudWatch alarms for:
- High error rate
- Long duration
- High memory usage
