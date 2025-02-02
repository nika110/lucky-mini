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
  GetCurrentRaffleRequest,
  GetConfigResponse,
  ListUserReferralsResponse,
  ListUserReferralsRequest,
  IncreaseBalanceResponse,
  IncreaseBalanceRequest,
  IncreaseXpRequest,
  IncreaseXpResponse,
  GameType,
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
  private isInitialized: boolean = false;

  constructor(host: string) {
    super();
    const protoPath = path.resolve(__dirname, "../../protos/raffle.proto");
    console.log("Proto path:", protoPath);

    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(
      packageDefinition
    ) as any;
    console.log("Available services:", Object.keys(protoDescriptor));

    if (!protoDescriptor.raffle?.RaffleService) {
      throw new Error("RaffleService not found in proto definition");
    }

    this.client = new protoDescriptor.raffle.RaffleService(
      host,
      grpc.credentials.createInsecure()
    );
  }

  // Public method to check connection
  public async waitForReady(timeoutMs: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = new Date().setMilliseconds(
        new Date().getMilliseconds() + timeoutMs
      );
      this.client.waitForReady(deadline, (error) => {
        if (error) {
          this.isInitialized = false;
          reject(error);
        } else {
          this.isInitialized = true;
          resolve();
        }
      });
    });
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  async purchaseTickets(
    userId: string,
    ticketCount: number,
    gameType: GameType,
    toNumber: string
  ): Promise<PurchaseTicketsResponse> {
    const request: PurchaseTicketsRequest = {
      user_id: userId,
      ticket_count: ticketCount,
      game_type: gameType,
    };

    if (toNumber) {
      request.toNumber = toNumber;
    }

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

  async getCurrentRaffle(
    userAuthToken: string
  ): Promise<GetCurrentRaffleResponse> {
    const request: GetCurrentRaffleRequest = {
      user_auth_token: userAuthToken,
    };
    return new Promise((resolve, reject) => {
      this.client.getCurrentRaffle(
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

  async increaseBalance(
    user_id: string,
    amount: number
  ): Promise<IncreaseBalanceResponse> {
    const request: IncreaseBalanceRequest = { user_id, amount };
    return new Promise((resolve, reject) => {
      this.client.increaseBalance(
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

  async getRaffleResults(raffle_id: string): Promise<GetRaffleResultsResponse> {
    const request: GetRaffleResultsRequest = { raffle_id };

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
  private grpcClient: AuthServiceClient;
  private isInitialized: boolean = false;

  constructor(host: string) {
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
    this.grpcClient = new proto.auth.AuthService(
      host,
      grpc.credentials.createInsecure()
    );
  }

  public async waitForReady(timeoutMs: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = new Date().setMilliseconds(
        new Date().getMilliseconds() + timeoutMs
      );
      this.grpcClient.waitForReady(deadline, (error) => {
        if (error) {
          this.isInitialized = false;
          reject(error);
        } else {
          this.isInitialized = true;
          resolve();
        }
      });
    });
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  async authenticateTelegram(
    telegram_id: string,
    telegram_auth_code: string,
    referred_by?: string
  ): Promise<AuthTelegramResponse> {
    if (!this.isInitialized) {
      throw new Error("gRPC client not initialized");
    }

    const request: AuthTelegramRequest = {
      telegram_id,
      referred_by,
      telegram_auth_code,
    };

    return new Promise((resolve, reject) => {
      this.grpcClient.authenticateTelegram(
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

  async getConfig(): Promise<GetConfigResponse> {
    if (!this.isInitialized) {
      throw new Error("gRPC client not initialized");
    }
    return new Promise((resolve, reject) => {
      this.grpcClient.getConfig(
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

  async listUserReferrals(user_id: string): Promise<ListUserReferralsResponse> {
    if (!this.isInitialized) {
      throw new Error("gRPC client not initialized");
    }

    const request: ListUserReferralsRequest = { user_id };

    return new Promise((resolve, reject) => {
      this.grpcClient.listUserReferrals(
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
    telegram_id: string,
    ton_public_key: string
  ): Promise<UpdateTonWalletResponse> {
    if (!this.isInitialized) {
      throw new Error("gRPC client not initialized");
    }

    const request: UpdateTonWalletRequest = { telegram_id, ton_public_key };

    return new Promise((resolve, reject) => {
      this.grpcClient.updateTonWallet(
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
    if (!this.isInitialized) {
      throw new Error("gRPC client not initialized");
    }

    const request: ValidateTokenRequest = { token };

    return new Promise((resolve, reject) => {
      this.grpcClient.validateToken(
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

  async increaseXp(user_id: string, xp: number): Promise<IncreaseXpResponse> {
    const request: IncreaseXpRequest = { user_id, xp };
    return new Promise((resolve, reject) => {
      this.grpcClient.increaseXp(
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
