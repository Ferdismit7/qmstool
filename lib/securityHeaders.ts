// lib/securityHeaders.ts - Security Headers Configuration
import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', '),
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

/**
 * Apply security headers to response
 */
export const applySecurityHeaders = (response: NextResponse): NextResponse => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

/**
 * Check if request is from allowed origin
 */
export const isAllowedOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // In production, implement proper origin validation
  // For now, we'll allow same-origin requests
  if (!origin) return true; // Same-origin request
  
  // Check if origin matches host
  if (origin.includes(host || '')) return true;
  
  // Add your allowed domains here
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    // Add other allowed origins
  ];
  
  return allowedOrigins.includes(origin);
};

/**
 * Validate request headers
 */
export const validateRequestHeaders = (request: NextRequest): boolean => {
  // Check for required headers
  const requiredHeaders = ['user-agent'];
  
  for (const header of requiredHeaders) {
    if (!request.headers.get(header)) {
      return false;
    }
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-originating-ip',
    'x-remote-ip',
    'x-remote-addr'
  ];
  
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      // Log suspicious header
      console.warn(`Suspicious header detected: ${header}`);
      return false;
    }
  }
  
  return true;
};
