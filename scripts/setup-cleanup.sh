#!/bin/bash
# Setup script for automatic service request cleanup

echo "🔧 Setting up automatic cleanup for service requests..."

# Make the cleanup script executable
chmod +x scripts/cleanup-old-requests.js

# Add to package.json scripts if not already there
echo "📝 Adding cleanup script to package.json..."

# Create cron job entry (runs every hour)
CRON_JOB="0 * * * * cd $(pwd) && node scripts/cleanup-old-requests.js >> logs/cleanup.log 2>&1"

echo "⏰ Setting up cron job to run cleanup every hour..."
echo "Add this line to your crontab (run 'crontab -e'):"
echo "$CRON_JOB"

# Create logs directory if it doesn't exist
mkdir -p logs

# Create environment variables file for production
if [ ! -f .env.cleanup ]; then
    echo "🔐 Creating .env.cleanup file..."
    cat > .env.cleanup << EOL
# Environment variables for cleanup script
BASE_URL=http://localhost:3000
CLEANUP_API_KEY=your-secret-cleanup-key-change-this-in-production
EOL
    echo "Created .env.cleanup - Please update CLEANUP_API_KEY for production!"
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update CLEANUP_API_KEY in .env.cleanup for production"
echo "2. Add the cron job entry shown above to your crontab"
echo "3. Or run manual cleanup: npm run cleanup"
echo ""
echo "🗑️ This will automatically delete:"
echo "  - Service requests older than 24 hours"
echo "  - Related notifications older than 24 hours"
