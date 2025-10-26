#!/usr/bin/env node

/**
 * Manual test script for subscription billing
 * Run with: node scripts/test-subscription-billing.js
 */

const https = require('https');
const http = require('http');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-here';

console.log('🧪 Testing subscription billing cron job...');
console.log(`App URL: ${APP_URL}`);

// Parse URL to determine protocol
const url = new URL(APP_URL + '/api/cron/subscription-billing');
const client = url.protocol === 'https:' ? https : http;

const postData = JSON.stringify({});

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = client.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('🎉 Subscription billing test completed successfully!');
      } else {
        console.log('❌ Subscription billing test failed:', response.error);
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.error('❌ Failed to parse response as JSON:', error.message);
    }
    
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

// Write data to request body
req.write(postData);
req.end();
