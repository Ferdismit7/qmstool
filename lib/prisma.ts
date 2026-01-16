import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy-loaded Prisma client
let prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      if (!process.env.DATABASE_URL) {
        const errorMessage = 'DATABASE_URL environment variable is required. Make sure to call initializeSecrets() first. ' +
          'Check that LAMBDA_FUNCTION_URL or NEXT_PUBLIC_LAMBDA_FUNCTION_URL is set, or that all required environment variables are available.';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      try {
        prismaInstance = globalForPrisma.prisma ?? 
          new PrismaClient({
            log: process.env.NODE_ENV === 'development' 
              ? ['query', 'error', 'warn'] 
              : ['error'],
            datasources: {
              db: {
                url: process.env.DATABASE_URL,
              },
            }
          });

        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prismaInstance;
        }
      } catch (error) {
        console.error('Failed to create Prisma client:', error);
        throw error;
      }
    }
    
    return prismaInstance[prop as keyof PrismaClient];
  }
});

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