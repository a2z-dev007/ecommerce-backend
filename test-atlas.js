const mongoose = require('mongoose');

const uri = "mongodb+srv://azdev776_db_user:bfZgrZHDXMRXEvNU@cluster0.gge5i75.mongodb.net/ecommerce_db?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
    console.log('Testing connection to MongoDB Atlas...');
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Success! Connected to MongoDB Atlas.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error);
        if (error.message.includes('IP address')) {
            console.log('\nTIP: It looks like your IP address is not whitelisted in MongoDB Atlas.');
        }
    }
}

testConnection();
