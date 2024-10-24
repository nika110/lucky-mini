// src/server.ts
import mongoose from 'mongoose';
import redisService from './src/config/redis';
import app from './app';

interface ServerConfig {
  port: number;
  mongoUri: string;
}

class Server {
  private static instance: Server;
  private config: ServerConfig;
  private isShuttingDown: boolean = false;

  private constructor() {
    this.config = {
      port: parseInt(process.env.PORT || '5000', 10),
      mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/raffle_app'
    };
  }

  public static getInstance(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }
    return Server.instance;
  }

  private async connectMongo(): Promise<void> {
    try {
      await mongoose.connect(this.config.mongoUri, {
      });
      
      mongoose.connection.on('connected', () => {
        console.log('📦 MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
      });

      mongoose.connection.on('disconnected', () => {
        if (!this.isShuttingDown) {
          console.log('🔄 MongoDB disconnected. Attempting to reconnect...');
        }
      });
    } catch (error) {
      console.error('❌ Error connecting to MongoDB:', error);
      process.exit(1);
    }
  }

  private setupProcessHandlers(): void {
    // Handle process termination
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      
      this.isShuttingDown = true;
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      try {
        // Close server
        if (this.server) {
          await new Promise((resolve) => {
            this.server.close((err) => {
              if (err) {
                console.error('❌ Error closing HTTP server:', err);
              }
              resolve(true);
            });
          });
          console.log('✅ HTTP server closed');
        }

        // Disconnect Redis
        await redisService.disconnect();
        console.log('✅ Redis disconnected');

        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log('✅ MongoDB disconnected');
        }

        console.log('👋 Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Process handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error: Error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('UNCAUGHT EXCEPTION');
    });

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('❌ Unhandled Rejection:', reason);
      shutdown('UNHANDLED REJECTION');
    });
  }

  private async healthCheck(): Promise<boolean> {
    try {
      // Check MongoDB connection
      const isMongoConnected = mongoose.connection.readyState === 1;
      
      // Check Redis connection
      const isRedisConnected = await redisService.healthCheck();

      return isMongoConnected && isRedisConnected;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  private server: any;

  public async start(): Promise<void> {
    try {
      console.log(`🚀 Starting server in ${process.env.NODE_ENV} mode...`);

      // Setup process handlers first
      this.setupProcessHandlers();

      // Connect to MongoDB
      await this.connectMongo();

      // Redis is already initialized through the import
      // Just verify the connection
      const redisHealth = await redisService.healthCheck();
      if (!redisHealth) {
        throw new Error('Redis health check failed');
      }

      // Start HTTP server
      this.server = app.listen(this.config.port, () => {
        console.log(`
        🚀 Server running on port ${this.config.port}
        📝 Environment: ${process.env.NODE_ENV}
        🌐 URL: http://localhost:${this.config.port}
        `);
      });

      // Periodic health checks
      setInterval(async () => {
        const isHealthy = await this.healthCheck();
        if (!isHealthy && !this.isShuttingDown) {
          console.error('❌ Service unhealthy. Initiating shutdown...');
          await shutdown('UNHEALTHY');
        }
      }, 30000); // Check every 30 seconds

    } catch (error) {
      console.error('❌ Error starting server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = Server.getInstance();
server.start().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default Server;

function shutdown(arg0: string) {
  throw new Error('Function not implemented.');
}
