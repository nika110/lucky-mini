export interface IUser {
    telegramId: string;
    username?: string;
    walletAddresses: {
      ton?: string;
      solana?: string;
    };
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
  
  export interface IWalletConnection {
    public_key: string;
    wallet_type: 'ton' | 'solana';
    telegram_id: string;
    signature: string;
  }