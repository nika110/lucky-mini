import { Wallet } from "./wallet";

export interface User {
  telegramId: string;
  username?: string;
  wallet?: Wallet;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  totalTickets: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppInitParams {
  referralCode?: string;
}
