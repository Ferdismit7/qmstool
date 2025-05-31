import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, email, password, businessArea } = await request.json();
    console.log('Received signup request for:', { username, email, businessArea });

    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE emailaddress = ?',
        [email]
      );
      console.log('Existing user check result:', existingUsers);

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 400 }
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('Password hashed successfully');

      // Insert new user
      await connection.execute(
        'INSERT INTO users (username, emailaddress, business_area, password_hash) VALUES (?, ?, ?, ?)',
        [username, email, businessArea, hashedPassword]
      );
      console.log('User inserted successfully');

      return NextResponse.json(
        { message: 'User registered successfully' },
        { status: 201 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Detailed signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 