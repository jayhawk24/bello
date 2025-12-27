# Database Configuration Guide

## Overview

This project uses a flexible database configuration that supports:
- **SQLite** for development (default)
- **PostgreSQL** for production (recommended)

## Environment Variables

Add these to your `.env` file:

```bash
# For Development (SQLite) - Default
DATABASE_URL="file:./prisma/dev.db"

# For Production (PostgreSQL) - After switching
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

## Development Setup

### Using SQLite (Default - Current Setup)
```bash
# Already configured in .env
DATABASE_URL="file:./prisma/dev.db"

# Generate Prisma client and push schema
npm run db:generate
npm run db:push
```

### Switching to PostgreSQL for Development
```bash
# 1. Switch the schema to PostgreSQL
npm run db:switch:postgres

# 2. Update your .env file
DATABASE_URL="postgresql://username:password@localhost:5432/stayscan_dev"

# 3. Generate Prisma client and push schema
npm run db:generate
npm run db:push
```

### Switching Back to SQLite
```bash
# 1. Switch the schema back to SQLite
npm run db:switch:sqlite

# 2. Update your .env file
DATABASE_URL="file:./prisma/dev.db"

# 3. Generate Prisma client and push schema
npm run db:generate
npm run db:push
```

## Production Setup

### 1. PostgreSQL Database Options

#### Option A: Railway (Easiest)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create PostgreSQL database
railway login
railway init
railway add postgresql

# Get your DATABASE_URL from Railway dashboard
```

#### Option B: Supabase (Free Tier Available)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy the connection string

#### Option C: Neon (Serverless PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

#### Option D: PlanetScale (MySQL - Alternative)
```bash
# If you prefer MySQL, update schema.prisma provider to "mysql"
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://username:password@host:3306/database_name"
```

### 2. Production Environment Variables

Create `.env.production`:
```bash
# IMPORTANT: Switch to PostgreSQL first: npm run db:switch:postgres
DATABASE_URL="postgresql://username:password@host:5432/stayscan_production"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-character-secret"
# ... other variables
```

### 3. Deploy Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Deploy database migrations to production
npm run db:migrate:prod

# Or for initial setup, push schema directly
npm run db:push
```

## Database Commands

```bash
# Development
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:migrate       # Create and apply migration
npm run db:reset         # Reset database (CAUTION!)

# Production
npm run db:migrate:prod  # Deploy migrations to production
npm run db:generate      # Generate Prisma client

# Utilities
npm run db:switch:postgres   # Switch schema to PostgreSQL
npm run db:switch:sqlite     # Switch schema to SQLite
```

## Migration Strategy

### Development to Production Migration

1. **Develop with SQLite** (fast, no setup required)
```bash
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./prisma/dev.db"
```

2. **Test with PostgreSQL locally** (optional but recommended)
```bash
# Run PostgreSQL locally with Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Update .env
DATABASE_PROVIDER="postgresql"  
DATABASE_URL="postgresql://postgres:password@localhost:5432/stayscan_test"
```

3. **Deploy to Production with PostgreSQL**
```bash
DATABASE_PROVIDER="postgresql"
DATABASE_URL="your-production-postgresql-url"
```

## Database Differences (SQLite vs PostgreSQL)

### SQLite Limitations
- No concurrent writes
- Limited data types
- Single file database
- **Good for:** Development, prototyping, small applications

### PostgreSQL Advantages  
- Full ACID compliance
- Concurrent connections
- Rich data types and features
- Better performance at scale
- **Good for:** Production, multi-user applications

## Troubleshooting

### Common Issues

#### 1. "Database not found" error
```bash
# Make sure database exists, then
npm run db:push
```

#### 2. "Provider not supported" error
```bash
# Check DATABASE_PROVIDER is either "sqlite" or "postgresql"
# Regenerate Prisma client
npm run db:generate
```

#### 3. Migration errors
```bash
# Reset migrations (CAUTION: Data loss)
npm run db:reset

# Or manually fix migration files in prisma/migrations/
```

#### 4. Connection refused (PostgreSQL)
- Verify database server is running
- Check connection string format
- Ensure firewall allows connections
- Verify SSL requirements

### Environment Variables Debug
The application will log database configuration on startup in development mode:
```
🗄️  Database: SQLITE
🌍 Environment: DEVELOPMENT
```

### Switching Databases

#### From SQLite to PostgreSQL:
1. Export data if needed: `npm run db:studio` > Export
2. Update `.env` with PostgreSQL settings
3. Run `npm run db:generate`
4. Run `npm run db:push`
5. Import data if needed

#### From PostgreSQL to SQLite:
1. Export data if needed
2. Update `.env` with SQLite settings  
3. Run `npm run db:generate`
4. Run `npm run db:push`
5. Import data if needed

## Best Practices

1. **Always use PostgreSQL in production**
2. **Test with PostgreSQL before deploying if possible**
3. **Keep migrations in version control**
4. **Backup production data regularly**
5. **Use connection pooling in production**
6. **Monitor database performance**

This flexible setup allows you to develop quickly with SQLite while ensuring production readiness with PostgreSQL.
