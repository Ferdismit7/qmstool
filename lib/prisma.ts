import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | null = null;

function initializePrisma() {
  if (prisma) return prisma;
  
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Initializing Prisma client for production...');
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
      
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL environment variable is not set');
        return null;
      }
      
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: ['error', 'warn'],
      });
    } else {
      console.log('Initializing Prisma client for development...');
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          log: ['error', 'warn'],
        });
      }
      prisma = global.prisma;
    }
    
    console.log('Prisma client initialized successfully');
    return prisma;
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    return null;
  }
}

export default initializePrisma(); 