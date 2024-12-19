import { User, Raffle, Ticket } from "./src/models/shemas";
import mongoose from "mongoose";
import redisService from "./src/config/redis";
import app from "./app";
import { GrpcManager } from "./src/grpc/grpc-manager";

interface ServerConfig {
  port: number;
  mongoUri: string;
}

class Server {
  private static instance: Server | null = null;
  private static initializationPromise: Promise<Server> | null = null;
  private config: ServerConfig;
  private isShuttingDown: boolean = false;
  private server: any;
  private grpcManager: GrpcManager;

  private constructor(grpcManager: GrpcManager) {
    this.config = {
      port: parseInt(process.env.PORT || "5000", 10),
      mongoUri: process.env.MONGODB_URI || "mongodb://mongodb:27017/raffle_db",
    };
    this.grpcManager = grpcManager;
  }

  public static async getInstance(): Promise<Server> {
    if (!Server.instance) {
      const grpcManager = await GrpcManager.getInstance();
      Server.instance = new Server(grpcManager);
    }
    return Server.instance;
  }

  private async connectMongo(): Promise<void> {
    console.log("MongoDB connecting...");

    try {
      const conn = await mongoose.connect("mongodb://mongodb:27017/raffle_db", {
        maxPoolSize: 100,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      const collection = conn.connection.collection("users");

      // Register models with explicit collection names
      conn.model("User", User.schema, "users");
      conn.model("Raffle", Raffle.schema, "raffles");
      conn.model("Ticket", Ticket.schema, "tickets");

      try {
        const user = await collection.findOne({
          telegram_id: "1027739327",
        });
        console.log("USEqwewqewqeR:", user);
        console.log("USERweeer ID:", user?.telegram_id);
        // console.log("USERS:", collection.find({}));
      } catch (error) {
        console.log("errrrrror user");
      }

      // Verify collections
      const collections = await mongoose.connection
        .db!.listCollections()
        .toArray();
      const collectionNames = collections.map((col) => col.name);

      console.log("Collections:", collectionNames);
      const requiredCollections = [
        "users",
        "raffles",
        // "tickets"
      ];
      const missingCollections = requiredCollections.filter(
        (name) => !collectionNames.includes(name)
      );

      if (missingCollections.length > 0) {
        throw new Error(
          `Missing required collections: ${missingCollections.join(", ")}`
        );
      }

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      console.log("Collections verified:", collectionNames);
    } catch (error) {
      console.error("❌ Error connecting to MongoDB:", error);
      throw error;
    }
  }

  private async validateMongoConnection(): Promise<boolean> {
    try {
      const models = mongoose.modelNames();
      const requiredModels = [
        "User",
        "Raffle",
        // "Ticket"
      ];
      const missingModels = requiredModels.filter(
        (model) => !models.includes(model)
      );

      if (missingModels.length > 0) {
        console.error(`Missing required models: ${missingModels.join(", ")}`);
        return false;
      }

      // Test connection by running a simple query
      await mongoose.model("User").findOne({}).exec();
      return true;
    } catch (error) {
      console.error("MongoDB validation failed:", error);
      return false;
    }
  }

  private setupProcessHandlers(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;

      this.isShuttingDown = true;
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      try {
        // Close HTTP server
        if (this.server) {
          await new Promise((resolve) => {
            this.server.close((err) => {
              if (err) {
                console.error("❌ Error closing HTTP server:", err);
              }
              resolve(true);
            });
          });
          console.log("✅ HTTP server closed");
        }

        // Shutdown gRPC clients
        await this.grpcManager.shutdown();
        console.log("✅ gRPC clients shutdown");

        // Disconnect Redis
        await redisService.disconnect();
        console.log("✅ Redis disconnected");

        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log("✅ MongoDB disconnected");
        }

        console.log("👋 Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    // Process handlers
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle uncaught exceptions and rejections
    process.on("uncaughtException", (error: Error) => {
      console.error("❌ Uncaught Exception:", error);
      shutdown("UNCAUGHT EXCEPTION");
    });

    process.on("unhandledRejection", (reason: unknown) => {
      console.error("❌ Unhandled Rejection:", reason);
      shutdown("UNHANDLED REJECTION");
    });
  }

  private async healthCheck(): Promise<boolean> {
    try {
      const isMongoConnected = await this.validateMongoConnection();
      const isRedisConnected = await redisService.healthCheck();
      const grpcHealth = await this.grpcManager.healthCheck();

      if (!grpcHealth.raffle || !grpcHealth.auth) {
        console.warn("Services health status:", {
          mongo: isMongoConnected ? "✅" : "❌",
          redis: isRedisConnected ? "✅" : "❌",
          raffle: grpcHealth.raffle ? "✅" : "❌",
          auth: grpcHealth.auth ? "✅" : "❌",
        });
      }

      return (
        isMongoConnected &&
        isRedisConnected &&
        grpcHealth.raffle &&
        grpcHealth.auth
      );
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return false;
    }
  }

  async waitForGrpcServices(retries = 15, delay = 2000): Promise<void> {
    console.log("Waiting for gRPC services to be ready...");

    for (let i = 0; i < retries; i++) {
      try {
        const health = await this.grpcManager.healthCheck();

        console.log("gRPC services health check result:", {
          attempt: i + 1,
          raffle: health.raffle ? "✅" : "❌",
          auth: health.auth ? "✅" : "❌",
        });

        if (health.auth && health.raffle) {
          console.log("✅ Successfully connected to all gRPC services");
          return;
        }

        if (i < retries - 1) {
          const nextDelay = delay * Math.pow(1.5, Math.min(i, 4));
          console.log(
            `Retrying in ${nextDelay}ms... (Attempt ${i + 1}/${retries})`
          );
          await new Promise((resolve) => setTimeout(resolve, nextDelay));
        }
      } catch (error: any) {
        console.error(`Attempt ${i + 1}/${retries} failed:`, {
          error: error.message,
          code: error.code,
          details: error.details,
          stack: error.stack,
        });

        if (i < retries - 1) {
          const nextDelay = delay * Math.pow(1.5, Math.min(i, 4));
          console.log(`Retrying in ${nextDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, nextDelay));
        }
      }
    }

    throw new Error("Failed to connect to gRPC services after all retries");
  }

  public async start(): Promise<void> {
    try {
      console.log(`🚀 Starting server in ${process.env.NODE_ENV} mode...`);

      // Setup process handlers first
      this.setupProcessHandlers();

      // Connect to MongoDB
      await this.connectMongo();

      // Wait for gRPC services to be ready
      await this.waitForGrpcServices();

      // Check Redis connection
      const redisHealth = await redisService.healthCheck();
      if (!redisHealth) {
        throw new Error("Redis health check failed");
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
          console.error("❌ Service unhealthy. Initiating shutdown...");
          await this.shutdown("HEALTH_CHECK_FAILED");
        }
      }, 30000);
    } catch (error) {
      console.error("❌ Error starting server:", error);
      process.exit(1);
    }
  }

  private async shutdown(signal: string): Promise<void> {
    await this.setupProcessHandlers();
  }
}

// Start the server
(async () => {
  try {
    const server = await Server.getInstance();
    await server.start();
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();

export default Server;
