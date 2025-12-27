# Production Deployment Guide - Quick Start

## 🚀 **Immediate Production Setup Steps**

### 1. Environment Configuration

Create `.env.production` file in your project root:

```bash
# IMPORTANT: First switch to PostgreSQL: npm run db:switch:postgres

# Database - PostgreSQL for production
DATABASE_URL="postgresql://username:password@host:5432/stayscan_production"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-32-character-secret-here-change-this"

# Razorpay (for payments)
RAZORPAY_KEY_ID="rzp_live_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# App Configuration
APP_URL="https://your-domain.com"
NODE_ENV="production"

# Optional: Email notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 2. Production Database Setup

#### Option A: Using Railway (Recommended - Easy)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init
railway add postgresql

# Get your database URL
railway variables
# Copy the DATABASE_URL to your .env.production
```

#### Option B: Using Supabase (Free tier available)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string to `.env.production`

#### Option C: Using PlanetScale (MySQL compatible)
```bash
# Install PlanetScale CLI
curl https://github.com/planetscale/cli/releases/latest/download/pscale_0.146.0_linux_amd64.deb -L -o pscale.deb
sudo dpkg -i pscale.deb

# Create database
pscale auth login
pscale database create stayscan-production
pscale connect stayscan-production main --port 3309

# Update DATABASE_URL to use PlanetScale connection
```

### 3. Database Migration & Setup

```bash
# IMPORTANT: Switch to PostgreSQL for production
npm run db:switch:postgres

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed default services (optional)
npx prisma db seed # if you create a seed script
```

### 4. Build & Test Production Locally

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Test production build locally
npm run start

# Test on http://localhost:3000
```

### 5. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Follow prompts:
# - Link to existing project: N
# - Project name: stayscan-hotel-concierge
# - Directory: ./
# - Override settings: N

# Add environment variables in Vercel dashboard
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL  
vercel env add NEXTAUTH_SECRET

# Deploy to production
vercel --prod
```

### 6. Configure Custom Domain (Optional)

In Vercel Dashboard:
1. Go to your project
2. Click "Domains" 
3. Add your custom domain
4. Update DNS records as instructed

### 7. Alternative Deployment Options

#### Deploy to Netlify
```bash
# Build the app
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.next

# Add environment variables in Netlify dashboard
```

#### Deploy to DigitalOcean App Platform
1. Create account at DigitalOcean
2. Go to App Platform
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm run start`
5. Add environment variables
6. Deploy

## 🔧 **Production Optimizations**

### Update next.config.js for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-domain.com',
      },
    ],
  },

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

### Add production scripts to package.json:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "build:analyze": "ANALYZE=true npm run build",
    "test": "echo \"No tests specified\" && exit 0"
  }
}
```

## 🏥 **Health Check & Monitoring**

### Create API health check endpoint:

Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    }, { status: 503 });
  }
}
```

## 📊 **Quick Production Testing**

### Test these critical flows after deployment:

1. **Hotel Admin Registration**: `/signup`
2. **Staff Login**: `/login` with staff credentials  
3. **QR Code Access**: Visit a room's QR code URL
4. **Service Request**: Create and manage a service request
5. **Database Health**: Visit `/api/health`

### Load Testing (Optional)
```bash
# Install Artillery for load testing
npm install -g artillery

# Create test config artillery.yml
echo 'config:
  target: "https://your-domain.com"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health Check"
    requests:
      - get:
          url: "/api/health"' > artillery.yml

# Run load test
artillery run artillery.yml
```

## 🚨 **Production Troubleshooting**

### Common Issues:

1. **Database Connection Errors**
   - Verify `DATABASE_URL` format
   - Check database is accessible from your hosting provider
   - Ensure SSL mode is configured correctly

2. **NextAuth Errors**
   - Verify `NEXTAUTH_URL` matches your domain exactly
   - Ensure `NEXTAUTH_SECRET` is at least 32 characters
   - Check HTTPS is properly configured

3. **Build Failures**
   - Run `npm run type-check` locally
   - Check for TypeScript errors
   - Verify all environment variables are set

4. **Performance Issues**
   - Enable compression in next.config.js
   - Set up CDN for static assets
   - Add database indexes for slow queries

## 🎯 **Go-Live Checklist (Final)**

- [ ] Environment variables configured
- [ ] Database connected and migrated  
- [ ] Production build successful
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Health check endpoint working
- [ ] Test user flows working
- [ ] Monitoring set up (optional but recommended)

**Your StayScan Hotel Concierge System is now ready for production! 🎉**

For ongoing maintenance, refer to the comprehensive `PRODUCTION_DEPLOYMENT_CHECKLIST.md`.
