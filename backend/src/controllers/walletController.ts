import { Request, Response } from "express";
import { ApiResponse } from "../types/api";
import { BLOCKCHAINS, ISolanaWallet, IWallet } from "../types/interfaces";
import { User } from "../models/User";
import { CustomError } from "../utils/customError";
import { WalletService } from "../services/walletService";
import nacl from "tweetnacl";
import bs58 from "bs58";

export interface InitWalletParams {
  telegramId: string;
}

interface PublicSolanaWalletData {
  server_public_key: string;
  nonce: string;
  phantom_account_public_key: string | null;
  session: string | null;
}

interface PublicWallet extends IWallet {
  walletData: PublicSolanaWalletData;
}

export interface WalletConnection {
  phantom_encryption_public_key: string;
  nonce: string;
  data: string;
}

interface WalletConnectionPayload {
  public_key: string;
  session: string;
}

interface SignatureInitParams {
  telegramId: string;
}

interface SignatureInitBody {
  message: string;
  display?: "utf8" | "hex";
}

interface SignatureInitParams {
  telegramId: string;
}

interface SignatureInitBody {
  display?: "utf8" | "hex";
}

interface SignMessageBody {
  data: string;
  nonce: string;
}

interface EncyptedData {
  nonce: string;
  encryptedPayload: string;
}

