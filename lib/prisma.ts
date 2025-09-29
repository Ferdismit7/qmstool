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
        throw new Error('DATABASE_URL environment variable is required. Make sure to call initializeSecrets() first.');
      }
      
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