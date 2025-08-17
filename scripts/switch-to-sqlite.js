#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

// Read the current schema
let schema = fs.readFileSync(schemaPath, 'utf8');

// Switch to SQLite
schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');

// Write back the modified schema
fs.writeFileSync(schemaPath, schema);

console.log('📁 Switched to SQLite provider');
console.log('📝 Next steps:');
console.log('   1. Update your DATABASE_URL in .env:');
console.log('      DATABASE_URL="file:./prisma/dev.db"');
console.log('   2. Run: npm run db:generate');
console.log('   3. Run: npm run db:push');
console.log('');
console.log('💡 SQLite is great for development but use PostgreSQL for production');
