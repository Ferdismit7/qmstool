// lib/audit.ts - Security Audit and Logging
import { NextRequest } from 'next/server';

export interface SecurityEvent {
  timestamp: Date;
  eventType: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'SIGNUP_ATTEMPT' | 'SIGNUP_SUCCESS' | 'SIGNUP_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY';
  userId?: number;
  email?: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Log security events for audit trail
 */
export const logSecurityEvent = (event: SecurityEvent): void => {
  // In production, this should write to a secure audit log
  // For now, we'll use console.log with structured format
  console.log(`[SECURITY_AUDIT] ${JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString()
  })}`);
  
  // TODO: Implement proper audit logging to secure storage
  // - Write to encrypted audit log file
  // - Send to SIEM system
  // - Store in secure database with retention policy
};

/**
 * Extract client information from request
 */
export const getClientInfo = (request: NextRequest) => {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
};

/**
 * Check for suspicious patterns
 */
export const detectSuspiciousActivity = (request: NextRequest, eventType: string): boolean => {
  const { ipAddress, userAgent } = getClientInfo(request);
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /burp/i,
    /wget/i,
    /curl/i,
    /python-requests/i,
    /bot/i,
    /crawler/i,
    /scanner/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(request.url)
  );
  
  if (isSuspicious) {
    logSecurityEvent({
      timestamp: new Date(),
      eventType: 'SUSPICIOUS_ACTIVITY',
      ipAddress,
      userAgent,
      details: `Suspicious pattern detected in ${eventType}`,
      severity: 'HIGH'
    });
  }
  
  return isSuspicious;
};

/**
 * Validate request origin
 */
export const validateRequestOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // In production, implement proper origin validation
  // For now, we'll do basic checks
  if (origin && !origin.includes(host || '')) {
    logSecurityEvent({
      timestamp: new Date(),
      eventType: 'SUSPICIOUS_ACTIVITY',
      ipAddress: getClientInfo(request).ipAddress,
      userAgent: getClientInfo(request).userAgent,
      details: `Suspicious origin: ${origin}`,
      severity: 'MEDIUM'
    });
    return false;
  }
  
  return true;
};
