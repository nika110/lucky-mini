export enum BLOCKCHAINS {
  SOL = "solana",
  TON = "ton",
}

export interface SolanaWalletData {
  signature: string | null;
  session?: string | null;
  nonce: string;
  server_public_key: string;
  phantom_account_public_key?: string | null;
}

export interface ITonWallet {
  address: string;
}

export interface Wallet {
  walletType: BLOCKCHAINS;
  walletData: SolanaWalletData | ITonWallet | null;
}

export interface SolanaWallet extends Wallet {
  walletData: SolanaWalletData;
}

export interface InitSignMessage {
  payload: string;
  nonce: string;
}
