const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple seeder without TypeScript or path aliases
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  phone: String,
  addresses: [{
    type: { type: String, enum: ['billing', 'shipping'] },
    firstName: String,
    lastName: String,
    addressLine1: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  preferences: {
    newsletter: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Settings Schema
const settingsSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  businessDescription: String,
  currency: { type: String, default: 'USD' },
  currencySymbol: { type: String, default: '$' },
  contactInfo: {
    email: { type: String, required: true },
    phone: String
  },
  theme: {
    primaryColor: { type: String, default: '#007bff' },
    secondaryColor: { type: String, default: '#6c757d' },
    accentColor: { type: String, default: '#28a745' }
  },
  features: {
    enableReviews: { type: Boolean, default: true },
    enableCoupons: { type: Boolean, default: true },
    enableInventoryTracking: { type: Boolean, default: true }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Settings = mongoose.model('Settings', settingsSchema);

async function seedDatabase() {
  try {
    console.log('🌱 Starting simple database seeding...');
    
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
    } else {
      // Create admin user
      const adminPassword = await bcrypt.hash('Admin@123', 12);
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        phone: '+1234567890',
        addresses: [{
          type: 'billing',
          firstName: 'Admin',
          lastName: 'User',
          addressLine1: '123 Admin Street',
          city: 'Admin City',
          state: 'AC',
          postalCode: '12345',
          country: 'United States',
          isDefault: true
        }]
      });
      
      await admin.save();
      console.log('✅ Admin user created');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: Admin@123');
    }
    
    // Create sample users
    const existingUsers = await User.countDocuments({ role: 'user' });
    if (existingUsers === 0) {
      const userPassword = await bcrypt.hash('Password@123', 12);
      const sampleUsers = [
        { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
        { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com' },
        { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com' },
        { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com' }
      ];
      
      for (const userData of sampleUsers) {
        const user = new User({
          ...userData,
          password: userPassword,
          role: 'user',
          isActive: true,
          isEmailVerified: true,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          addresses: [{
            type: 'shipping',
            firstName: userData.firstName,
            lastName: userData.lastName,
            addressLine1: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
            city: 'Sample City',
            state: 'SC',
            postalCode: '12345',
            country: 'United States',
            isDefault: true
          }]
        });
        
        await user.save();
      }
      
      console.log(`✅ Created ${sampleUsers.length} sample users`);
    } else {
      console.log('✅ Sample users already exist');
    }
    
    // Create settings
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      const settings = new Settings({
        businessName: 'TechStore Pro',
        businessDescription: 'Your premier destination for technology and electronics',
        currency: 'USD',
        currencySymbol: '$',
        contactInfo: {
          email: 'contact@techstore.com',
          phone: '+1-800-TECH-STORE'
        },
        theme: {
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          accentColor: '#10b981'
        },
        features: {
          enableReviews: true,
          enableCoupons: true,
          enableInventoryTracking: true
        }
      });
      
      await settings.save();
      console.log('✅ Settings created');
    } else {
      console.log('✅ Settings already exist');
    }
    
    console.log('\n🎉 Simple seeding completed successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('📧 Admin Email: admin@example.com');
    console.log('🔑 Admin Password: Admin@123');
    console.log('🔑 User Password: Password@123');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };