import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { query } from '@/app/lib/db';

// Debug: Print the JWT secret on server start
console.log('JWT_SECRET:', process.env.JWT_SECRET);

export interface JWTPayload {
  userId: number;
  email: string;
  businessArea: string;
  username: string;
}

/**
 * Extract user information from JWT token
 * @param request - Next.js request object
 * @returns User information from JWT token or null if invalid
 */
export const getUserFromToken = (request: NextRequest): JWTPayload | null => {
  try {
    // First try to get token from cookies (for server-side requests)
    let token = request.cookies.get('authToken')?.value;
    
    // If not in cookies, try Authorization header (for client-side requests)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Get all business areas the current user has access to
 * @param request - Next.js request object
 * @returns Array of business areas or empty array if not authenticated
 */
export const getCurrentUserBusinessAreas = async (request: NextRequest): Promise<string[]> => {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return [];
    }

    // Get user ID from the users table
    const [userRecord] = await query(`
      SELECT id FROM users WHERE email = ?
    `, [user.email]);

    if (!userRecord) {
      return [];
    }

    // Get all business areas for this user from user_business_areas table
    const userBusinessAreas = await query(`
      SELECT business_area 
      FROM user_business_areas 
      WHERE user_id = ?
      ORDER BY business_area ASC
    `, [userRecord.id]);

    // If no business areas found in user_business_areas table, fall back to primary business area
    if (userBusinessAreas.length === 0 && user.businessArea) {
      return [user.businessArea];
    }

    return userBusinessAreas.map((row: any) => row.business_area);
  } catch (error) {
    console.error('Error getting user business areas:', error);
    // Fall back to JWT business area if query fails
    const user = getUserFromToken(request);
    return user?.businessArea ? [user.businessArea] : [];
  }
};

/**
 * Get current user's primary business area from request (for backward compatibility)
 * @param request - Next.js request object
 * @returns Business area string or null if not authenticated
 */
export const getCurrentUserBusinessArea = (request: NextRequest): string | null => {
  const user = getUserFromToken(request);
  return user?.businessArea || null;
};

/**
 * Verify user has access to specific business area
 * @param request - Next.js request object
 * @param targetBusinessArea - Business area to check access for
 * @returns True if user has access, false otherwise
 */
export const hasBusinessAreaAccess = async (request: NextRequest, targetBusinessArea: string): Promise<boolean> => {
  const userBusinessAreas = await getCurrentUserBusinessAreas(request);
  return userBusinessAreas.includes(targetBusinessArea);
}; 