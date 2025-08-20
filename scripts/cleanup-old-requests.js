#!/usr/bin/env node
// Automatic cleanup script for service requests older than 24 hours
// This script can be run as a cron job

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CLEANUP_API_KEY = process.env.CLEANUP_API_KEY || 'your-secret-cleanup-key';

async function runCleanup() {
    console.log(`[${new Date().toISOString()}] Starting automatic cleanup...`);
    
    try {
        const response = await fetch(`${BASE_URL}/api/cleanup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer internal-cleanup',
                'x-api-key': CLEANUP_API_KEY
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(`[${new Date().toISOString()}] ✅ Cleanup completed successfully:`);
            console.log(`  - Deleted ${result.deleted.serviceRequests} service requests`);
            console.log(`  - Deleted ${result.deleted.notifications} notifications`);
        } else {
            console.error(`[${new Date().toISOString()}] ❌ Cleanup failed:`, result.error);
        }
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Network error during cleanup:`, error);
    }
}

// Run the cleanup
runCleanup();
