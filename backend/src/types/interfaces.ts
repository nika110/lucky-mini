export enum BLOCKCHAINS {
  SOL = "solana",
  TON = "ton",
}

export interface ISolanaWallet {
  session: string | null; // part of JWT token
  shared_key: string | null;
  nonce: string;
  phantom_account_public_key: string | null; // Public key of the phantom account
  server_public_key: string; // Public key that we will share to phantom wallet to create a Diffie-Hellman key exchange
  server_secret_key: string; // Secret key that we can use to create a shared secret and we that server public key genered by us
}

export interface ITonWallet {}

export interface IWallet {
  walletType: BLOCKCHAINS;
  walletData: ISolanaWallet | ITonWallet;
}

export interface IUser {
  telegramId: string;
  username?: string;
  wallet?: IWallet;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  totalTickets: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRegistration {
  telegramId: string;
  username?: string;
  referralCode?: string;
}

export interface IUserGet {
  telegramId: string;
}

export interface IWalletConnection {
  public_key: string;
  wallet_type: BLOCKCHAINS;
  telegram_id: string;
  signature: string;
}