export class WalletController {
  public static async getSolanaWallet(
    req: Request<InitWalletParams>,
    res: Response<ApiResponse<PublicWallet>>
  ) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`[${requestId}] Fetching Solana wallet info`);
      const { telegramId } = req.params;

      // Get user with wallet info
      const user = await User.findOne({ telegramId }).select("wallet").lean();

      if (!user) {
        throw new CustomError("USER_NOT_FOUND", "User not found");
      }

      if (!user.wallet) {
        const wallet = await WalletService.initializeSolanaWallet(telegramId);

        return res.status(200).json({
          success: true,
          data: WalletController.sanitizeWalletData(wallet),
          message: "Solana wallet initialized successfully",
        });
      }

      if (user.wallet && user.wallet.walletType !== "solana") {
        throw new CustomError(
          "INVALID_WALLET_TYPE",
          `Expected Solana wallet, but found ${user.wallet.walletType} wallet`
        );
      }

      // Create sanitized response with only public information
      const publicWalletData: PublicWallet =
        WalletController.sanitizeWalletData(user.wallet);

      // Log performance metrics
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Wallet info fetched in ${duration}ms`);

      return res.status(200).json({
        success: true,
        data: publicWalletData,
        message: "Solana wallet information retrieved successfully",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(
        `[${requestId}] Failed to fetch wallet info after ${duration}ms:`,
        error
      );

      if (error instanceof CustomError) {
        return res.status(error.getStatusCode()).json({
          success: false,
          message: error.message,
          error: error.getCode(),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching wallet information",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  public static async walletConnection(
    req: Request<InitWalletParams, {}, WalletConnection>,
    res: Response
  ) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`[${requestId}] Processing wallet connection request`);

      const { telegramId } = req.params;
      const {
        phantom_encryption_public_key,
        nonce: phantom_nonce,
        data: phantom_data,
      } = req.body;

      // Validate base58 encoded strings
      try {
        bs58.decode(phantom_encryption_public_key);
        bs58.decode(phantom_nonce);
        bs58.decode(phantom_data);
      } catch (error) {
        throw new CustomError(
          "INVALID_ENCODING",
          "Invalid base58 encoding in connection parameters"
        );
      }

      // Get user with wallet info
      const user = await User.findOne({ telegramId }).select("wallet").lean();

      if (!user) {
        throw new CustomError("USER_NOT_FOUND", "User not found");
      }

      if (!user.wallet) {
        throw new CustomError(
          "WALLET_NOT_INITIALIZED",
          "Wallet has not been initialized for this user"
        );
      }

      if (user.wallet.walletType !== "solana") {
        throw new CustomError(
          "INVALID_WALLET_TYPE",
          `Expected Solana wallet, but found ${user.wallet.walletType} wallet`
        );
      }

      const wallet = user.wallet.walletData as ISolanaWallet;
      // Validate existing wallet data
      if (!wallet.server_secret_key) {
        throw new CustomError(
          "INVALID_WALLET_STATE",
          "Wallet is in an invalid state"
        );
      }

      let shared_key: Uint8Array;
      try {
        shared_key = nacl.box.before(
          bs58.decode(phantom_encryption_public_key),
          bs58.decode(wallet.server_secret_key)
        );
      } catch (error) {
        throw new CustomError(
          "ENCRYPTION_ERROR",
          "Failed to generate shared key"
        );
      }

      const encodedSharedKey = bs58.encode(shared_key);

      let payloadData: WalletConnectionPayload;
      try {
        payloadData = WalletController.decryptPayloadData(
          phantom_data,
          phantom_nonce,
          encodedSharedKey
        ) as WalletConnectionPayload;
      } catch (error) {
        throw new CustomError(
          "DECRYPTION_ERROR",
          "Failed to decrypt connection payload"
        );
      }
      if (!payloadData) {
        throw new CustomError(
          "INVALID_PAYLOAD_DATA",
          `Expected encrypted payload data, but found ${phantom_data}`
        );
      }

      // Update wallet with new connection info
      const updatedWallet: IWallet = {
        walletType: BLOCKCHAINS.SOL,
        walletData: {
          ...wallet,
          phantom_account_public_key: payloadData.public_key,
          session: payloadData.session,
          shared_key: encodedSharedKey, // Store shared key for future communications
        },
      };

      // Atomic update with validation
      const updatedUser = await User.findOneAndUpdate(
        {
          telegramId,
          "wallet.walletType": BLOCKCHAINS.SOL,
        },
        {
          $set: {
            wallet: updatedWallet,
            lastWalletConnectionAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
          select: "wallet", // Only return wallet data
        }
      );

      if (!updatedUser) {
        throw new CustomError(
          "UPDATE_FAILED",
          "Failed to update wallet information"
        );
      }

      // Log performance metrics
      const duration = Date.now() - startTime;
      console.log(
        `[${requestId}] Wallet connection completed in ${duration}ms`
      );

      // Return sanitized wallet data
      return res.status(200).json({
        success: true,
        data: WalletController.sanitizeWalletData(updatedUser.wallet!),
        message: "Wallet connected successfully",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] Wallet connection failed after ${duration}ms:`,
        error
      );

      if (error instanceof CustomError) {
        return res.status(error.getStatusCode()).json({
          success: false,
          message: error.message,
          error: error.getCode(),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during wallet connection",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  public static async getSignatureInitialization(
    req: Request<SignatureInitParams, {}, SignatureInitBody>,
    res: Response
  ) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`[${requestId}] Processing signature initialization request`);

      const { telegramId } = req.params;
      const { display = "utf8" } = req.body;

      const user = await User.findOne({ telegramId }).select("wallet").lean();
      const message = "Sign this message";

      if (!user) {
        throw new CustomError("USER_NOT_FOUND", "User not found");
      }

      if (!user.wallet) {
        throw new CustomError(
          "WALLET_NOT_INITIALIZED",
          "Wallet has not been initialized for this user"
        );
      }

      const wallet = user.wallet.walletData as ISolanaWallet;

      if (!wallet.shared_key || !wallet.session) {
        throw new CustomError(
          "INVALID_WALLET_STATE",
          "Wallet connection not established"
        );
      }

      const payload = {
        message: bs58.encode(Buffer.from(message)),
        session: wallet.session,
        display,
      };

      let encryptedData: EncyptedData | null = null;

      try {
        encryptedData = WalletController.encryptPayload(
          payload,
          bs58.decode(wallet.shared_key)
        );
      } catch (error) {
        throw new CustomError(
          "ENCRYPTION_ERROR",
          "Failed to encrypt signature payload"
        );
      }

      if (!encryptedData) {
        throw new CustomError(
          "ENCRYPTION_ERROR",
          "Failed to generate encrypted payload"
        );
      }

      const duration = Date.now() - startTime;
      console.log(
        `[${requestId}] Signature initialization completed in ${duration}ms`
      );

      return res.status(200).json({
        success: true,
        data: {
          payload: encryptedData.encryptedPayload,
          nonce: encryptedData.nonce,
        },
        message: "Signature initialization successful",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] Signature initialization failed after ${duration}ms:`,
        error
      );

      if (error instanceof CustomError) {
        return res.status(error.getStatusCode()).json({
          success: false,
          message: error.message,
          error: error.getCode(),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during signature initialization",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  public static async signMessage(
    req: Request<SignatureInitParams, {}, SignMessageBody>,
    res: Response
  ) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`[${requestId}] Processing signature initialization request`);

      const { telegramId } = req.params;
      const { data: sign_data, nonce: sign_nonce } = req.body;

      const user = await User.findOne({ telegramId }).select("wallet").lean();

      if (!user) {
        throw new CustomError("USER_NOT_FOUND", "User not found");
      }

      if (!user.wallet) {
        throw new CustomError(
          "WALLET_NOT_INITIALIZED",
          "Wallet has not been initialized for this user"
        );
      }

      const wallet = user.wallet.walletData as ISolanaWallet;

      if (!wallet.shared_key || !wallet.session) {
        throw new CustomError(
          "INVALID_WALLET_STATE",
          "Wallet connection not established"
        );
      }

      let signData: WalletConnectionPayload;
      try {
        signData = WalletController.decryptPayloadData(
          sign_data,
          sign_nonce,
          wallet.shared_key
        ) as WalletConnectionPayload;
      } catch (error) {
        throw new CustomError(
          "DECRYPTION_ERROR",
          "Failed to decrypt connection payload"
        );
      }

      // OTHER FUNCTIONALITY

      return res.status(200).json({
        success: true,
        data: "ok",
        message: "Signature initialization successful",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] Signature confirmation failed after ${duration}ms:`,
        error
      );

      if (error instanceof CustomError) {
        return res.status(error.getStatusCode()).json({
          success: false,
          message: error.message,
          error: error.getCode(),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during signature initialization",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  private static decryptPayloadData(
    data: string,
    nonce: string,
    sharedSecret: string
  ) {
    const decryptedData = nacl.box.open.after(
      bs58.decode(data),
      bs58.decode(nonce),
      bs58.decode(sharedSecret)
    );

    if (!decryptedData) {
      throw new CustomError(
        "INVALID_PAYLOAD_DATA",
        `Expected encrypted payload data, but found ${data}`
      );
    }

    return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
  }

  public static encryptPayload(
    payload: any,
    sharedSecret?: Uint8Array
  ): EncyptedData {
    if (!sharedSecret) throw new Error("missing shared secret");

    const nonce = nacl.randomBytes(24);

    const encryptedPayload = nacl.box.after(
      Buffer.from(JSON.stringify(payload)),
      nonce,
      sharedSecret
    );

    return {
      nonce: bs58.encode(nonce),
      encryptedPayload: bs58.encode(encryptedPayload),
    };
  }

  // Helper method to sanitize wallet data
  private static sanitizeWalletData(wallet: IWallet): PublicWallet {
    const solanaWallet = wallet.walletData as ISolanaWallet;

    return {
      walletType: wallet.walletType,
      walletData: {
        server_public_key: solanaWallet.server_public_key,
        nonce: solanaWallet.nonce,
        phantom_account_public_key: solanaWallet.phantom_account_public_key,
        session: solanaWallet.session,
      },
    };
  }
}
