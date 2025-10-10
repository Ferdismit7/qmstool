# Deploy Lambda function for secrets management
# PowerShell script to create and deploy the getSecrets Lambda function

param(
    [string]$Region = "eu-north-1",
    [string]$FunctionName = "getSecrets"
)

Write-Host "🚀 Deploying Lambda function for secrets management..." -ForegroundColor Green

# Configuration
$RoleName = "qms-lambda-secrets-role"
$PolicyName = "qms-lambda-secrets-policy"

try {
    # Create IAM role for Lambda function
    Write-Host "📋 Creating IAM role for Lambda function..." -ForegroundColor Yellow

    # Create trust policy
    $trustPolicy = @"
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
"@

    $trustPolicy | Out-File -FilePath "trust-policy.json" -Encoding UTF8

    # Create the role
    try {
        aws iam create-role --role-name $RoleName --assume-role-policy-document file://trust-policy.json --region $Region
        Write-Host "✅ IAM role created successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Role may already exist, continuing..." -ForegroundColor Yellow
    }

    # Create policy for Secrets Manager access
    $secretsPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:${Region}:*:secret:qmssecretnamedb*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:${Region}:*:*"
    }
  ]
}
"@

    $secretsPolicy | Out-File -FilePath "secrets-policy.json" -Encoding UTF8

    # Attach the policy
    aws iam put-role-policy --role-name $RoleName --policy-name $PolicyName --policy-document file://secrets-policy.json --region $Region
    Write-Host "✅ IAM policy attached successfully" -ForegroundColor Green

    # Get the role ARN
    $roleArn = aws iam get-role --role-name $RoleName --query 'Role.Arn' --output text
    Write-Host "Role ARN: $roleArn" -ForegroundColor Cyan

    # Wait for role to be ready
    Write-Host "⏳ Waiting for IAM role to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    # Create deployment package
    Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
    Set-Location getSecrets
    npm install --production
    Compress-Archive -Path * -DestinationPath "../getSecrets.zip" -Force
    Set-Location ..

    # Deploy or update Lambda function
    Write-Host "🚀 Deploying Lambda function..." -ForegroundColor Yellow

    # Check if function exists
    try {
        aws lambda get-function --function-name $FunctionName --region $Region | Out-Null
        Write-Host "Updating existing Lambda function..." -ForegroundColor Yellow
        aws lambda update-function-code --function-name $FunctionName --zip-file fileb://getSecrets.zip --region $Region
    }
    catch {
        Write-Host "Creating new Lambda function..." -ForegroundColor Yellow
        aws lambda create-function --function-name $FunctionName --runtime nodejs18.x --role $roleArn --handler index.handler --zip-file fileb://getSecrets.zip --region $Region --timeout 30 --memory-size 256
    }

    # Clean up
    Remove-Item -Path "trust-policy.json" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "secrets-policy.json" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "getSecrets.zip" -Force -ErrorAction SilentlyContinue

    Write-Host "✅ Lambda function deployed successfully!" -ForegroundColor Green
    Write-Host "Function Name: $FunctionName" -ForegroundColor Cyan
    Write-Host "Region: $Region" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Set the LAMBDA_FUNCTION_NAME environment variable in your Amplify app:" -ForegroundColor White
    Write-Host "   LAMBDA_FUNCTION_NAME=$FunctionName" -ForegroundColor Gray
    Write-Host "2. Set the AWS_REGION environment variable:" -ForegroundColor White
    Write-Host "   AWS_REGION=$Region" -ForegroundColor Gray
    Write-Host "3. Test the function with: curl https://your-app.amplifyapp.com/api/test-lambda-secrets" -ForegroundColor White

}
catch {
    Write-Host "❌ Error deploying Lambda function: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
