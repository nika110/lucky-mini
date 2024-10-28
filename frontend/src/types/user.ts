export enum BLOCKCHAINS {
  SOL = "solana",
  TON = "ton",
}

export interface SolanaWallet {
  session: string | null; // part of JWT token
  nonce: string;
  phantom_account_public_key: string | null; // Public key of the phantom account
}

export interface TonWallet {
  address: string;
}

export interface Wallet {
  walletType: BLOCKCHAINS;
  walletData: SolanaWallet | TonWallet;
}

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
