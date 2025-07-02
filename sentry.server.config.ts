import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore certain errors
  ignoreErrors: [
    // Ignore common server errors
    'ECONNRESET',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ],
  
  // Filter out certain transactions
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Add custom context
    event.tags = {
      ...event.tags,
      service: 'blog-api',
    };
    
    return event;
  },
  
  // Configure integrations
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
}); 