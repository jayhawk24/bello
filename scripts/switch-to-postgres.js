#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

// Read the current schema
let schema = fs.readFileSync(schemaPath, 'utf8');

// Switch to PostgreSQL
schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');

// Write back the modified schema
fs.writeFileSync(schemaPath, schema);

console.log('🐘 Switched to PostgreSQL provider');
console.log('📝 Next steps:');
console.log('   1. Update your DATABASE_URL in .env to point to PostgreSQL:');
console.log('      DATABASE_URL="postgresql://username:password@localhost:5432/database_name"');
console.log('   2. Run: npm run db:generate');
console.log('   3. Run: npm run db:push');
console.log('');
console.log('💡 For production, create .env.production with PostgreSQL settings');
