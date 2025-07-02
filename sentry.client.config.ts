import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore certain errors
  ignoreErrors: [
    // Ignore network errors
    'Network Error',
    'Failed to fetch',
    'Network request failed',
    // Ignore common browser errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Filter out certain transactions
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out certain error types
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'ChunkLoadError') {
        return null;
      }
    }
    
    return event;
  },
  
  // Configure integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
}); 