import {
  BLOCKCHAINS,
  ISolanaWallet,
  ITonWallet,
  IWallet,
} from "../types/interfaces";
// import { User } from "../models/User";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { CustomError } from "../utils/customError";

// Service layer for wallet operations
export class WalletService {
  // private static generateKeyPair(): {
  //   publicKey58: string;
  //   secretKey58: string;
  //   nonce: string;
  // } {
  //   try {
  //     const pairOfKeys = nacl.box.keyPair();
  //     const nonce = nacl.randomBytes(24);

  //     return {
  //       publicKey58: bs58.encode(pairOfKeys.publicKey),
  //       secretKey58: bs58.encode(pairOfKeys.secretKey),
  //       nonce: bs58.encode(nonce),
  //     };
  //   } catch (error) {
  //     console.log("Error generating key pair:", error);
  //     throw new CustomError(
  //       "WALLET_GENERATION_ERROR",
  //       "Failed to generate wallet keys"
  //     );
  //   }
  // }

  // public static async initializeTonWallet(
  //   telegramId: string
  // ): Promise<IWallet> {
  //   try {
  //     const walletData: ITonWallet = {
  //       address: null,
  //     };

  //     const wallet: IWallet = {
  //       walletType: BLOCKCHAINS.TON,
  //       walletData,
  //     };

  //     const updatedUser = await User.findOneAndUpdate(
  //       { telegramId },
  //       {
  //         $set: { wallet },
  //         $setOnInsert: { walletInitializedAt: new Date() },
  //       },
  //       { new: true, runValidators: true }
  //     );

  //     if (!updatedUser) {
  //       throw new CustomError(
  //         "USER_NOT_FOUND",
  //         "User not found when initializing wallet"
  //       );
  //     }

  //     console.log(`Solana wallet initialized for user ${telegramId}`);
  //     return wallet;
  //   } catch (error) {
  //     console.log(
  //       `Failed to initialize Solana wallet for user ${telegramId}:`,
  //       error
  //     );
  //     throw error;
  //   }
  // }

  // public static async initializeSolanaWallet(
  //   telegramId: string
  // ): Promise<IWallet> {
  //   try {
  //     const { publicKey58, secretKey58, nonce } = this.generateKeyPair();

  //     const walletData: ISolanaWallet = {
  //       signature: null,
  //       session: null,
  //       shared_key: null,
  //       nonce,
  //       phantom_account_public_key: null,
  //       server_public_key: publicKey58,
  //       server_secret_key: secretKey58,
  //     };

  //     const wallet: IWallet = {
  //       walletType: BLOCKCHAINS.SOL,
  //       walletData,
  //     };

  //     const updatedUser = await User.findOneAndUpdate(
  //       { telegramId },
  //       {
  //         $set: { wallet },
  //         $setOnInsert: { walletInitializedAt: new Date() },
  //       },
  //       { new: true, runValidators: true }
  //     );

  //     if (!updatedUser) {
  //       throw new CustomError(
  //         "USER_NOT_FOUND",
  //         "User not found when initializing wallet"
  //       );
  //     }

  //     console.log(`Solana wallet initialized for user ${telegramId}`);
  //     return wallet;
  //   } catch (error) {
  //     console.log(
  //       `Failed to initialize Solana wallet for user ${telegramId}:`,
  //       error
  //     );
  //     throw error;
  //   }
  // }
}
