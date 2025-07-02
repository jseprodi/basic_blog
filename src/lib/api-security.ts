import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DOMPurify from 'isomorphic-dompurify';
import { 
  validateEmail, 
  validateSafeString, 
  validateHtmlContent,
  validateImageFile,
  containsSqlInjection,
  containsXss,
  logSecurityEvent,
  generateRequestFingerprint
} from './security';

// API response wrapper
export function createApiResponse(
  data: any = null,
  status: number = 200,
  message: string = 'Success'
) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Error response wrapper
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Authentication middleware
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    logSecurityEvent('Unauthorized API access attempt', {
      path: request.nextUrl.pathname,
      method: request.method,
      fingerprint: generateRequestFingerprint(request),
    });
    
    return createErrorResponse('Authentication required', 401);
  }
  
  return { session, user: session.user };
}

// Input validation middleware
export async function validateInput(
  request: NextRequest,
  schema: Record<string, any>
) {
  try {
    const body = await request.json();
    const errors: string[] = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      
      if (rules.required && !value) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (value) {
        // Type validation
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
        
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters`);
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
        
        // Custom validation
        if (rules.validate) {
          const validationResult = rules.validate(value);
          if (!validationResult.isValid) {
            errors.push(validationResult.error || `${field} is invalid`);
          }
        }
        
        // Security validation
        if (rules.sanitize) {
          if (containsSqlInjection(value)) {
            errors.push(`${field} contains invalid characters`);
            logSecurityEvent('SQL injection attempt detected', {
              field,
              value: value.substring(0, 100), // Log first 100 chars only
              path: request.nextUrl.pathname,
            });
          }
          
          if (containsXss(value)) {
            errors.push(`${field} contains invalid content`);
            logSecurityEvent('XSS attempt detected', {
              field,
              value: value.substring(0, 100),
              path: request.nextUrl.pathname,
            });
          }
        }
      }
    }
    
    if (errors.length > 0) {
      return createErrorResponse('Validation failed', 400, { errors });
    }
    
    return { body, errors: [] };
  } catch (error) {
    return createErrorResponse('Invalid request body', 400);
  }
}

// File upload validation
export async function validateFileUpload(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return createErrorResponse('No file provided', 400);
    }
    
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      logSecurityEvent('Invalid file upload attempt', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        path: request.nextUrl.pathname,
      });
      
      return createErrorResponse(validation.error || 'Invalid file', 400);
    }
    
    return { file, formData };
  } catch (error) {
    return createErrorResponse('File upload failed', 400);
  }
}

// Rate limiting check (complements middleware)
export function checkApiRateLimit(
  identifier: string,
  action: string,
  maxRequests: number = 100
): boolean {
  const key = `${identifier}:${action}:${Math.floor(Date.now() / 60000)}`;
  const store = (global as any).rateLimitStore || new Map();
  
  const record = store.get(key);
  const now = Date.now();
  
  if (!record || now > record.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + 60000, // 1 minute
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// CSRF protection
export function validateCsrfToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token');
  const sessionToken = request.headers.get('x-session-token');
  
  if (!token || !sessionToken) {
    return false;
  }
  
  // In production, implement proper CSRF token validation
  return token.length >= 32 && /^[a-zA-Z0-9]+$/.test(token);
}

// Request logging for security monitoring
export function logApiRequest(request: NextRequest, response: NextResponse) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    fingerprint: generateRequestFingerprint(request),
  };
  
  // Log suspicious requests
  if (response.status >= 400) {
    logSecurityEvent('API Error', logEntry);
  }
  
  // Log successful requests for monitoring
  console.log('API Request:', logEntry);
}

// Content Security Policy headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Input sanitization for different content types
export function sanitizeInput(input: string, type: 'text' | 'html' | 'url' | 'email'): string {
  switch (type) {
    case 'html':
      return DOMPurify.sanitize(input);
    case 'url':
      return encodeURI(input.trim());
    case 'email':
      return input.toLowerCase().trim();
    case 'text':
    default:
      return input.trim().replace(/[<>]/g, '');
  }
}

// Export validation schemas
export const VALIDATION_SCHEMAS = {
  POST: {
    title: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 200,
      sanitize: true,
      validate: (value: string) => ({ isValid: validateSafeString(value, 200) }),
    },
    content: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 10000,
      sanitize: true,
      validate: (value: string) => ({ isValid: validateHtmlContent(value) }),
    },
    excerpt: {
      required: false,
      type: 'string',
      maxLength: 500,
      sanitize: true,
    },
    slug: {
      required: false,
      type: 'string',
      maxLength: 50,
      pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      sanitize: true,
    },
  },
  
  CATEGORY: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      sanitize: true,
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 200,
      sanitize: true,
    },
  },
  
  TAG: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 30,
      sanitize: true,
    },
  },
  
  COMMENT: {
    content: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 1000,
      sanitize: true,
    },
    authorName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      sanitize: true,
    },
    authorEmail: {
      required: true,
      type: 'string',
      validate: (value: string) => ({ isValid: validateEmail(value) }),
    },
  },
}; 