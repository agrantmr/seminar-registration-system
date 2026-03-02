#!/usr/bin/env node

/**
 * Helper script to generate bcrypt password hashes
 * Usage: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Error: Password is required');
  console.log('Usage: node scripts/generate-password-hash.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n✅ Password hash generated successfully!\n');
    console.log('Add this to your .env file or Vercel environment variables:\n');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
  })
  .catch(err => {
    console.error('Error generating hash:', err);
    process.exit(1);
  });
