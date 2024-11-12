import { RaffleClient, AuthClient } from "./grpc-client";
import * as grpc from "@grpc/grpc-js";

export class GrpcManager {
  private static instance: GrpcManager;
  private raffleClient: RaffleClient;
  private authClient: AuthClient;
  private isShuttingDown: boolean = false;

  private constructor() {
    const RAFFLE_HOST = process.env.RAFFLE_SERVICE_HOST || "app";
    const AUTH_HOST = process.env.AUTH_SERVICE_HOST || "app";
    const RAFFLE_PORT = process.env.RAFFLE_SERVICE_PORT || "50052";
    const AUTH_PORT = process.env.AUTH_SERVICE_PORT || "50052";

    this.raffleClient = new RaffleClient(`${RAFFLE_HOST}:${RAFFLE_PORT}`);
    this.authClient = new AuthClient(`${AUTH_HOST}:${AUTH_PORT}`);

    console.log(`Connecting to Raffle service at: ${RAFFLE_HOST}:${RAFFLE_PORT}`);
    console.log(`Connecting to Auth service at: ${AUTH_HOST}:${AUTH_PORT}`);
  }

  public static getInstance(): GrpcManager {
    if (!GrpcManager.instance) {
      GrpcManager.instance = new GrpcManager();
    }
    return GrpcManager.instance;
  }

  public getRaffleClient(): RaffleClient {
    return this.raffleClient;
  }

  public getAuthClient(): AuthClient {
    return this.authClient;
  }

  public async healthCheck(): Promise<{
    raffle: boolean;
    auth: boolean;
  }> {
    const health = {
      raffle: false,
      auth: false,
    };

    if (this.isShuttingDown) {
      return health;
    }

    try {
      await this.raffleClient.getCurrentRaffle();
      health.raffle = true;
    } catch (error: any) {
      console.error("Raffle service health check failed:", {
        code: error.code,
        details: error.details,
        message: error.message,
        stack: error.stack
      });
    }

    try {
      const response = await this.authClient.validateToken("health-check");
      console.log("Auth validateToken response:", response);
      health.auth = true;
    } catch (error: any) {
      if (error.code === grpc.status.UNAUTHENTICATED || 
          error.code === grpc.status.INVALID_ARGUMENT) {
        console.log("Expected auth error (service is up):", {
          code: error.code,
          details: error.details
        });
        health.auth = true;
      } else {
        console.error("Auth service health check failed:", {
          code: error.code,
          details: error.details,
          message: error.message,
          stack: error.stack,
          metadata: error.metadata?.getMap()
        });
      }
    }

    return health;
  }

  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
  }
}