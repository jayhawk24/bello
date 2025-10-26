# Subscription Billing Cron Job Setup

This document explains how to set up automated monthly subscription billing for your hotel management platform.

## How It Works

**Razorpay does NOT automatically handle subscription renewals** - you need to implement your own billing system. This is actually better because it gives you full control over:

- Custom billing logic
- Grace periods for failed payments
- Email notifications
- Subscription lifecycle management
- Revenue tracking

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Cron job authentication secret
CRON_SECRET=your-super-secret-cron-key-here

# Your app URL (for external cron services)
APP_URL=https://your-domain.com

# Email service (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Deployment Options

### Option 1: Vercel Cron (Recommended for Vercel deployment)

The `vercel.json` file is already configured to run billing daily at 9 AM UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-billing", 
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Vercel Cron Limits:**
- Hobby plan: 1 cron job
- Pro plan: 5 cron jobs 
- Enterprise: Unlimited

### Option 2: GitHub Actions (Free alternative)

The GitHub Actions workflow (`.github/workflows/subscription-billing.yml`) runs daily and calls your API.

**Required GitHub Secrets:**
- `CRON_SECRET`: Your cron authentication secret
- `APP_URL`: Your deployed app URL

### Option 3: External Cron Service

Use services like:
- **Cron-job.org** (free)
- **EasyCron** (free tier available)
- **Cronhub** (monitoring + execution)

Configure them to POST to: `https://your-domain.com/api/cron/subscription-billing`

With header: `Authorization: Bearer your-cron-secret`

### Option 4: Server Cron Job (VPS/Dedicated Server)

If you have your own server, add to crontab:

```bash
# Run daily at 9 AM
0 9 * * * curl -X POST -H "Authorization: Bearer your-cron-secret" https://your-domain.com/api/cron/subscription-billing
```

## Testing

### Manual Test (Development)

```bash
# Start your development server
npm run dev

# In another terminal, test the billing
node scripts/test-subscription-billing.js
```

### Production Test

```bash
APP_URL=https://your-domain.com CRON_SECRET=your-secret node scripts/test-subscription-billing.js
```

## What the Cron Job Does

1. **Finds Due Subscriptions**: Identifies subscriptions due for renewal (billing date <= today)

2. **Creates Payment Orders**: Generates Razorpay payment orders for each due subscription

3. **Processes Payments**: Attempts to charge the saved payment method

4. **Handles Failures**: 
   - Marks payments as failed
   - Sends notification emails
   - Provides grace period before cancellation

5. **Updates Records**: Updates subscription billing dates and payment status

6. **Cancels Overdue**: Cancels subscriptions that are overdue beyond grace period

## Monitoring

Check the logs in your deployment platform:

- **Vercel**: Check function logs in dashboard
- **GitHub Actions**: View workflow run details
- **External Services**: Check their logs/monitoring

## Email Notifications (Optional)

The billing service can send email notifications for:
- Successful renewals
- Failed payments
- Subscription cancellations

Configure SMTP settings in your environment variables to enable this feature.

## Frequency Recommendations

- **Daily checks**: Recommended to catch renewals promptly
- **Weekly checks**: Minimum for business continuity  
- **Monthly checks**: Only if you want renewals to batch up

## Security Considerations

1. **CRON_SECRET**: Use a strong, unique secret key
2. **API Rate Limiting**: Consider adding rate limits to the cron endpoint
3. **IP Whitelisting**: If using external services, whitelist their IPs
4. **Monitoring**: Set up alerts for failed cron executions

## Troubleshooting

**Cron job not running:**
- Check your deployment platform's cron configuration
- Verify environment variables are set
- Check application logs for errors

**Payment processing fails:**
- Verify Razorpay API keys are correct
- Check if test/live mode matches your setup
- Review Razorpay dashboard for failed transactions

**Database errors:**
- Ensure database connection is stable
- Check if database schema is up to date
- Verify Prisma client is properly configured
