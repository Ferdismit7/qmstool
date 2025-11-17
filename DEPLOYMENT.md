# 🚀 Deployment Guide - AWS Amplify with Secrets Manager

## Overview

This application uses **AWS Secrets Manager** for secure secrets management during deployment. Secrets are fetched directly during the Amplify build process using IAM roles, eliminating the need for manual environment variable configuration.

---

## 🔐 Architecture

```
AWS Amplify Build
       ↓
   IAM Role (Amplify Service Role)
       ↓
   AWS Secrets Manager (qmssecretnamedb)
       ↓
   Secrets Exported as Environment Variables
       ↓
   Next.js Build Process
       ↓
   Runtime (Secrets in process.env)
```

---

## 📋 Prerequisites

### 1. AWS Secrets Manager Secret

**Secret Name:** `qmssecretnamedb`  
**Region:** `eu-north-1`

**Required Keys in Secret:**
```json
{
  "username": "admin",
  "password": "your-db-password",
  "host": "database-qms-1.cvwog4weiwge.eu-north-1.rds.amazonaws.com",
  "port": 3306,
  "JWT_SECRET": "your-jwt-secret",
  "S3_BUCKET_NAME": "qms-tool-documents-qms-1",
  "REGION": "eu-north-1",
  "ACCESS_KEY_ID": "your-aws-access-key",
  "SECRET_ACCESS_KEY": "your-aws-secret-key"
}
```

### 2. AWS Amplify Service Role

The Amplify service role must have permissions to read from Secrets Manager.

**Required IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:eu-north-1:*:secret:qmssecretnamedb-*"
    }
  ]
}
```

**To add this policy:**

1. Go to AWS IAM Console
2. Find your Amplify service role (usually named like `amplifyconsole-backend-role`)
3. Click "Add permissions" → "Create inline policy"
4. Paste the JSON above
5. Name it `AmplifySecretsManagerAccess`
6. Click "Create policy"

---

## 🔧 How It Works

### During Build (amplify.yml)

```yaml
preBuild:
  commands:
    # 1. Fetch secrets from AWS Secrets Manager
    - aws secretsmanager get-secret-value \
        --secret-id qmssecretnamedb \
        --region eu-north-1 \
        --query SecretString \
        --output text > /tmp/secrets.json
    
    # 2. Parse and export as environment variables
    - export DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/qmstool"
    - export JWT_SECRET=$(cat /tmp/secrets.json | jq -r '.JWT_SECRET')
    - export S3_BUCKET_NAME=$(cat /tmp/secrets.json | jq -r '.S3_BUCKET_NAME')
    - export REGION=$(cat /tmp/secrets.json | jq -r '.REGION')
    - export ACCESS_KEY_ID=$(cat /tmp/secrets.json | jq -r '.ACCESS_KEY_ID')
    - export SECRET_ACCESS_KEY=$(cat /tmp/secrets.json | jq -r '.SECRET_ACCESS_KEY')
    
    # 3. Clean up temporary file
    - rm /tmp/secrets.json
```

### At Runtime

- All secrets are available in `process.env`
- Prisma uses DATABASE_URL for database connections
- API routes use JWT_SECRET for token verification

---

## 🚀 Deployment Steps

### 1. Initial Setup (One-time)

```bash
# 1. Create the secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name qmssecretnamedb \
  --region eu-north-1 \
  --secret-string file://secrets.json

# 2. Add IAM policy to Amplify service role (see above)

# 3. Configure Amplify environment variables (optional, only LAMBDA_FUNCTION_URL)
# In Amplify Console → App Settings → Environment Variables:
# LAMBDA_FUNCTION_URL = https://your-lambda-url.amazonaws.com
```

### 2. Deploy Application

```bash
# Commit and push changes
git add .
git commit -m "Your commit message"
git push origin main

# Amplify will automatically:
# 1. Detect the push
# 2. Fetch secrets from Secrets Manager
# 3. Build the application
# 4. Deploy to production
```

### 3. Verify Deployment

```bash
# Check build logs in Amplify Console for:
✅ Secrets fetched from AWS Secrets Manager
✅ Secrets exported as environment variables
✅ Temporary secrets file deleted

# Test the application:
curl https://your-app.amplifyapp.com/api/auth/diagnostics
curl https://your-app.amplifyapp.com/api/test-lambda-connection
```

---

## 🔄 Updating Secrets

When you need to update secrets (e.g., rotate passwords):

```bash
# Update the secret in AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id qmssecretnamedb \
  --region eu-north-1 \
  --secret-string file://new-secrets.json

# Trigger a new Amplify deployment
# Option 1: Push a commit
git commit --allow-empty -m "Trigger rebuild for secret rotation"
git push origin main

