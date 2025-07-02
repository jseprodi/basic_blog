import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window
const RATE_LIMIT_MAX_AUTH_REQUESTS = 10; // auth requests per window
const RATE_LIMIT_MAX_UPLOAD_REQUESTS = 5; // upload requests per window

// Security headers configuration
const securityHeaders = {
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
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
};

// Rate limiting function
function checkRateLimit(identifier: string, maxRequests: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent}`;
}

// Validate request size
function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const maxSize = 10 * 1024 * 1024; // 10MB
    return size <= maxSize;
  }
  return true;
}

// Validate file upload request
function validateUploadRequest(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type');
  if (contentType && contentType.includes('multipart/form-data')) {
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const maxUploadSize = 5 * 1024 * 1024; // 5MB
      return size <= maxUploadSize;
    }
  }
  return true;
}

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Apply CORS headers to API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Apply security headers to all responses
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting for different endpoints
  const clientId = getClientIdentifier(request);
  
  // Stricter rate limiting for authentication endpoints
  if (pathname.startsWith('/api/auth/')) {
    if (!checkRateLimit(`${clientId}-auth`, RATE_LIMIT_MAX_AUTH_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many authentication requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Rate limiting for upload endpoints
  if (pathname.startsWith('/api/upload')) {
    if (!checkRateLimit(`${clientId}-upload`, RATE_LIMIT_MAX_UPLOAD_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many upload requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate upload request size
    if (!validateUploadRequest(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'File size too large. Maximum size is 5MB.' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // General rate limiting for API endpoints
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(`${clientId}-api`, RATE_LIMIT_MAX_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate request size for API endpoints
    if (!validateRequestSize(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'Request too large.' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Additional security checks for sensitive endpoints
  if (pathname.startsWith('/api/posts') || pathname.startsWith('/api/categories') || pathname.startsWith('/api/tags')) {
    // Check for authentication on protected endpoints
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token && request.method !== 'GET') {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Block suspicious requests
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    // Log suspicious activity (in production, send to monitoring service)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    console.warn('Suspicious request detected:', {
      userAgent,
      pathname,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  // Prevent directory traversal attacks
  if (pathname.includes('..') || pathname.includes('~')) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid request path' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 