import { Request, Response } from "express";
import { ApiResponse } from "../types/api";
import {
  BLOCKCHAINS,
  ISolanaWallet,
  ITonWallet,
  IWallet,
} from "../types/interfaces";
import { User } from "../models/User";
import { CustomError } from "../utils/customError";
import { WalletService } from "../services/walletService";
import nacl from "tweetnacl";
import bs58 from "bs58";

export interface InitWalletParams {
  telegramId: string;
}

interface PublicSolanaWalletData {
  signature: string | null;
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

interface SignedMessagePayload {
  signature: string;
  session: string;
}

interface InitWalletBody {
  walletType: BLOCKCHAINS;
}

export class WalletController {
  public static async deleteWallet(
    req: Request<SignatureInitParams>,
    res: Response<ApiResponse<null>>
  ): Promise<Response<ApiResponse<null>>> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`[${requestId}] Processing wallet deletion request`);
      const { telegramId } = req.params;

      // Get user with wallet info
      const user = await User.findOne({ telegramId }).select("wallet").lean();

      if (!user) {
        throw new CustomError("USER_NOT_FOUND", "User not found");
      }

      if (!user.wallet) {
        throw new CustomError(
          "WALLET_NOT_INITIALIZED",
          "No wallet exists for this user"
        );
      }

      // Perform atomic update to remove wallet
      const updatedUser = await User.findOneAndUpdate(
        { telegramId },
        {
          $unset: { wallet: "" },
          $set: { lastWalletDeletionAt: new Date() },
        },
        {
          new: true,
          runValidators: true,
          select: "wallet",
        }
      );

      if (!updatedUser) {
        throw new CustomError(
          "UPDATE_FAILED",
          "Failed to delete wallet information"
        );
      }

      // Log performance metrics
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Wallet deletion completed in ${duration}ms`);

      return res.status(200).json({
        success: true,
        data: null,
        message: "Wallet deleted successfully",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] Wallet deletion failed after ${duration}ms:`,
        error
      );

      if (error instanceof CustomError) {
        return res.status(error.getStatusCode()).json({
          success: false,
          message: error.message,
          error: error.getCode(),
          data: null,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during wallet deletion",
        error: "INTERNAL_SERVER_ERROR",
        data: null,
      });
    }
  }

  public static async initWallet(
    req: Request<InitWalletParams, {}, InitWalletBody>,
    res: Response<ApiResponse<PublicWallet | ITonWallet>>
  ): Promise<Response<ApiResponse<PublicWallet | ITonWallet>>> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`[${requestId}] Processing wallet initialization request`);
      const { telegramId } = req.params;
      const { walletType } = req.body;

      // Validate wallet type
      if (!Object.values(BLOCKCHAINS).includes(walletType)) {
        throw new CustomError(
          "INVALID_WALLET_TYPE",
          "Provided wallet type is not supported"
        );
      }

      // Check if user exists
      const user = await User.findOne({ telegramId }).select("wallet").lean();

      if (!user) {
        throw new CustomError("USER_NOT_FOUND", "User not found");
      }

      // Check if user already has a wallet
      if (user.wallet) {
        throw new CustomError(
          "WALLET_EXISTS",
          `User already has a ${user.wallet.walletType} wallet`
        );
      }

      let wallet: IWallet;

      // Initialize wallet based on type
      switch (walletType) {
        case BLOCKCHAINS.SOL: {
          wallet = await WalletService.initializeSolanaWallet(telegramId);
          break;
        }
        case BLOCKCHAINS.TON: {
          wallet = await WalletService.initializeTonWallet(telegramId);
          break;
        }
        default: {
          throw new CustomError(
            "UNSUPPORTED_WALLET_TYPE",
            "This wallet type is not supported"
          );
        }
      }

      // Log performance metrics
      const duration = Date.now() - startTime;
      console.log(
        `[${requestId}] Wallet initialization completed in ${duration}ms`
      );

      // Return appropriate response based on wallet type
      return res.status(200).json({
        success: true,
        data: wallet,
        message: `${walletType} wallet initialized successfully`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] Wallet initialization failed after ${duration}ms:`,
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
        message: "Internal server error during wallet initialization",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  public static async getWallet(
    req: Request<InitWalletParams>,
    res: Response<ApiResponse<PublicWallet | ITonWallet | null>>
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
        return res.status(200).json({
          success: true,
          data: null,
          message: "User has no wallet",
        });
      }

      if (user.wallet.walletType === BLOCKCHAINS.SOL) {
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
      } else {
        return res.status(200).json({
          success: true,
          data: user.wallet.walletData,
          message: "Solana wallet information retrieved successfully",
        });
      }
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
    res: Response<ApiResponse<null>>
  ): Promise<Response<ApiResponse<null>>> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`[${requestId}] Processing signed message request`);

      const { telegramId } = req.params;
      const { data: signedData, nonce } = req.body;

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

      if (user.wallet.walletType !== BLOCKCHAINS.SOL) {
        throw new CustomError(
          "INVALID_WALLET_TYPE",
          `Expected Solana wallet, but found ${user.wallet.walletType} wallet`
        );
      }

      const wallet = user.wallet.walletData as ISolanaWallet;

      // Verify wallet state
      if (!wallet.shared_key || !wallet.session) {
        throw new CustomError(
          "INVALID_WALLET_STATE",
          "Wallet connection not established"
        );
      }

      // Decrypt signed message data
      let signedMessageData: SignedMessagePayload;
      try {
        signedMessageData = WalletController.decryptPayloadData(
          signedData,
          nonce,
          wallet.shared_key
        ) as SignedMessagePayload;
      } catch (error) {
        throw new CustomError(
          "DECRYPTION_ERROR",
          "Failed to decrypt signed message data"
        );
      }

      if (!signedMessageData.signature) {
        throw new CustomError(
          "INVALID_SIGNATURE_DATA",
          "Missing required signature data"
        );
      }

      // Update wallet with signature
      const updatedWallet: IWallet = {
        walletType: BLOCKCHAINS.SOL,
        walletData: {
          ...wallet,
          signature: signedMessageData.signature,
        },
      };

      const updatedUser = await User.findOneAndUpdate(
        {
          telegramId,
          "wallet.walletType": BLOCKCHAINS.SOL,
          "wallet.walletData.session": wallet.session, // Additional validation
        },
        {
          $set: {
            wallet: updatedWallet,
            lastSignatureAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
          select: "wallet",
        }
      );

      if (!updatedUser) {
        throw new CustomError(
          "UPDATE_FAILED",
          "Failed to update wallet with signature"
        );
      }

      // Log performance metrics
      const duration = Date.now() - startTime;
      console.log(
        `[${requestId}] Message signature processed in ${duration}ms`
      );

      return res.status(200).json({
        success: true,
        data: null,
        message: "Message signed successfully",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] Message signature failed after ${duration}ms:`,
        error
      );

      if (error instanceof CustomError) {
        return res.status(error.getStatusCode()).json({
          success: false,
          message: error.message,
          error: error.getCode(),
          data: null,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during message signing",
        error: "INTERNAL_SERVER_ERROR",
        data: null,
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
        signature: solanaWallet.signature,
        server_public_key: solanaWallet.server_public_key,
        nonce: solanaWallet.nonce,
        phantom_account_public_key: solanaWallet.phantom_account_public_key,
        session: solanaWallet.session,
      },
    };
  }
}
