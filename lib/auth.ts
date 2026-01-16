import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { initializeSecrets } from './awsSecretsManager';
import {prisma } from '@/lib/prisma';

// SECURITY FIX: Removed JWT_SECRET logging - NEVER log secrets
// console.log('JWT_SECRET:', process.env.JWT_SECRET); // REMOVED

export interface JWTPayload {
  userId: number;
  email: string;
  businessArea: string;
  username: string;
  exp?: number; // JWT expiration timestamp
  iat?: number; // JWT issued at timestamp
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
    
    // Check client-side cookie first (set by server for client access)
    const cookies = document.cookie.split(';');
    const clientAuthCookie = cookies.find(cookie => cookie.trim().startsWith('clientAuthToken='));
    if (clientAuthCookie) {
      const token = clientAuthCookie.split('=')[1];
      if (token && token.trim()) {
        return token.trim();
      }
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
    
    // Clear cookies by setting them to expire in the past
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'clientAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = clientTokenUtils.decodeToken(token);
      if (!decoded) return true;
      
      // Check if token has exp field and if it's expired
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp ? decoded.exp < currentTime : false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
};

/**
 * Extract user information from JWT token
 * @param request - Next.js request object
 * @returns User information from JWT token or null if invalid
 */
/**
 * Initialize secrets and get user from token (async wrapper)
 * @param request - Next.js request object
 * @returns User information from JWT token or null if invalid
 */
export const getUserFromTokenWithSecrets = async (request: NextRequest): Promise<JWTPayload | null> => {
  try {
    // getUserFromToken now handles secrets initialization internally
    return await getUserFromToken(request);
  } catch (error) {
    console.error('Failed to get user from token:', error);
    return null;
  }
};

export const getUserFromToken = async (request: NextRequest): Promise<JWTPayload | null> => {
  try {
    console.log('getUserFromToken called');
    
    await initializeSecrets();
    
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not available after initialization');
      return null;
    }

    // First try to get token from HttpOnly cookies (for server-side requests)
    let token = request.cookies.get('authToken')?.value;
    console.log('Token from HttpOnly cookies:', token ? 'Found' : 'Not found');
    
    // If not in HttpOnly cookies, try client-side cookies
    if (!token) {
      token = request.cookies.get('clientAuthToken')?.value;
      console.log('Token from client cookies:', token ? 'Found' : 'Not found');
    }
    
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
      return null;
    }

    console.log('Attempting to verify JWT token...');
    // Guard against bogus tokens like 'null' or 'undefined'
    if (token === 'null' || token === 'undefined' || !token.trim()) {
      throw new Error('Invalid bearer token placeholder');
    }
    // jsonwebtoken typings don't support generics; cast via unknown first
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as jwt.Secret
    ) as unknown as JWTPayload;
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
    
    // Ensure secrets are initialized before using Prisma
    try {
      await initializeSecrets();
    } catch (secretsError) {
      console.error('Failed to initialize secrets:', secretsError);
      // Fall back to JWT business area if secrets initialization fails
      const user = await getUserFromToken(request);
      if (user?.businessArea) return [user.businessArea];
      return [];
    }
    
    // Verify DATABASE_URL is set before accessing Prisma
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not available after initializeSecrets()');
      // Fall back to JWT business area
      const user = await getUserFromToken(request);
      if (user?.businessArea) return [user.businessArea];
      return [];
    }
    
    const user = await getUserFromToken(request);
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
      console.log('No local user record for email, falling back to all business areas');
      const allAreas = await prisma.businessAreas.findMany({ select: { business_area: true } });
      return allAreas.map(a => a.business_area);
    }

    // Get all business areas for this user from user_business_areas table
    const userBusinessAreas = await prisma.$queryRaw`
      SELECT business_area 
      FROM user_business_areas 
      WHERE user_id = ${userRecord.id}
      ORDER BY business_area ASC
    ` as unknown as Array<{ business_area: string }>;

    // If no business areas mapped, fall back to all areas (user authenticated via JWT)
    if (userBusinessAreas.length === 0) {
      if (user.businessArea) {
        return [user.businessArea];
      }
      console.log('User has no mapped business areas, returning all areas fallback');
      const allAreas = await prisma.businessAreas.findMany({ select: { business_area: true } });
      return allAreas.map(a => a.business_area);
    }

    return userBusinessAreas.map((row: unknown) => (row as { business_area: string }).business_area);
  } catch (error) {
    console.error('Error getting user business areas:', error);
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Fall back to JWT business area if query fails
    try {
      const user = await getUserFromToken(request);
      if (user?.businessArea) return [user.businessArea];
      console.log('Query failed and no JWT businessArea, returning empty array');
      return [];
    } catch (fallbackError) {
      console.error('Fallback getUserFromToken also failed:', fallbackError);
      return [];
    }
  }
};

/**
 * Get current user's primary business area from request (for backward compatibility)
 * @param request - Next.js request object
 * @returns Business area string or null if not authenticated
 */
export const getCurrentUserBusinessArea = async (request: NextRequest): Promise<string | null> => {
  const user = await getUserFromToken(request);
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