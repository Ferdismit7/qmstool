# Quick Deployment Reference

## 🚀 Deploy to AWS Amplify with Secrets Manager

### Step 1: Configure IAM Permissions

Add this policy to your Amplify service role:

```bash
# Copy the policy
cat docs/amplify-iam-policy.json

# Apply to Amplify role in AWS Console:
# IAM → Roles → amplify-console-role → Add permissions → Create inline policy
```

### Step 2: Verify Secret Exists

```bash
aws secretsmanager get-secret-value \
  --secret-id qmssecretnamedb \
  --region eu-north-1
```

### Step 3: Deploy

```bash
git add .
git commit -m "Deploy with Secrets Manager integration"
git push origin main
```

### Step 4: Verify

```bash
# Check these endpoints after deployment:
curl https://your-app.amplifyapp.com/api/auth/diagnostics
curl https://your-app.amplifyapp.com/api/test-lambda-connection
```

---

## 🔐 Security Architecture

**Old Method (Lambda Proxy):**
```
App → Lambda → Secrets Manager
```
- Runtime overhead
- Lambda cold starts
- Additional costs

**New Method (Direct Fetch):**
```
Amplify Build → Secrets Manager → Environment Variables
```
- No runtime overhead
- No Lambda needed
- Build-time secrets
- More secure (IAM role-based)

---

## ✅ What Changed

### Files Modified:
1. `amplify.yml` - Fetches secrets during build
2. `lib/awsSecretsManager.ts` - Enhanced fallback logic
3. `app/api/auth/[...nextauth]/route.ts` - Removed legacy OAuth handler
4. `app/api/test-lambda-connection/route.ts` - New diagnostic endpoint

### Files Added:
1. `DEPLOYMENT.md` - Complete deployment guide
2. `docs/amplify-iam-policy.json` - IAM policy template
3. `README.deployment.md` - This quick reference

---

## 🎯 Benefits

✅ **More Secure** - Secrets never exposed in Amplify UI  
✅ **ISO 27001 Compliant** - Full audit trail via CloudTrail  
✅ **Faster** - No Lambda cold starts  
✅ **Simpler** - No Lambda function needed  
✅ **Cheaper** - No Lambda invocation costs  
✅ **Reliable** - Direct AWS service integration  

---

## 📝 Commit Message

```
Implement direct AWS Secrets Manager integration in Amplify build

Major Changes:
- Fetch secrets from AWS Secrets Manager during Amplify build
- Remove dependency on Lambda proxy for runtime secret loading
- Add comprehensive deployment documentation
- Create IAM policy template for Amplify service role
- Add diagnostic endpoints for troubleshooting
- Remove unused OAuth handler and associated lint warnings

Security Improvements:
- Secrets loaded via IAM role (no manual env vars)
- Full CloudTrail audit logging
- No secrets visible in Amplify Console UI
- Proper password URL encoding in DATABASE_URL

ISO 27001 Compliance:
- A.9.4.1: IAM-based access control
- A.10.1.1: KMS encryption at rest
- A.12.4.3: CloudTrail audit logs
- A.14.1.2: No hardcoded secrets

Benefits:
- Eliminates Lambda cold start overhead
- Reduces costs (no Lambda invocations)
- Simplifies architecture (one less service)
- Improves reliability (direct AWS integration)
- Maintains runtime flexibility with fallback support
```

---

For complete documentation, see `DEPLOYMENT.md`

