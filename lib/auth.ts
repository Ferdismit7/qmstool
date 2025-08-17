import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Debug: Print the JWT secret on server start
console.log('JWT_SECRET:', process.env.JWT_SECRET);

export interface JWTPayload {
  userId: number;
  email: string;
  businessArea: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Enhanced client-side token utilities with proper storage management
 */
export const clientTokenUtils = {
  /**
   * Get token from all possible client-side sources with priority order
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Priority 1: Check localStorage first (for remembered logins)
    let token = localStorage.getItem('authToken');
    if (token) return token;
    
    // Priority 2: Check sessionStorage (for session-only logins)
    token = sessionStorage.getItem('authToken');
    if (token) return token;
    
    // Priority 3: Check cookies (fallback for server-side compatibility)
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
    if (authCookie) {
      const tokenValue = authCookie.split('=')[1];
      return tokenValue;
    }
    
    return null;
  },

  /**
   * Store token in appropriate client-side storage with proper cleanup
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
    
    // Also set cookie for server-side compatibility
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
    document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
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
  },

  /**
   * Check if token is expired (client-side check)
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = clientTokenUtils.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  },

  /**
   * Get token with automatic expiration check
   */
  getValidToken: (): string | null => {
    const token = clientTokenUtils.getToken();
    if (!token) return null;
    
    if (clientTokenUtils.isTokenExpired(token)) {
      console.log('Token is expired, clearing tokens');
      clientTokenUtils.clearTokens();
      return null;
    }
    
    return token;
  }
};

/**
 * Enhanced API request utility with automatic token handling
 */
export const apiClient = {
  /**
   * Make authenticated API request with automatic token handling
   */
  request: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = clientTokenUtils.getValidToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for CORS
    });

    // Handle 401 responses by clearing tokens
    if (response.status === 401) {
      console.log('Received 401, clearing tokens');
      clientTokenUtils.clearTokens();
      window.dispatchEvent(new Event('tokenChange'));
    }

    return response;
  },

  /**
   * GET request with automatic token handling
   */
  get: async (url: string): Promise<Response> => {
    return apiClient.request(url, { method: 'GET' });
  },

  /**
   * POST request with automatic token handling
   */
  post: async (url: string, data?: unknown): Promise<Response> => {
    return apiClient.request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request with automatic token handling
   */
  put: async (url: string, data?: unknown): Promise<Response> => {
    return apiClient.request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request with automatic token handling
   */
  delete: async (url: string): Promise<Response> => {
    return apiClient.request(url, { method: 'DELETE' });
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