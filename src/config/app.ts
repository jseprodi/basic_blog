export const config = {
  // Site Configuration
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Your Blog',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern blog built with Next.js',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    author: 'Your Name',
    language: 'en',
    timezone: 'UTC',
  },

  // Analytics Configuration
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    debug: process.env.NEXT_PUBLIC_GA_DEBUG === 'true',
    enabled: process.env.NODE_ENV === 'production',
  },

  // PWA Configuration
  pwa: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Your Blog',
    shortName: 'Blog',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern blog built with Next.js',
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    startUrl: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },

  // Feature Flags
  features: {
    contentModeration: process.env.CONTENT_MODERATION_ENABLED === 'true',
    pushNotifications: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    emailNotifications: !!process.env.EMAIL_SERVICE_API_KEY,
    postScheduling: true,
    analytics: true,
    webVitals: true,
  },

  // Rate Limiting
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  },

  // Caching
  cache: {
    maxAge: parseInt(process.env.CACHE_MAX_AGE || '300'),
    staleWhileRevalidate: parseInt(process.env.CACHE_STALE_WHILE_REVALIDATE || '600'),
  },

  // Security
  security: {
    cspReportUri: process.env.CSP_REPORT_URI,
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@yourblog.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Your Blog',
    serviceApiKey: process.env.EMAIL_SERVICE_API_KEY,
  },

  // Content Moderation
  moderation: {
    enabled: process.env.CONTENT_MODERATION_ENABLED === 'true',
    apiKey: process.env.CONTENT_MODERATION_API_KEY,
  },
} as const;

export type Config = typeof config; 