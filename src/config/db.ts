import mongoose from 'mongoose';
import { env, isDevelopment } from './env';
import { MongoMemoryServer } from 'mongodb-memory-server';

class Database {
  private static instance: Database;

  private constructor() { }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      let uri = env.MONGODB_URI;

      if (isDevelopment) {
        try {
          // Try to connect to the configured URI first
          console.log('📡 Attempting to connect to MongoDB...');
          await mongoose.connect(uri, options);
        } catch (error) {
          console.error('❌ Failed to connect to MongoDB Atlas:', error);
          console.warn('⚠️ Could not connect to remote MongoDB. Starting MongoDB Memory Server fallback...');
          
          try {
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log('🚀 Using In-Memory MongoDB Fallback:', uri);
            await mongoose.connect(uri, options);
          } catch (memoryError) {
             console.error('❌ Failed to start Memory Server fallback:', memoryError);
             throw error; 
          }
        }
      } else {
        await mongoose.connect(uri, options);
      }

      const host = mongoose.connection.host;
      const dbName = mongoose.connection.name;
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      
      console.log('✅ Connected to MongoDB successfully');
      console.log('📊 Connection Details:');
      console.log(`   - Host: ${host} (${isLocal ? 'Local' : 'Remote/Atlas'})`);
      console.log(`   - Database: ${dbName}`);

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  public getConnection() {
    return mongoose.connection;
  }
}

export const database = Database.getInstance();