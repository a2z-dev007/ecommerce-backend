# Quick Fix for Login Error

## Problem
Getting validation error: `Path 'addressType' is required` when trying to login.

## Cause
The database has existing users with the old address schema (using `type` field), but there was a temporary change to `addressType` that has now been reverted.

## Solution Options

### Option 1: Run Migration Script (Recommended)
This will fix existing user addresses without losing data:

```bash
cd backend
npx ts-node src/scripts/fix-user-addresses.ts
```

### Option 2: Drop and Reseed Database
This will delete all data and create fresh data:

```bash
cd backend
npm run seed
```

### Option 3: Manual Database Fix
If you have MongoDB Compass or mongosh:

```javascript
// Connect to your database
use your_database_name

// Update all users to add 'type' field to addresses
db.users.updateMany(
  { "addresses.0": { $exists: true } },
  { 
    $set: { 
      "addresses.$[].type": "shipping" 
    } 
  }
)
```

### Option 4: Delete Admin User and Recreate
```bash
# Connect to MongoDB
mongosh

# Use your database
use your_database_name

# Delete admin user
db.users.deleteOne({ email: "admin@example.com" })

# Exit mongosh
exit

# Run seed script to recreate
cd backend
npm run seed
```

## After Fix

Try logging in again with:
- **Email:** `admin@example.com`
- **Password:** `Admin@123`

## Prevention

The issue has been fixed in the code. The User model now correctly uses `type` field (not `addressType`) which matches the existing database schema.

## Verification

After running the fix, verify it worked:

```bash
# Test the login endpoint
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

You should get a successful response with an access token.
