/**
 * Migration Script: Fix User Addresses
 * This script adds the 'type' field to existing user addresses that don't have it
 * 
 * Run: npx ts-node src/scripts/fix-user-addresses.ts
 */

import { database, User } from '../database';

async function fixUserAddresses() {
  try {
    console.log('🔄 Connecting to database...');
    await database.connect();
    console.log('✅ Connected to database');

    console.log('🔍 Finding users with addresses...');
    const users = await User.find({ 'addresses.0': { $exists: true } });
    console.log(`📊 Found ${users.length} users with addresses`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      for (const address of user.addresses) {
        // Check if address doesn't have 'type' field
        if (!(address as any).type) {
          // Set default type to 'shipping'
          (address as any).type = 'shipping';
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
        console.log(`✅ Updated user: ${user.email}`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Updated ${updatedCount} users`);
    console.log(`📊 ${users.length - updatedCount} users already had correct schema`);

    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
fixUserAddresses();
