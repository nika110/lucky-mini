import bs58 from "bs58";
// src/controllers/userController.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import {
  ISolanaWallet,
  IUserGet,
  IUserRegistration,
  IWallet,
  IWalletConnection,
} from "../types/interfaces";
import { ApiResponse } from "../types/api";
import redisService from "../config/redis";
import { SolanaVerification } from "../utils/solanaVerification";
import { JwtService } from "../utils/jwt";
import nacl from "tweetnacl";

export class UserController {
  /**
   * Connect wallet, verify signature and authenticate user
   * POST /api/v1/users/connect-wallet
   */
  // static async connectWallet(
  //   req: Request<{}, {}, IWalletConnection>,
  //   res: Response<ApiResponse<any>>
  // ): Promise<void> {
  //   try {
  //     const { public_key, wallet_type, telegram_id, signature } = req.body;

  //     // Validate wallet type
  //     if (wallet_type !== 'solana') {
  //       res.status(400).json({
  //         success: false,
  //         error: 'Invalid wallet type. Must be "solana"'
  //       });
  //       return;
  //     }

  //     // Generate message for verification
  //     const message = `Connect wallet ${public_key} to Telegram ID ${telegram_id}`;

  //     // Verify signature
  //     const isValid = await SolanaVerification.verifySignature(
  //       message,
  //       signature,
  //       public_key
  //     );

  //     if (!isValid) {
  //       res.status(401).json({
  //         success: false,
  //         error: 'Invalid signature'
  //       });
  //       return;
  //     }

  //     // Try to get lock for the operation
  //     const lockAcquired = await redisService.acquireLock(
  //       `wallet:${telegram_id}:${wallet_type}`,
  //       30
  //     );

  //     if (!lockAcquired) {
  //       res.status(429).json({
  //         success: false,
  //         error: 'Operation in progress. Please try again later'
  //       });
  //       return;
  //     }

  //     try {
  //       // Find or create user
  //       let user = await User.findOne({
  //         $or: [
  //           { telegramId: telegram_id },
  //           { [`walletAddresses.${wallet_type}`]: public_key }
  //         ]
  //       });

  //       if (!user) {
  //         // Create new user
  //         user = new User({
  //           telegramId: telegram_id,
  //           walletAddresses: {
  //             [wallet_type]: public_key
  //           },
  //           referralCode: await UserController.generateUniqueReferralCode(),
  //         });
  //       } else {
  //         // Update existing user's wallet if needed
  //         user.walletAddresses = {
  //           ...user.walletAddresses,
  //           [wallet_type]: public_key
  //         };
  //       }

  //       await user.save();

  //       // Generate JWT
  //       const token = JwtService.generateToken({
  //         userId: user.id.toString(),
  //         telegramId: user.telegramId,
  //         walletAddress: public_key
  //       });

  //       // Store in Redis for quick access
  //       await redisService.set(
  //         `wallet:${telegram_id}:${wallet_type}`,
  //         public_key,
  //         86400 // 24 hours cache
  //       );

  //       // Store JWT in Redis for blacklisting capability
  //       await redisService.set(
  //         `jwt:${user._id}:${token.slice(-10)}`,
  //         'valid',
  //         604800 // 7 days (matching JWT expiry)
  //       );

  //       res.status(200).json({
  //         success: true,
  //         data: {
  //           user: {
  //             telegramId: user.telegramId,
  //             walletAddresses: user.walletAddresses,
  //             referralCode: user.referralCode
  //           },
  //           token
  //         },
  //         message: 'Wallet connected successfully'
  //       });
  //     } finally {
  //       await redisService.releaseLock(`wallet:${telegram_id}:${wallet_type}`);
  //     }
  //   } catch (error) {
  //     console.error('Error connecting wallet:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'Error connecting wallet'
  //     });
  //   }
  // }

  public static async initUser(
    req: Request<{}, {}, IUserRegistration>,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { telegramId, username, referralCode }: IUserRegistration =
        req.body;

      let user = await User.findOne({ telegramId });

      if (user) {
        return res.status(200).json({
          success: true,
          data: user.toObject(),
          message: "User retrieved successfully",
        });
      }

      let referredBy: string | undefined;

      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referredBy = referrer.telegramId;
          await User.findByIdAndUpdate(
            referrer._id,
            { $inc: { referralCount: 1 } },
            { new: true }
          );
          console.log(
            `New referral registered for user ${referrer.telegramId}`
          );
        } else {
          console.log(`Invalid referral code used: ${referralCode}`);
        }
      }

      // Generate unique referral code
      const newReferralCode = await UserController.generateUniqueReferralCode();

      const newUser = await User.create({
        telegramId,
        username,
        referralCode: newReferralCode,
        referredBy,
        referralCount: 0,
        totalTickets: 0,
        balance: 0,
      });

      console.log(`New user created with telegramId: ${telegramId}`);

      return res.status(201).json({
        success: true,
        data: newUser.toObject(),
        message: "User created successfully",
      });
    } catch (error) {}
  }
  public static async getUser(
    req: Request<IUserGet>,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { telegramId } = req.params;

      const user = await User.findOne({ telegramId })
        .select("-__v") // stuff users
        .lean(); // return object instead of Mongoose doc

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUser:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching user data",
        data: null,
      });
    }
  }

  public static async initSolanaWallet(
    req: Request<IUserGet>,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { telegramId } = req.params;

      const user = await User.findOne({ telegramId })
        .select("-__v") // stuff users
        .lean(); // return object instead of Mongoose doc

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      const wallet = user.wallet;

      if (!wallet) {
        try {
          const pairOfKeys = nacl.box.keyPair();
          const publicKey58 = bs58.encode(pairOfKeys.publicKey);
          const secretKey58 = bs58.encode(pairOfKeys.secretKey);

          const nonce = nacl.randomBytes(24);

          const walletData = {
            server_public_key: publicKey58,
            server_secret_key: secretKey58,
            nonce: bs58.encode(nonce),
          } as ISolanaWallet;

          const wallet = {
            walletType: "solana",
            walletData,
          } as IWallet;

          await User.findOneAndUpdate({ telegramId }, { $set: { wallet } });
        } catch (error) {}
      }

      return res.status(200).json({
        success: true,
        data: {},
        message: "User retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUser:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching user data",
        data: null,
      });
    }
  }

  // Helper function to generate unique referral code
  static async generateUniqueReferralCode(): Promise<string> {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = Array.from(
        { length: 8 },
        () => characters[Math.floor(Math.random() * characters.length)]
      ).join("");

      // Check Redis first for performance
      const existsInCache = await redisService.exists(`referral:${code}`);
      if (!existsInCache) {
        // Double-check in MongoDB
        const existingUser = await User.findOne({ referralCode: code });
        if (!existingUser) {
          isUnique = true;
          // Cache the new code
          await redisService.set(`referral:${code}`, "1", 86400);
          return code;
        }
      }
    }

    throw new Error("Could not generate unique referral code");
  }

  static async GetUsers(
    req: Request<{}, {}, IWalletConnection>,
    res: Response<ApiResponse<any>>
  ): Promise<void> {}
}
