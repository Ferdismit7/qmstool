#!/bin/bash

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Check if Prisma client was generated
if [ -d "node_modules/.prisma" ]; then
    echo "Prisma client generated successfully"
    ls -la node_modules/.prisma/
else
    echo "ERROR: Prisma client not generated"
    exit 1
fi

# Build Next.js app
echo "Building Next.js app..."
npm run build

echo "Build completed successfully" 