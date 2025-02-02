// import { Wallet } from "./wallet";

// export interface User {
//   telegramId: string;
//   username?: string;
//   wallet?: Wallet;
//   referralCode: string;
//   referredBy?: string;
//   referralCount: number;
//   totalTickets: number;
//   balance: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

export interface User {
  id: string;
  telegram_id: string;
  ton_public_key: string;
  balance: number;
  created_at: Date;
  xp: number;
  referred_by?: string;
}

export interface TgUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface ReferralUser {
  telegram_id: string;
  xp: number;
}

export interface AppInitParams {
  referralCode?: string;
}
