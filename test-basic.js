// Test basic Node.js and MongoDB connection
const mongoose = require('mongoose');

async function testConnection() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_test';
    console.log('Testing MongoDB connection...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
    
    console.log('\n🎉 Basic setup is working!');
    console.log('You can now run: npm run seed:simple');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Make sure MongoDB is running and check your connection string');
  }
}

testConnection();