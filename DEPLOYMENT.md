# 🚀 Deployment Guide

This guide covers deploying your Next.js blog to production on various platforms.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `env.production.example` to `.env.production`
- [ ] Fill in all required environment variables
- [ ] Generate secure secrets for NEXTAUTH_SECRET and other security keys

### 2. Database Setup
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed initial data if needed: `npx prisma db seed`

### 3. Build Testing
- [ ] Test production build locally: `npm run build`
- [ ] Verify all features work in production mode

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Pros:** Best Next.js integration, automatic deployments, edge functions
**Cons:** Limited free tier, vendor lock-in

#### Steps:
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.production`

5. **Connect Database:**
   - Use Vercel Postgres or external database
   - Update DATABASE_URL in environment variables

### Option 2: Netlify

**Pros:** Good free tier, easy setup
**Cons:** Limited serverless functions, slower builds

#### Steps:
1. **Create `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Netlify Dashboard or CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Option 3: Railway

**Pros:** Good for full-stack apps, PostgreSQL included
**Cons:** Limited free tier

#### Steps:
1. **Connect GitHub repository**
2. **Set environment variables**
3. **Deploy automatically on push**

### Option 4: DigitalOcean App Platform

**Pros:** Good performance, reasonable pricing
**Cons:** More complex setup

#### Steps:
1. **Create App in DigitalOcean Dashboard**
2. **Connect GitHub repository**
3. **Configure build settings**
4. **Set environment variables**

### Option 5: AWS Amplify

**Pros:** AWS integration, good for enterprise
**Cons:** Complex setup, AWS knowledge required

## 🔧 Production Optimizations

### 1. Database Optimization
```bash
# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Optional: Seed data
npx prisma db seed
```

### 2. Image Optimization
- Use Next.js Image component
- Configure image domains in `next.config.ts`
- Consider using a CDN for images

### 3. Performance Monitoring
- Set up Sentry for error tracking
- Configure Google Analytics
- Monitor Core Web Vitals

### 4. Security Headers
- Already configured in `vercel.json`
- Consider adding CSP headers
- Enable HTTPS redirects

## 🛠️ Post-Deployment

### 1. Domain Setup
- Configure custom domain in your hosting platform
- Set up DNS records
- Enable HTTPS

### 2. Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)
- Set up performance monitoring

### 3. Backup Strategy
- Database backups (automated)
- File uploads backup
- Environment variables backup

### 4. SEO Setup
- Submit sitemap to search engines
- Configure Google Search Console
- Set up analytics tracking

## 🔄 Continuous Deployment

### GitHub Actions (Recommended)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check environment variables
   - Verify database connection
   - Review build logs

2. **Database Issues:**
   - Ensure migrations are run
   - Check connection string format
   - Verify database permissions

3. **Authentication Problems:**
   - Verify NEXTAUTH_URL matches deployment URL
   - Check OAuth provider settings
   - Ensure NEXTAUTH_SECRET is set

4. **Performance Issues:**
   - Enable caching
   - Optimize images
   - Use CDN for static assets

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs
3. Test locally with production settings
4. Contact platform support if needed

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options) 