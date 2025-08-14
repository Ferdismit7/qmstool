import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import {prisma } from '@/lib/prisma';

// Debug: Print the JWT secret on server start
console.log('JWT_SECRET:', process.env.JWT_SECRET);

export interface JWTPayload {
  userId: number;
  email: string;
  businessArea: string;
  username: string;
}

/**
 * Client-side token utilities
 */
export const clientTokenUtils = {
  /**
   * Get token from all possible client-side sources
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Check cookies first (set by server, most reliable for middleware)
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      return token;
    }
    
    // Fall back to sessionStorage (default for non-remembered logins)
    let token = sessionStorage.getItem('authToken');
    if (token) return token;
    
    // If not in sessionStorage, check localStorage (for remembered logins)
    token = localStorage.getItem('authToken');
    return token;
  },

  /**
   * Store token in appropriate client-side storage
   */
  storeToken: (token: string, rememberMe: boolean = false): void => {
    if (typeof window === 'undefined') return;
    
    // Clear any existing tokens first
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Store in appropriate storage based on rememberMe preference
    if (rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  },

  /**
   * Clear all client-side tokens
   */
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Clear cookie by setting it to expire in the past
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },

  /**
   * Decode JWT token (client-side, for display purposes only)
   */
  decodeToken: (token: string): JWTPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
};

/**
 * Extract user information from JWT token
 * @param request - Next.js request object
 * @returns User information from JWT token or null if invalid
 */
export const getUserFromToken = (request: NextRequest): JWTPayload | null => {
  try {
    console.log('getUserFromToken called');
    
    // Check if JWT_SECRET is available (for build-time safety)
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not available');
      return null;
    }

    // First try to get token from cookies (for server-side requests)
    let token = request.cookies.get('authToken')?.value;
    console.log('Token from cookies:', token ? 'Found' : 'Not found');
    
    // If not in cookies, try Authorization header (for client-side requests)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      console.log('Authorization header:', authHeader);
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Token from Authorization header:', token ? 'Found' : 'Not found');
      }
    }
    
    if (!token) {
      console.log('No token found in cookies or headers');
      return null;
    }

    console.log('Attempting to verify JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    console.log('JWT verification successful:', decoded);
    return decoded;
  } catch (error) {
    console.log('JWT verification failed:', error);
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
    console.log('getCurrentUserBusinessAreas called');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies.getAll());
    
    const user = getUserFromToken(request);
    console.log('User from token:', user);
    
    if (!user) {
      console.log('No user found from token');
      return [];
    }

    // Get user ID from the users table using Prisma
    const userRecord = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true }
    });

    if (!userRecord) {
      return [];
    }

    // Get all business areas for this user from user_business_areas table
    const userBusinessAreas = await prisma.$queryRaw`
      SELECT business_area 
      FROM user_business_areas 
      WHERE user_id = ${userRecord.id}
      ORDER BY business_area ASC
    ` as unknown as Array<{ business_area: string }>;

    // If no business areas found in user_business_areas table, fall back to primary business area
    if (userBusinessAreas.length === 0 && user.businessArea) {
      return [user.businessArea];
    }

    return userBusinessAreas.map((row: unknown) => (row as { business_area: string }).business_area);
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