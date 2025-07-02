import * as Sentry from '@sentry/nextjs';

// Manual error reporting
export function reportError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  });
}

// Report message (for non-error events)
export function reportMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context || {},
    },
  });
}

// Add breadcrumb for debugging
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Set user context
export function setUser(user: { id?: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

// Set tag for filtering
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

// Set context for additional information
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

// API error wrapper
export function withErrorReporting<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      reportError(error as Error, {
        functionName: fn.name,
        args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
        ...context,
      });
      throw error;
    }
  };
}

// React hook for error reporting
export function useErrorReporting() {
  return {
    reportError,
    reportMessage,
    addBreadcrumb,
    setUser,
    setTag,
    setContext,
  };
} 