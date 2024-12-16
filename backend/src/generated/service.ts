// src/generated/service.ts
import type * as grpc from "@grpc/grpc-js";

// User Types
export interface UserProfile {
  id: string;
  telegram_id: string;
  ton_public_key: string;
  balance: number;
  created_at: number;
  xp: number;
  referred_by?: string;
  referrals: string[];
}

// Auth Types
export interface AuthTelegramRequest {
  telegram_id: string;
  telegram_auth_code: string;
  referred_by?: string;
}

export interface AuthTelegramResponse {
  token: string;
  user: UserProfile;
}

export interface UpdateTonWalletRequest {
  telegram_id: string;
  ton_public_key: string;
}

export interface UpdateTonWalletResponse {
  user: UserProfile;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  is_valid: boolean;
  user: UserProfile;
}

export interface UpdateUserReferralRequest {
  user_id: string;
  referred_by: string;
}

export interface UpdateUserReferralResponse {
  user: UserProfile;
}

export interface GetConfigRequest {}

export interface GetConfigResponse {
  ticket_price: number;
}

export interface ListUserReferralsRequest {
  user_id: string;
}

export interface ListUserReferralsResponse {
  telegram_ids: string[];
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

  updateUserReferral(
    request: UpdateUserReferralRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: UpdateUserReferralResponse
    ) => void
  ): grpc.ClientUnaryCall;

  getConfig(
    request: GetConfigRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: GetConfigResponse
    ) => void
  ): grpc.ClientUnaryCall;

  listUserReferrals(
    request: ListUserReferralsRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: ListUserReferralsResponse
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
  updateUserReferral: grpc.handleUnaryCall<
    UpdateUserReferralRequest,
    UpdateUserReferralResponse
  >;
  getConfig: grpc.handleUnaryCall<GetConfigRequest, GetConfigResponse>;
  listUserReferrals: grpc.handleUnaryCall<
    ListUserReferralsRequest,
    ListUserReferralsResponse
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
  updateUserReferral: {
    path: "/auth.AuthService/UpdateUserReferral",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateUserReferralRequest) =>
      Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: UpdateUserReferralResponse) =>
      Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  getConfig: {
    path: "/auth.AuthService/GetConfig",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetConfigRequest) =>
      Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: GetConfigResponse) =>
      Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  listUserReferrals: {
    path: "/auth.AuthService/ListUserReferrals",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ListUserReferralsRequest) =>
      Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: ListUserReferralsResponse) =>
      Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => {
      return JSON.parse(value.toString());
    },
  },
};

// !!!!!!!!!!!!
// ____________
// Raffle Types

export interface PurchaseTicketsRequest {
  user_id: string;
  ticket_count: number;
}

export interface PurchaseTicketsResponse {
  ticket_numbers: string[];
  raffle_id: string;
}

export interface GetCurrentRaffleRequest {
  user_auth_token: string;
}

export interface GetCurrentRaffleResponse {
  raffle_id: string;
  end_time: number;
  current_pool: number;
  participating: boolean;
}

export interface IncreaseBalanceRequest {
  user_id: string;
  amount: number;
}

export interface IncreaseBalanceResponse {
  balance: number;
}

export interface GetRaffleResultsRequest {
  raffle_id: string;
}

export interface Winner {
  user_id: string;
  amount: number;
  position: number;
}

export interface GetRaffleResultsResponse {
  winners: Winner[];
  total_pool: number;
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
  increaseBalance(
    request: IncreaseBalanceRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (
      error: grpc.ServiceError | null,
      response: IncreaseBalanceResponse
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
  increaseBalance: grpc.handleUnaryCall<
    IncreaseBalanceRequest,
    IncreaseBalanceResponse
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
    increaseBalance: {
      path: "/raffle.RaffleService/IncreaseBalance",
      requestStream: false,
      responseStream: false,
      requestSerialize: (value: IncreaseBalanceRequest) =>
        Buffer.from(JSON.stringify(value)),
      requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
      responseSerialize: (value: IncreaseBalanceResponse) =>
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
