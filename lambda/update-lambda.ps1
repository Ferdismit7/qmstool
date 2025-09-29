# Update Lambda function with database URL fix
# PowerShell script to update the existing Lambda function

param(
    [string]$Region = "eu-north-1",
    [string]$FunctionName = "getSecrets"
)

Write-Host "🔄 Updating Lambda function for database URL fix..." -ForegroundColor Green

try {
    # Create deployment package
    Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
    Set-Location getSecrets
    npm install --production
    Compress-Archive -Path * -DestinationPath "../getSecrets.zip" -Force
    Set-Location ..

    # Update Lambda function code
    Write-Host "🚀 Updating Lambda function code..." -ForegroundColor Yellow
    aws lambda update-function-code --function-name $FunctionName --zip-file fileb://getSecrets.zip --region $Region

    # Clean up
    Remove-Item -Path "getSecrets.zip" -Force -ErrorAction SilentlyContinue

    Write-Host "✅ Lambda function updated successfully!" -ForegroundColor Green
    Write-Host "Function Name: $FunctionName" -ForegroundColor Cyan
    Write-Host "Region: $Region" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🧪 Test the updated function:" -ForegroundColor Yellow
    Write-Host "curl https://alr5jakrzzxtlwhrj4z4aw4kzq0eobwv.lambda-url.eu-north-1.on.aws/" -ForegroundColor White

}
catch {
    Write-Host "❌ Error updating Lambda function: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
