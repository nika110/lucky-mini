// src/generated/service.ts
import type * as grpc from "@grpc/grpc-js";

// User Types
export interface UserProfile {
  id: string;
  telegramId: string;
  tonPublicKey: string;
  balance: number;
  createdAt: number;
  xp: number;
  referredBy?: string;
}

// Auth Types
export interface AuthTelegramRequest {
  telegramId: string;
  referredBy?: string;
}

export interface AuthTelegramResponse {
  token: string;
  user: UserProfile;
}

export interface UpdateTonWalletRequest {
  telegramId: string;
  tonPublicKey: string;
}

export interface UpdateTonWalletResponse {
  user: UserProfile;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  user: UserProfile;
}

// Auth Service Client Interface
export interface AuthServiceClient extends grpc.Client {
  authenticateTelegram(
    request: AuthTelegramRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: AuthTelegramResponse
    ) => void
  ): grpc.ClientUnaryCall;

  updateTonWallet(
    request: UpdateTonWalletRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: UpdateTonWalletResponse
    ) => void
  ): grpc.ClientUnaryCall;

  validateToken(
    request: ValidateTokenRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: ValidateTokenResponse
    ) => void
  ): grpc.ClientUnaryCall;
}

// Auth Service Interface
export interface AuthServiceServer extends grpc.UntypedServiceImplementation {
  authenticateTelegram: grpc.handleUnaryCall<
    AuthTelegramRequest,
    AuthTelegramResponse
  >;
  updateTonWallet: grpc.handleUnaryCall<
    UpdateTonWalletRequest,
    UpdateTonWalletResponse
  >;
  validateToken: grpc.handleUnaryCall<
    ValidateTokenRequest,
    ValidateTokenResponse
  >;
}

// Auth Service Definition
export const AuthServiceService: grpc.ServiceDefinition<AuthServiceServer> = {
  authenticateTelegram: {
    path: "/auth.AuthService/AuthenticateTelegram",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AuthTelegramRequest) =>
      Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: AuthTelegramResponse) =>
      Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  updateTonWallet: {
    path: "/auth.AuthService/UpdateTonWallet",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateTonWalletRequest) =>
      Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: UpdateTonWalletResponse) =>
      Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  validateToken: {
    path: "/auth.AuthService/ValidateToken",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ValidateTokenRequest) =>
      Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: ValidateTokenResponse) =>
      Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
};

// Raffle Types
export interface PurchaseTicketsRequest {
  userId: string;
  ticketCount: number;
}

export interface PurchaseTicketsResponse {
  ticketNumbers: string[];
  raffleId: string;
}

export interface GetCurrentRaffleRequest {}

export interface GetCurrentRaffleResponse {
  raffleId: string;
  endTime: number;
  currentPool: number;
}

export interface GetRaffleResultsRequest {
  raffleId: string;
}

export interface Winner {
  userId: string;
  amount: number;
  position: number;
}

export interface GetRaffleResultsResponse {
  winners: Winner[];
  totalPool: number;
}

// Raffle Service Client Interface
export interface RaffleServiceClient extends grpc.Client {
  purchaseTickets(
    request: PurchaseTicketsRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: PurchaseTicketsResponse
    ) => void
  ): grpc.ClientUnaryCall;

  getCurrentRaffle(
    request: GetCurrentRaffleRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: GetCurrentRaffleResponse
    ) => void
  ): grpc.ClientUnaryCall;

  getRaffleResults(
    request: GetRaffleResultsRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: GetRaffleResultsResponse
    ) => void
  ): grpc.ClientUnaryCall;
}

// Raffle Service Interface
export interface RaffleServiceServer extends grpc.UntypedServiceImplementation {
  purchaseTickets: grpc.handleUnaryCall<
    PurchaseTicketsRequest,
    PurchaseTicketsResponse
  >;
  getCurrentRaffle: grpc.handleUnaryCall<
    GetCurrentRaffleRequest,
    GetCurrentRaffleResponse
  >;
  getRaffleResults: grpc.handleUnaryCall<
    GetRaffleResultsRequest,
    GetRaffleResultsResponse
  >;
}

// Raffle Service Definition
export const RaffleServiceService: grpc.ServiceDefinition<RaffleServiceServer> =
  {
    purchaseTickets: {
      path: "/raffle.RaffleService/PurchaseTickets",
      requestStream: false,
      responseStream: false,
      requestSerialize: (value: PurchaseTicketsRequest) =>
        Buffer.from(JSON.stringify(value)),
      requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
      responseSerialize: (value: PurchaseTicketsResponse) =>
        Buffer.from(JSON.stringify(value)),
      responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    },
    getCurrentRaffle: {
      path: "/raffle.RaffleService/GetCurrentRaffle",
      requestStream: false,
      responseStream: false,
      requestSerialize: (value: GetCurrentRaffleRequest) =>
        Buffer.from(JSON.stringify(value)),
      requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
      responseSerialize: (value: GetCurrentRaffleResponse) =>
        Buffer.from(JSON.stringify(value)),
      responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    },
    getRaffleResults: {
      path: "/raffle.RaffleService/GetRaffleResults",
      requestStream: false,
      responseStream: false,
      requestSerialize: (value: GetRaffleResultsRequest) =>
        Buffer.from(JSON.stringify(value)),
      requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
      responseSerialize: (value: GetRaffleResultsResponse) =>
        Buffer.from(JSON.stringify(value)),
      responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    },
  };

// Helper type for the service client constructor
export interface RaffleServiceClient extends grpc.Client {
  [method: string]: Function;
}

export interface AuthServiceClient extends grpc.Client {
  [method: string]: Function;
}
