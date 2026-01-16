import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy-loaded Prisma client
let prismaInstance: PrismaClient | undefined;

const getPrismaClient = (): PrismaClient => {
  if (prismaInstance) {
    return prismaInstance;
  }

  if (!process.env.DATABASE_URL) {
    const errorMessage = 'DATABASE_URL environment variable is required. Make sure to call initializeSecrets() first. ' +
      'Check that LAMBDA_FUNCTION_URL or NEXT_PUBLIC_LAMBDA_FUNCTION_URL is set, or that all required environment variables are available. ' +
      'In Next.js 16, environment variables must be available at runtime, not just build time.';
    console.error(errorMessage);
    console.error('Current NODE_ENV:', process.env.NODE_ENV);
    console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL);
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

    return prismaInstance;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};

// Proxy that ensures Prisma is initialized before access
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    return client[prop as keyof PrismaClient];
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