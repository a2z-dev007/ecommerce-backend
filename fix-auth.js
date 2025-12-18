// Simple script to fix ObjectId to string conversions
const fs = require('fs');

// Read the auth service file
let content = fs.readFileSync('src/modules/auth/auth.service.ts', 'utf8');

// Replace all occurrences of userId: user._id with userId: user._id.toString()
content = content.replace(/userId: user\._id,/g, 'userId: user._id.toString(),');

// Write back the file
fs.writeFileSync('src/modules/auth/auth.service.ts', content);

console.log('✅ Fixed ObjectId to string conversions in auth service');