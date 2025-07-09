import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize Prisma Client
export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: process.env.DATABASE_URL
      ? {
          db: {
            url: process.env.DATABASE_URL,
          },
        }
      : undefined,
  });

// If not in production, save Prisma Client to global
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test database connection
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default prisma;