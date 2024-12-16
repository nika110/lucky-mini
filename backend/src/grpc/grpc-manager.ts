import grpc from "@grpc/grpc-js";
import { AuthClient, RaffleClient } from "./grpc-client";

interface HealthCheckResult {
  raffle: boolean;
  auth: boolean;
}

export class GrpcManager {
  private static instance: GrpcManager | null = null;
  private static initializationPromise: Promise<GrpcManager> | null = null;
  private raffleClient: RaffleClient | null = null;
  private authClient: AuthClient | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  private async initialize(): Promise<void> {
    try {
      const RAFFLE_HOST = process.env.RAFFLE_SERVICE_HOST || "localhost";
      const RAFFLE_PORT = process.env.RAFFLE_SERVICE_PORT || "50052";
      const AUTH_HOST = process.env.AUTH_SERVICE_HOST || "localhost";
      const AUTH_PORT = process.env.AUTH_SERVICE_PORT || "50052";

      console.log("Initializing gRPC clients...");
      console.log(`Raffle: ${RAFFLE_HOST}:${RAFFLE_PORT}`);
      console.log(`Auth: ${AUTH_HOST}:${AUTH_PORT}`);

      this.raffleClient = new RaffleClient(`${RAFFLE_HOST}:${RAFFLE_PORT}`);
      this.authClient = new AuthClient(`${AUTH_HOST}:${AUTH_PORT}`);

      await Promise.all([
        this.raffleClient.waitForReady(),
        this.authClient.waitForReady(),
      ]);

      this.isInitialized = true;
      console.log("✅ gRPC clients initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize gRPC clients:", error);
      this.isInitialized = false;
      throw error;
    }
  }

  public static async getInstance(): Promise<GrpcManager> {
    if (!GrpcManager.instance) {
      GrpcManager.instance = new GrpcManager();
      // Сохраняем промис инициализации
      GrpcManager.initializationPromise = GrpcManager.instance
        .initialize()
        .then(() => GrpcManager.instance!);
    }

    if (GrpcManager.initializationPromise) {
      await GrpcManager.initializationPromise;
    }

    return GrpcManager.instance;
  }

  public getRaffleClient(): RaffleClient {
    if (!this.isInitialized || !this.raffleClient) {
      throw new Error("GrpcManager not initialized yet");
    }
    return this.raffleClient;
  }

  public getAuthClient(): AuthClient {
    if (!this.isInitialized || !this.authClient) {
      throw new Error("GrpcManager not initialized yet");
    }
    return this.authClient;
  }

  public async healthCheck(): Promise<HealthCheckResult> {
    if (!this.isInitialized) {
      return { raffle: false, auth: false };
    }

    const health: HealthCheckResult = {
      raffle: false,
      auth: false,
    };

    try {
      if (this.raffleClient?.isReady()) {
        // await this.raffleClient.();
        health.raffle = true;
      }
    } catch (error: any) {
      console.error("Raffle health check failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
    }

    try {
      if (this.authClient?.isReady()) {
        await this.authClient.validateToken("health-check");
        health.auth = true;
      }
    } catch (error: any) {
      // Special case: these errors mean the service is actually working
      if (
        error.code === grpc.status.UNAUTHENTICATED ||
        error.code === grpc.status.INVALID_ARGUMENT
      ) {
        health.auth = true;
      } else {
        console.error("Auth health check failed:", {
          message: error.message,
          code: error.code,
          details: error.details,
          stack: error.stack,
        });
      }
    }

    return health;
  }

  public async shutdown(): Promise<void> {
    if (this.raffleClient) {
      // Add cleanup if needed
    }
    if (this.authClient) {
      // Add cleanup if needed
    }
    this.isInitialized = false;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}
