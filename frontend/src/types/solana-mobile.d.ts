declare module '@solana-mobile/mobile-wallet-adapter-protocol-web3js' {
  import { PublicKey } from '@solana/web3.js';

  export interface AuthorizeAPI {
    authorize: (params: {
      cluster?: string;
      identity: {
        name: string;
        uri?: string;
        icon?: string;
      };
    }) => Promise<{
      accounts: {
        address: string;
        label?: string;
        publicKey: PublicKey;
      }[];
      auth_token: string;
    }>;
  }

  export interface WalletAPI extends AuthorizeAPI {
    disconnect: () => Promise<void>;
  }

  export function transact<T>(
    callback: (wallet: WalletAPI) => Promise<T>
  ): Promise<T>;
}