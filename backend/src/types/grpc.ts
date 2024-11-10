// AUTH PROTO
import { IUser } from "./interfaces";

export interface ProtoAuthTGReq {
  telegram_id: string;
  referred_by?: string;
}

export interface ProtoAuthTGRes {
  token: string;
  user: IUser;
}

export interface ProtoUpdateTonWalletReq {
  telegram_id: string;
  ton_public_key: string;
}

export interface ProtoUpdateTonWalletRes {
  user: IUser;
}

export interface ProtoValidateTokenReq {
  token: string;
}

export interface ProtoValidateTokenRes {
  user: IUser;
  is_valid: boolean;
}

// RAFFLE PROTO

export interface ProtoPurchaseTicketsReq {
  user_id: string;
  ticket_count: number;
}

export interface ProtoPurchaseTicketsRes {
  ticket_numbers: string[];
  raffle_id: string;
}

export interface ProtoGetCurrentRaffleRes {
  raffle_id: string;
  end_time: number;
  current_pool: number;
}

export interface ProtoGetRaffleResultsReq {
  raffle_id: string;
}

export interface ProtoWinner {
  user_id: string;
  amount: number;
  position: number;
}

export interface ProtoUserProfile {
  id: string;
  telegram_id: string;
  ton_public_key: string;
  balance: number;
  created_at: number;
  xp: number;
  referred_by?: string;
}

export interface ProtoGetRaffleResultsRes {
  winners: ProtoWinner[];
  total_pool: number;
}
