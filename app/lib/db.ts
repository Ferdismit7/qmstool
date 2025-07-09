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

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries
export async function query<T = QueryResult[]>(sql: string, params: unknown[] = []): Promise<T> {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connection acquired');

    // Log the query and parameters
    console.log('Executing query:', {
      sql,
      params: JSON.stringify(params, null, 2)
    });

    // Execute the query
    const [results] = await connection.query(sql, params);
    console.log('Query results:', JSON.stringify(results, null, 2));

    return results as T;
  } catch (error) {
    console.error('Database query error:', {
      sql,
      params: JSON.stringify(params, null, 2),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Error && 'code' in error ? (error as DatabaseError).code : undefined,
      errno: error instanceof Error && 'errno' in error ? (error as DatabaseError).errno : undefined,
      sqlMessage: error instanceof Error && 'sqlMessage' in error ? (error as DatabaseError).sqlMessage : undefined,
      sqlState: error instanceof Error && 'sqlState' in error ? (error as DatabaseError).sqlState : undefined
    });
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released');
    }
  }
} 