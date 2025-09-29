# PowerShell script to deploy the S3 upload Lambda function
# Run this from the lambda directory

Write-Host "Deploying S3 Upload Lambda Function..." -ForegroundColor Green

# Set variables
$FUNCTION_NAME = "uploadToS3"
$REGION = "eu-north-1"
$ROLE_NAME = "getSecretsLambdaRole"  # Reuse the existing role

Write-Host "Function Name: $FUNCTION_NAME" -ForegroundColor Yellow
Write-Host "Region: $REGION" -ForegroundColor Yellow
Write-Host "Role: $ROLE_NAME" -ForegroundColor Yellow

# Navigate to the function directory
Set-Location "uploadToS3"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm install

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Blue
Compress-Archive -Path "index.js", "package.json", "node_modules" -DestinationPath "../uploadToS3.zip" -Force

# Navigate back to lambda directory
Set-Location ".."

# Get the role ARN
Write-Host "Getting IAM role ARN..." -ForegroundColor Blue
$ROLE_ARN = aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text --region $REGION

if (-not $ROLE_ARN) {
    Write-Host "Failed to get IAM role ARN" -ForegroundColor Red
    exit 1
}

Write-Host "Role ARN: $ROLE_ARN" -ForegroundColor Yellow

# Check if function exists
Write-Host "Checking if function exists..." -ForegroundColor Blue
$FUNCTION_EXISTS = aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>$null

if ($FUNCTION_EXISTS) {
    Write-Host "Updating existing function..." -ForegroundColor Blue
    aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://uploadToS3.zip --region $REGION
} else {
    Write-Host "Creating new function..." -ForegroundColor Blue
    aws lambda create-function --function-name $FUNCTION_NAME --runtime nodejs18.x --role $ROLE_ARN --handler index.handler --zip-file fileb://uploadToS3.zip --description "S3 file upload Lambda function for QMS Tool" --timeout 30 --memory-size 256 --region $REGION
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Lambda function deployed successfully!" -ForegroundColor Green
    
    # Create Function URL
    Write-Host "Creating Function URL..." -ForegroundColor Blue
    $FUNCTION_URL = aws lambda create-function-url-config --function-name $FUNCTION_NAME --auth-type NONE --cors '{"AllowCredentials": false, "AllowHeaders": ["content-type"], "AllowMethods": ["POST", "OPTIONS"], "AllowOrigins": ["*"], "ExposeHeaders": [], "MaxAge": 86400}' --region $REGION --query 'FunctionUrl' --output text
    
    if ($FUNCTION_URL) {
        Write-Host "Function URL created: $FUNCTION_URL" -ForegroundColor Green
        Write-Host ""
        Write-Host "Add this to your Amplify environment variables:" -ForegroundColor Yellow
        Write-Host "S3_UPLOAD_LAMBDA_URL = $FUNCTION_URL" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "Function URL creation failed, but function was deployed" -ForegroundColor Yellow
    }
} else {
    Write-Host "Lambda function deployment failed" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item "uploadToS3.zip" -Force

Write-Host "Deployment complete!" -ForegroundColor Green