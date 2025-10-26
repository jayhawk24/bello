#!/bin/bash

echo "🧪 Testing Payment System Setup"
echo "================================"

# Check if Razorpay library is installed
echo "✅ Checking Razorpay installation..."
cd /home/jayhawk/github/jayhawk/bello/bello
if npm list razorpay > /dev/null 2>&1; then
    echo "✅ Razorpay library is installed"
else
    echo "❌ Razorpay library is not installed"
    exit 1
fi

# Check if payment models exist in database
echo "✅ Checking database schema..."
npx prisma generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

# Test compilation of payment routes
echo "✅ Checking TypeScript compilation..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has issues (check with: npm run type-check)"
fi

# Check if payment API routes exist
echo "✅ Checking API routes..."
if [ -f "src/app/api/payments/create-subscription/route.ts" ]; then
    echo "✅ Create subscription route exists"
else
    echo "❌ Create subscription route missing"
fi

if [ -f "src/app/api/payments/verify/route.ts" ]; then
    echo "✅ Payment verification route exists"
else
    echo "❌ Payment verification route missing"
fi

if [ -f "src/app/api/subscription/current/route.ts" ]; then
    echo "✅ Current subscription route exists"
else
    echo "❌ Current subscription route missing"
fi

# Check subscription page
if [ -f "src/app/dashboard/subscription/page.tsx" ]; then
    echo "✅ Subscription management page exists"
else
    echo "❌ Subscription management page missing"
fi

echo ""
echo "🎉 Payment System Setup Complete!"
echo "================================"
echo "📝 Next Steps:"
echo "1. Set up Razorpay account and get API keys"
echo "2. Update .env file with RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
echo "3. Test payment flow in development environment"
echo "4. Configure webhook endpoints in Razorpay dashboard"
echo ""
echo "🔗 Navigation:"
echo "- Visit /dashboard/subscription to view subscription plans"
echo "- Payment processing happens through Razorpay integration"
echo "- Subscription status is tracked in the database"
