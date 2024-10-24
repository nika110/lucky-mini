// src/controllers/userController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { IWalletConnection } from '../types/interfaces';
import { ApiResponse } from '../types/api';
import redisService from '../config/redis';
import { SolanaVerification } from '../utils/solanaVerification';
import { JwtService } from '../utils/jwt';

export class UserController {
  /**
   * Connect wallet, verify signature and authenticate user
   * POST /api/v1/users/connect-wallet
   */
  static async connectWallet(
    req: Request<{}, {}, IWalletConnection>,
    res: Response<ApiResponse<any>>
  ): Promise<void> {
    try {
      const { public_key, wallet_type, telegram_id, signature } = req.body;

      // Validate wallet type
      if (wallet_type !== 'solana') {
        res.status(400).json({
          success: false,
          error: 'Invalid wallet type. Must be "solana"'
        });
        return;
      }

      // Generate message for verification
      const message = `Connect wallet ${public_key} to Telegram ID ${telegram_id}`;

      // Verify signature
      const isValid = await SolanaVerification.verifySignature(
        message,
        signature,
        public_key
      );

      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
        return;
      }

      // Try to get lock for the operation
      const lockAcquired = await redisService.acquireLock(
        `wallet:${telegram_id}:${wallet_type}`,
        30
      );

      if (!lockAcquired) {
        res.status(429).json({
          success: false,
          error: 'Operation in progress. Please try again later'
        });
        return;
      }

      try {
        // Find or create user
        let user = await User.findOne({
          $or: [
            { telegramId: telegram_id },
            { [`walletAddresses.${wallet_type}`]: public_key }
          ]
        });

        if (!user) {
          // Create new user
          user = new User({
            telegramId: telegram_id,
            walletAddresses: {
              [wallet_type]: public_key
            },
            referralCode: await UserController.generateUniqueReferralCode(),
          });
        } else {
          // Update existing user's wallet if needed
          user.walletAddresses = {
            ...user.walletAddresses,
            [wallet_type]: public_key
          };
        }

        await user.save();

        // Generate JWT
        const token = JwtService.generateToken({
          userId: user.id.toString(),
          telegramId: user.telegramId,
          walletAddress: public_key
        });

        // Store in Redis for quick access
        await redisService.set(
          `wallet:${telegram_id}:${wallet_type}`,
          public_key,
          86400 // 24 hours cache
        );

        // Store JWT in Redis for blacklisting capability
        await redisService.set(
          `jwt:${user._id}:${token.slice(-10)}`,
          'valid',
          604800 // 7 days (matching JWT expiry)
        );

        res.status(200).json({
          success: true,
          data: {
            user: {
              telegramId: user.telegramId,
              walletAddresses: user.walletAddresses,
              referralCode: user.referralCode
            },
            token
          },
          message: 'Wallet connected successfully'
        });
      } finally {
        await redisService.releaseLock(`wallet:${telegram_id}:${wallet_type}`);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      res.status(500).json({
        success: false,
        error: 'Error connecting wallet'
      });
    }
  }

  // Helper function to generate unique referral code
  static async generateUniqueReferralCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = Array.from(
        { length: 8 },
        () => characters[Math.floor(Math.random() * characters.length)]
      ).join('');

      // Check Redis first for performance
      const existsInCache = await redisService.exists(`referral:${code}`);
      if (!existsInCache) {
        // Double-check in MongoDB
        const existingUser = await User.findOne({ referralCode: code });
        if (!existingUser) {
          isUnique = true;
          // Cache the new code
          await redisService.set(`referral:${code}`, '1', 86400);
          return code;
        }
      }
    }

    throw new Error('Could not generate unique referral code');
  }

  static async GetUsers(
    req: Request<{}, {}, IWalletConnection>,
    res: Response<ApiResponse<any>>
  ): Promise<void> {
  }

}
