import mysql from 'mysql2/promise';

// Type definitions for database operations
export interface DatabaseError extends Error {
  code?: string;
  errno?: number;
  sqlMessage?: string;
  sqlState?: string;
}

export interface QueryResult<T = unknown> {
  [key: string]: T;
}

// Parse DATABASE_URL to extract connection details
function parseDatabaseUrl(url: string) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  // Safely decode password, handling special characters
  let password: string;
  try {
    password = decodeURIComponent(match[2]);
  } catch (error) {
    // If decoding fails, use the raw password (might contain special chars)
    console.warn('Failed to decode password, using raw value:', error);
    password = match[2];
  }
  
  return {
    host: match[3],
    user: match[1],
    password: password,
    database: match[5],
    port: parseInt(match[4])
  };
}

// Lazy-loaded connection pool
let pool: mysql.Pool | null = null;

// Initialize database connection pool
function initializePool() {
  if (pool) {
    return pool;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
}

// Query function
export async function query<T = QueryResult[]>(sql: string, params: unknown[] = []): Promise<T> {
  try {
    const connectionPool = initializePool();
    const [results] = await connectionPool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
} 