# Option 2: Manual redeploy in Amplify Console
# Go to Amplify Console → Your App → Click "Redeploy this version"
```

**Important:** New secrets will be picked up on the next build. No code changes required!

---

## 🛡️ Security Benefits

### ISO 27001 Compliance

✅ **A.9.4.1** - Information access restriction  
- IAM roles control who can access secrets
- No secrets in environment variables UI

✅ **A.10.1.1** - Cryptographic controls  
- Secrets encrypted at rest in Secrets Manager (KMS)
- Secrets encrypted in transit (TLS)

✅ **A.12.4.3** - Administrator and operator logs  
- CloudTrail logs all secret access
- Amplify logs show secret retrieval

✅ **A.14.1.2** - Securing application services  
- No secrets hardcoded in source code
- No secrets visible in build logs (only confirmation messages)

### Advantages Over Environment Variables

| Feature | Secrets Manager | Amplify Env Vars |
|---------|----------------|------------------|
| **Encryption at rest** | ✅ KMS | ❌ No |
| **Automatic rotation** | ✅ Yes | ❌ Manual |
| **Audit logging** | ✅ CloudTrail | ❌ No |
| **Version control** | ✅ Yes | ❌ No |
| **Access control** | ✅ IAM | ⚠️ Console only |
| **Visibility** | ✅ Hidden | ⚠️ Visible in UI |

### Advantages Over Lambda Proxy

| Feature | Direct Fetch | Lambda Proxy |
|---------|-------------|--------------|
| **Build-time availability** | ✅ Yes | ❌ Runtime only |
| **Cold start impact** | ✅ None | ❌ Yes |
| **Lambda costs** | ✅ None | ⚠️ Per invocation |
| **Complexity** | ✅ Simple | ⚠️ Extra service |
| **Reliability** | ✅ High | ⚠️ Lambda can fail |

---

## 🔍 Troubleshooting

### Build Fails: "AccessDeniedException"

**Problem:** Amplify service role doesn't have Secrets Manager permissions.

**Solution:**
1. Go to AWS IAM Console
2. Find Amplify service role
3. Add the SecretsManager policy (see Prerequisites)

### Build Fails: "SecretNotFoundException"

**Problem:** Secret doesn't exist or wrong region.

**Solution:**
```bash
# Verify secret exists
aws secretsmanager describe-secret \
  --secret-id qmssecretnamedb \
  --region eu-north-1

# If not found, create it
aws secretsmanager create-secret \
  --name qmssecretnamedb \
  --region eu-north-1 \
  --secret-string file://secrets.json
```

### Runtime Error: "Configuration error"

**Problem:** Required environment variables not set.

**Solution:**
1. Check Amplify build logs - did secrets fetch succeed?
2. Check secret contains all required keys
3. Redeploy application to pick up latest secrets

### Database Connection Fails

**Problem:** DATABASE_URL not properly constructed or password has special characters.

**Solution:**
- The amplify.yml uses `jq -sRr @uri` to URL-encode the password
- Verify the password in Secrets Manager doesn't have encoding issues
- Check Amplify logs for the constructed DATABASE_URL (password will be masked)

---

## 📊 Monitoring

### CloudWatch Logs

Amplify build logs are automatically sent to CloudWatch:
```
Log Group: /aws/amplify/your-app-id
```

### CloudTrail Events

Monitor secret access:
```bash
aws cloudtrail lookup-events \
  --region eu-north-1 \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=qmssecretnamedb
```

### Amplify Console

Monitor deployments:
1. Go to Amplify Console
2. Select your app
3. View build history and logs

---

## 🔄 Secret Rotation Strategy

### Automatic Rotation (Recommended)

```bash
# Enable automatic rotation for RDS credentials
aws secretsmanager rotate-secret \
  --secret-id qmssecretnamedb \
  --rotation-lambda-arn arn:aws:lambda:eu-north-1:...:function:SecretsManagerRotation \
  --rotation-rules AutomaticallyAfterDays=30
```

### Manual Rotation

1. Update secret in AWS Secrets Manager
2. Trigger Amplify redeploy (empty commit or manual)
3. Verify new secrets are picked up
4. Test application functionality

### Zero-Downtime Rotation

Since secrets are fetched at build time, rotation is seamless:
1. Old deployment keeps running with old secrets
2. New deployment builds with new secrets
3. Traffic switches to new deployment only after successful build
4. No downtime or connection failures

---

## 📝 Best Practices

### 1. Use Descriptive Secret Names
- ✅ `qmssecretnamedb` (current)
- ❌ `prod-secrets` or `app-config`

### 2. Separate Secrets by Environment
```
qmssecretnamedb-dev
qmssecretnamedb-staging
qmssecretnamedb-prod
```

### 3. Use Secret Versioning
- AWS Secrets Manager tracks all versions
- Can rollback to previous version if needed

### 4. Monitor Secret Access
- Set up CloudWatch alarms for unusual access patterns
- Review CloudTrail logs regularly

### 5. Rotate Regularly
- Database passwords: Every 90 days
- API keys: Every 180 days
- Signing secrets: Annually

---

## 🎯 Next Steps

1. ✅ Verify Amplify service role has Secrets Manager permissions
2. ✅ Ensure all required keys exist in the secret
3. ✅ Deploy and verify secrets are loaded correctly
4. ✅ Set up CloudWatch alarms for secret access
5. ✅ Configure automatic secret rotation
6. ✅ Document emergency procedures for secret compromise

---

## 📞 Support

For issues or questions:
1. Check Amplify build logs
2. Check CloudTrail for secret access events
3. Review this documentation
4. Contact AWS Support if needed

---

## 📚 References

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [AWS Amplify Build Specification](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
- [IAM Policies for Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_examples.html)
- [ISO 27001 Controls](https://www.iso.org/isoiec-27001-information-security.html)

---

**Last Updated:** October 11, 2025  
**Version:** 2.0

