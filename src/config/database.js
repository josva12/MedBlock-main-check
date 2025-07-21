console.log('✅ database.js loaded...');
const mongoose = require('mongoose');
console.log('✅ mongoose required');
const logger = require('../utils/logger');
console.log('✅ logger required');

class Database {
  constructor() {
    console.log('✅ Database constructor called');
    this.isConnected = false;
  }

  async connect() {
    console.log('🟢 Entered Database.connect()');
    try {
      const mongoUri = process.env.NODE_ENV === 'production' 
        ? process.env.MONGODB_URI_PROD 
        : process.env.MONGODB_URI;
      console.log('🟢 mongoUri:', mongoUri);

      if (!mongoUri) {
        console.log('🟠 No mongoUri found!');
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        retryWrites: true,
        w: 'majority',
        readPreference: 'primary',
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j: true },
        // SSL/TLS for production
        ...(process.env.NODE_ENV === 'production' && {
          ssl: true,
          sslValidate: true,
          sslCA: process.env.MONGODB_SSL_CA,
        }),
      };
      console.log('🟢 options:', options);

      console.log('🟢 About to call mongoose.connect...');
      try {
        await mongoose.connect(mongoUri, options);
        console.log('✅ Connected!');
      } catch (err) {
        console.error('❌ Connection failed:', err.message);
        throw err;
      }
      
      this.isConnected = true;
      console.log('🟢 this.isConnected set to true');
      logger.info('✅ MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      logger.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info('🔌 MongoDB disconnected');
      }
    } catch (error) {
      logger.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Database is not connected' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return { 
        status: 'healthy', 
        message: 'Database is responding',
        details: this.getConnectionStatus()
      };
    } catch (error) {
      logger.error('❌ Database health check failed:', error);
      return { 
        status: 'unhealthy', 
        message: 'Database health check failed',
        error: error.message 
      };
    }
  }
}
console.log('✅ Database class defined');

module.exports = {
  Database,
  connect: async () => {
    const instance = new Database();
    await instance.connect();
    return instance;
  }
}; 