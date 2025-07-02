import DOMPurify from 'isomorphic-dompurify';

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^\d{2}:\d{2}(:\d{2})?$/,
};

// File type validation
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// XSS prevention - HTML sanitization
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

// SQL Injection prevention - Basic pattern matching
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|EVAL)\b/i,
    /\b(OR|AND)\b\s+\d+\s*[=<>]/i,
    /\b(OR|AND)\b\s+['"]\w+['"]\s*[=<>]/i,
    /(--|\/\*|\*\/|;)/,
    /\b(UNION|SELECT)\b.*\bFROM\b/i,
    /\b(INSERT|UPDATE)\b.*\bINTO\b/i,
    /\b(DELETE|DROP)\b.*\bFROM\b/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

// XSS prevention - Script tag detection
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

// Path traversal prevention
export function containsPathTraversal(input: string): boolean {
  const traversalPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /~\//,
    /~\\/,
    /\/etc\/passwd/,
    /\/proc\/self/,
    /\/sys\/class/,
    /\/dev\/null/,
  ];

  return traversalPatterns.some(pattern => pattern.test(input));
}

// Input validation functions
export function validateEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email) && 
         email.length <= 254 && 
         !containsSqlInjection(email) && 
         !containsXss(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return VALIDATION_PATTERNS.URL.test(url) && 
           !containsSqlInjection(url) && 
           !containsXss(url);
  } catch {
    return false;
  }
}

export function validateSlug(slug: string): boolean {
  return VALIDATION_PATTERNS.SLUG.test(slug) && 
         slug.length >= 1 && 
         slug.length <= 50 &&
         !containsSqlInjection(slug) && 
         !containsXss(slug);
}

export function validateSafeString(input: string, maxLength: number = 1000): boolean {
  return VALIDATION_PATTERNS.SAFE_STRING.test(input) && 
         input.length <= maxLength &&
         !containsSqlInjection(input) && 
         !containsXss(input);
}

export function validateHtmlContent(content: string, maxLength: number = 10000): boolean {
  return content.length <= maxLength &&
         !containsSqlInjection(content) && 
         !containsXss(content);
}

// File validation
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only images are allowed.' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { isValid: false, error: 'Invalid file extension' };
  }

  return { isValid: true };
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }

  const isValid = score >= 4 && password.length >= 8;

  return {
    isValid,
    score,
    feedback: isValid ? [] : feedback,
  };
}

// Rate limiting helper
export function generateRateLimitKey(identifier: string, action: string): string {
  return `${identifier}:${action}:${Math.floor(Date.now() / 60000)}`;
}

// CSRF token validation
export function validateCsrfToken(token: string, sessionToken?: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  
  // In a real implementation, you'd compare with the session token
  // For now, we'll do basic validation
  return token.length >= 32 && /^[a-zA-Z0-9]+$/.test(token);
}

// Request fingerprinting for security
export function generateRequestFingerprint(request: Request): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const referer = request.headers.get('referer') || '';
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${referer}`;
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Logging for security events
export function logSecurityEvent(event: string, details: any): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: 'warning',
  };

  // In production, send to a logging service
  console.warn('Security Event:', logEntry);
}

// Export all validation functions
export const securityUtils = {
  sanitizeHtml,
  containsSqlInjection,
  containsXss,
  containsPathTraversal,
  validateEmail,
  validateUrl,
  validateSlug,
  validateSafeString,
  validateHtmlContent,
  validateImageFile,
  validatePasswordStrength,
  generateRateLimitKey,
  validateCsrfToken,
  generateRequestFingerprint,
  logSecurityEvent,
}; 