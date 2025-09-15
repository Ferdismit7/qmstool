// lib/inputValidation.ts - Comprehensive Input Validation

/**
 * Comprehensive input sanitization
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '') // Remove semicolons
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/[{}]/g, '') // Remove braces
    .replace(/[\[\]]/g, '') // Remove brackets
    .replace(/[|&$`]/g, '') // Remove shell metacharacters
    .replace(/[\\]/g, '') // Remove backslashes
    .replace(/[\/]/g, '') // Remove forward slashes
    .replace(/[%]/g, '') // Remove percent signs
    .replace(/[#]/g, '') // Remove hash signs
    .replace(/[!]/g, '') // Remove exclamation marks
    .replace(/[?]/g, '') // Remove question marks
    .replace(/[=]/g, '') // Remove equals signs
    .replace(/[+]/g, '') // Remove plus signs
    .replace(/[*]/g, '') // Remove asterisks
    .replace(/[~]/g, '') // Remove tildes
    .replace(/[^]/g, '') // Remove carets
    .replace(/[`]/g, '') // Remove backticks
    .replace(/[\r\n\t]/g, ' ') // Replace newlines and tabs with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 1000); // Limit length
};

/**
 * Validate email format with additional security checks
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitizedEmail = sanitizeInput(email);
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /javascript:/i, // JavaScript injection
    /data:/i, // Data URI
    /vbscript:/i, // VBScript injection
    /onload/i, // Event handlers
    /onerror/i, // Event handlers
    /onclick/i, // Event handlers
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(email))) {
    return false;
  }
  
  return emailRegex.test(sanitizedEmail) && sanitizedEmail.length <= 254;
};

/**
 * Enhanced password validation
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    /password/i,
    /123456/i,
    /qwerty/i,
    /admin/i,
    /user/i,
    /test/i,
    /guest/i,
    /(.)\1{2,}/, // Repeated characters
    /(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
  ];
  
  if (weakPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password contains common weak patterns');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate username
 */
export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
    return { isValid: false, errors };
  }
  
  const sanitizedUsername = sanitizeInput(username);
  
  if (sanitizedUsername.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (sanitizedUsername.length > 20) {
    errors.push('Username must be less than 20 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'user', 'guest', 'test', 'demo',
    'api', 'www', 'mail', 'ftp', 'support', 'help', 'info', 'contact',
    'about', 'privacy', 'terms', 'login', 'logout', 'register', 'signup',
    'dashboard', 'profile', 'settings', 'config', 'system', 'server'
  ];
  
  if (reservedUsernames.includes(sanitizedUsername.toLowerCase())) {
    errors.push('Username is reserved and cannot be used');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate business area
 */
export const validateBusinessArea = (businessArea: string): boolean => {
  if (!businessArea || typeof businessArea !== 'string') return false;
  
  const sanitizedArea = sanitizeInput(businessArea);
  
  // Basic validation - should be alphanumeric with spaces and hyphens
  return /^[a-zA-Z0-9\s\-_]+$/.test(sanitizedArea) && 
         sanitizedArea.length >= 2 && 
         sanitizedArea.length <= 50;
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/rtf',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }
  
  // Check file name
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    errors.push('File name contains invalid characters');
  }
  
  if (file.name.length > 255) {
    errors.push('File name is too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
