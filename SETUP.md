# Blog Setup Guide

This guide will help you configure your blog with all the enhanced features we've implemented.

## 1. Environment Variables

Copy the `.env.example` file to `.env` and configure the following variables:

### Database
```env
DATABASE_URL="file:./dev.db"
```

### NextAuth.js Authentication
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
```

### Google OAuth (Optional)
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Sentry Error Monitoring
```env
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
```

### PWA Push Notifications
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
```

### Email Configuration
```env
EMAIL_FROM="noreply@yourblog.com"
EMAIL_FROM_NAME="Your Blog"
EMAIL_SERVICE_API_KEY="your-email-service-api-key"
```

### Analytics
```env
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GA_DEBUG="false"
```

### Application Configuration
```env
NEXT_PUBLIC_BASE_URL="https://yourblog.com"
NEXT_PUBLIC_SITE_NAME="Your Blog"
NEXT_PUBLIC_SITE_DESCRIPTION="A modern blog built with Next.js"
```

### Content Moderation
```env
CONTENT_MODERATION_ENABLED="true"
CONTENT_MODERATION_API_KEY="your-moderation-api-key"
```

### Rate Limiting
```env
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"
```

### Caching
```env
CACHE_MAX_AGE="300"
CACHE_STALE_WHILE_REVALIDATE="600"
```

### Security
```env
CSP_REPORT_URI="https://yourblog.report-uri.com/r/d/csp/enforce"
```

## 2. Database Setup

Run the database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

## 3. VAPID Keys for Push Notifications

Generate VAPID keys for push notifications:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Add the generated keys to your environment variables.

## 4. Google Analytics Setup

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property
3. Get your Measurement ID (G-XXXXXXXXXX)
4. Add it to `NEXT_PUBLIC_GA_ID`

## 5. Sentry Setup

1. Go to [Sentry](https://sentry.io/)
2. Create a new project
3. Get your DSN and other credentials
4. Add them to your environment variables

## 6. Email Service Setup

Choose an email service provider:

### SendGrid
```env
EMAIL_SERVICE_API_KEY="SG.your-sendgrid-api-key"
```

### Mailgun
```env
EMAIL_SERVICE_API_KEY="key-your-mailgun-api-key"
```

### Resend
```env
EMAIL_SERVICE_API_KEY="re_your-resend-api-key"
```

## 7. Content Moderation (Optional)

For external content moderation services:

### Perspective API (Google)
```env
CONTENT_MODERATION_API_KEY="your-perspective-api-key"
```

## 8. Production Deployment

### Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add all environment variables in Netlify dashboard
4. Deploy

### Self-hosted
1. Set up your server
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Start the server: `npm start`

## 9. Feature Configuration

### Enable/Disable Features
Features can be controlled via environment variables:

- **Content Moderation**: `CONTENT_MODERATION_ENABLED=true/false`
- **Push Notifications**: Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Email Notifications**: Set `EMAIL_SERVICE_API_KEY`
- **Analytics**: Set `NEXT_PUBLIC_GA_ID`

### Customization
Edit `src/config/app.ts` to customize:
- Site name and description
- PWA settings
- Rate limiting
- Caching strategies
- Security policies

## 10. Testing

Run the test suite:

```bash
npm test
```

## 11. Development

Start the development server:

```bash
npm run dev
```

## 12. Monitoring

### Error Monitoring
- Sentry will automatically capture errors
- Check your Sentry dashboard for error reports

### Analytics
- Google Analytics will track page views and events
- Custom events are sent to your analytics API endpoint

### Performance
- Web Vitals are automatically collected
- Check the `/api/analytics/web-vitals` endpoint

## 13. Security Checklist

- [ ] All environment variables are set
- [ ] NEXTAUTH_SECRET is a strong, random string
- [ ] HTTPS is enabled in production
- [ ] CSP headers are configured
- [ ] Rate limiting is active
- [ ] Content moderation is enabled
- [ ] Database is properly secured

## 14. Performance Optimization

- [ ] Images are optimized with Next.js Image component
- [ ] Static assets are cached
- [ ] API responses are cached where appropriate
- [ ] Service worker is active for offline support
- [ ] Code splitting is implemented

## 15. SEO Optimization

- [ ] Meta tags are properly set
- [ ] Structured data is implemented
- [ ] Sitemap is generated
- [ ] Robots.txt is configured
- [ ] Canonical URLs are set

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Run the test suite to identify issues
4. Check the Sentry dashboard for error reports
5. Review the logs for debugging information 