# Local Testing Guide

## Quick Start

### 1. Create `.env.local` file

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://admin:your-password@localhost:3306/qmstool

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-here-minimum-32-characters-long

# AWS Configuration (for S3 file uploads)
S3_BUCKET_NAME=qms-tool-documents-qms-1
REGION=eu-north-1
ACCESS_KEY_ID=your-aws-access-key-id
SECRET_ACCESS_KEY=your-aws-secret-access-key

# Lambda Function URL (optional - only if testing Lambda secrets)
NEXT_PUBLIC_LAMBDA_FUNCTION_URL=https://your-lambda-url.lambda-url.eu-north-1.on.aws/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Testing Authentication Flow

### Test Email/Password Login

1. Navigate to `http://localhost:3000/auth`
2. Click "Create your account" if you need to sign up
3. Enter email and password
4. After login, you should be redirected to `/dashboard`
5. Verify you can access protected routes

### Test Protected Routes

Try accessing:
- `/dashboard` - Should work if authenticated
- `/business-processes` - Should work if authenticated
- Any other route - Should redirect to `/auth` if not authenticated

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure MySQL is running
- Check database credentials

### JWT Secret Issues

- Ensure `JWT_SECRET` is at least 32 characters
- Generate a new one: `openssl rand -base64 32`

### Missing Environment Variables

- Check `.env.local` exists in project root
- Verify all required variables are set
- Restart the dev server after changing `.env.local`

## What Was Removed

✅ **Okta** - All Okta authentication removed
✅ **NextAuth** - NextAuth dependency removed
✅ **Okta-related environment variables** - No longer needed:
   - `OKTA_CLIENT_ID`
   - `OKTA_CLIENT_SECRET`
   - `OKTA_ISSUER`
   - `OKTA_ENABLED`
   - `NEXT_PUBLIC_OKTA_ENABLED`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

## Current Authentication

The app now uses **email/password authentication only** with JWT tokens:
- Login via `/api/auth/login`
- Signup via `/api/auth/signup`
- Tokens stored in cookies and localStorage/sessionStorage
- No external OAuth providers

