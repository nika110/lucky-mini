// src/grpc-client.ts
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import {
  RaffleServiceClient,
  AuthServiceClient,
  PurchaseTicketsRequest,
  PurchaseTicketsResponse,
  GetCurrentRaffleResponse,
  GetRaffleResultsRequest,
  GetRaffleResultsResponse,
  AuthTelegramRequest,
  AuthTelegramResponse,
  UpdateTonWalletRequest,
  UpdateTonWalletResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from "../generated/service";

interface GrpcError extends Error {
  code: grpc.status;
  details: string;
  metadata: grpc.Metadata;
}

class BaseGrpcClient {
  protected createDeadline(timeoutMs: number = 5000): number {
    return Date.now() + timeoutMs;
  }

  protected handleGrpcError(error: GrpcError): never {
    const errorMap: Record<grpc.status, string> = {
      [grpc.status.OK]: "Success",
      [grpc.status.CANCELLED]: "Request was cancelled",
      [grpc.status.UNKNOWN]: "Unknown error occurred",
      [grpc.status.INVALID_ARGUMENT]: "Invalid argument provided",
      [grpc.status.DEADLINE_EXCEEDED]: "Request timeout",
      [grpc.status.NOT_FOUND]: "Resource not found",
      [grpc.status.ALREADY_EXISTS]: "Resource already exists",
      [grpc.status.PERMISSION_DENIED]: "Permission denied",
      [grpc.status.RESOURCE_EXHAUSTED]: "Resource exhausted",
      [grpc.status.FAILED_PRECONDITION]: "Failed precondition",
      [grpc.status.ABORTED]: "Operation was aborted",
      [grpc.status.OUT_OF_RANGE]: "Out of range",
      [grpc.status.UNIMPLEMENTED]: "Method not implemented",
      [grpc.status.INTERNAL]: "Internal error",
      [grpc.status.UNAVAILABLE]: "Service unavailable",
      [grpc.status.DATA_LOSS]: "Data loss occurred",
      [grpc.status.UNAUTHENTICATED]: "Authentication failed",
    };

    const errorMessage = errorMap[error.code] || "Unknown gRPC error";
    error.message = `${errorMessage}: ${error.details}`;
    throw error;
  }
}

export class RaffleClient extends BaseGrpcClient {
  private client: RaffleServiceClient;

  constructor(
    host: string = process.env.RAFFLE_SERVICE_HOST || "localhost:50052"
  ) {
    super();
    const currentDir = __dirname;

    const rootDir = path.resolve(currentDir, "../..");

    const protoPath = path.join(rootDir, "protos", "raffle.proto");

    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [path.join(rootDir, "proto")],
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    this.client = new proto.raffle.RaffleService(
      host,
      grpc.credentials.createInsecure()
    );
  }

  async purchaseTickets(
    userId: string,
    ticketCount: number
  ): Promise<PurchaseTicketsResponse> {
    const request: PurchaseTicketsRequest = { userId, ticketCount };

    return new Promise((resolve, reject) => {
      this.client.purchaseTickets(
        request,
        new grpc.Metadata(),
        { deadline: this.createDeadline() },
        (error, response) => {
          if (error) {
            reject(this.handleGrpcError(error as GrpcError));
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async getCurrentRaffle(): Promise<GetCurrentRaffleResponse> {
    return new Promise((resolve, reject) => {
      this.client.getCurrentRaffle(
        {},
        new grpc.Metadata(),
        { deadline: this.createDeadline() },
        (error, response) => {
          if (error) {
            reject(this.handleGrpcError(error as GrpcError));
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async getRaffleResults(raffleId: string): Promise<GetRaffleResultsResponse> {
    const request: GetRaffleResultsRequest = { raffleId };

    return new Promise((resolve, reject) => {
      this.client.getRaffleResults(
        request,
        new grpc.Metadata(),
        { deadline: this.createDeadline() },
        (error, response) => {
          if (error) {
            reject(this.handleGrpcError(error as GrpcError));
          } else {
            resolve(response);
          }
        }
      );
    });
  }
}

export class AuthClient extends BaseGrpcClient {
  private client: AuthServiceClient;

  constructor(
    host: string = process.env.AUTH_SERVICE_HOST || "localhost:50052"
  ) {
    super();
    const currentDir = __dirname;
    const rootDir = path.resolve(currentDir, "../..");
    const protoDir = path.join(rootDir, "protos");

    const packageDefinition = protoLoader.loadSync(
      path.join(protoDir, "auth.proto"),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [protoDir],
      }
    );

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    this.client = new proto.auth.AuthService(
      host,
      grpc.credentials.createInsecure()
    );
  }

  async authenticateTelegram(
    telegramId: string,
    referredBy?: string
  ): Promise<AuthTelegramResponse> {
    const request: AuthTelegramRequest = { telegramId, referredBy };

    return new Promise((resolve, reject) => {
      this.client.authenticateTelegram(
        request,
        new grpc.Metadata(),
        { deadline: this.createDeadline() },
        (error, response) => {
          if (error) {
            reject(this.handleGrpcError(error as GrpcError));
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async updateTonWallet(
    telegramId: string,
    tonPublicKey: string
  ): Promise<UpdateTonWalletResponse> {
    const request: UpdateTonWalletRequest = { telegramId, tonPublicKey };

    return new Promise((resolve, reject) => {
      this.client.updateTonWallet(
        request,
        new grpc.Metadata(),
        { deadline: this.createDeadline() },
        (error, response) => {
          if (error) {
            reject(this.handleGrpcError(error as GrpcError));
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const request: ValidateTokenRequest = { token };

    return new Promise((resolve, reject) => {
      this.client.validateToken(
        request,
        new grpc.Metadata(),
        { deadline: this.createDeadline() },
        (error, response) => {
          if (error) {
            reject(this.handleGrpcError(error as GrpcError));
          } else {
            resolve(response);
          }
        }
      );
    });
  }
}
