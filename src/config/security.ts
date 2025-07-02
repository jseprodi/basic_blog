// Security configuration
export const securityConfig = {
  // Rate limiting
  rateLimit: {
    maxRequests: parseInt(process.env.SECURITY_RATE_LIMIT_MAX_REQUESTS || '100'),
    maxAuthRequests: parseInt(process.env.SECURITY_RATE_LIMIT_MAX_AUTH_REQUESTS || '10'),
    maxUploadRequests: parseInt(process.env.SECURITY_RATE_LIMIT_MAX_UPLOAD_REQUESTS || '5'),
    windowMs: parseInt(process.env.SECURITY_RATE_LIMIT_WINDOW_MS || '60000'),
  },

  // File upload
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml').split(','),
  },

  // Content Security Policy
  csp: {
    defaultSrc: process.env.CSP_DEFAULT_SRC || "'self'",
    scriptSrc: process.env.CSP_SCRIPT_SRC || "'self' 'unsafe-inline' 'unsafe-eval'",
    styleSrc: process.env.CSP_STYLE_SRC || "'self' 'unsafe-inline'",
    imgSrc: process.env.CSP_IMG_SRC || "'self' data: https: blob:",
    connectSrc: process.env.CSP_CONNECT_SRC || "'self'",
  },

  // Monitoring and logging
  monitoring: {
    enableSecurityLogging: process.env.ENABLE_SECURITY_LOGGING === 'true',
    securityLogLevel: process.env.SECURITY_LOG_LEVEL || 'warning',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    enableCors: process.env.ENABLE_CORS !== 'false',
  },

  // Environment
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',
  },

  // Authentication
  auth: {
    sessionSecret: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here-change-in-production',
    sessionMaxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  // API Security
  api: {
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    enableRequestValidation: true,
    enableResponseSanitization: true,
  },
};

// Security headers configuration
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-Robots-Tag': 'noindex, nofollow',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    `default-src ${securityConfig.csp.defaultSrc}`,
    `script-src ${securityConfig.csp.scriptSrc}`,
    `style-src ${securityConfig.csp.styleSrc}`,
    `img-src ${securityConfig.csp.imgSrc}`,
    `connect-src ${securityConfig.csp.connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
};

// CORS configuration
export const corsConfig = {
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  safeString: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}(:\d{2})?$/,
};

// Security event types
export const securityEventTypes = {
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  PATH_TRAVERSAL_ATTEMPT: 'path_traversal_attempt',
  SUSPICIOUS_USER_AGENT: 'suspicious_user_agent',
  INVALID_FILE_UPLOAD: 'invalid_file_upload',
  CSRF_ATTEMPT: 'csrf_attempt',
  BRUTE_FORCE_ATTEMPT: 'brute_force_attempt',
} as const;

// Security severity levels
export const securitySeverityLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Export types
export type SecurityEventType = typeof securityEventTypes[keyof typeof securityEventTypes];
export type SecuritySeverityLevel = typeof securitySeverityLevels[keyof typeof securitySeverityLevels]; 