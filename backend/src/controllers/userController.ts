// src/controllers/userController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { IWalletConnection } from '../types/interfaces';
import { ApiResponse } from '../types/api';
import redisService from '../config/redis';

export class UserController {
  /**
   * Connect or update wallet for a user
   * POST /api/v1/users/connect-wallet
   */
  static async connectWallet(
    req: Request<{}, {}, IWalletConnection>,
    res: Response<ApiResponse<any>>
  ): Promise<void> {
    try {
      const { public_key, wallet_type, telegram_id, data } = req.body;

      // Validate wallet type
      if (!['ton', 'solana'].includes(wallet_type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid wallet type. Must be either "ton" or "solana"'
        });
        return;
      }

      // Check if public key is already connected to another user
      const existingWalletUser = await User.findOne({
        [`walletAddresses.${wallet_type}`]: public_key
      });

      if (existingWalletUser && existingWalletUser.telegramId !== telegram_id) {
        res.status(400).json({
          success: false,
          error: 'This wallet is already connected to another user'
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
        let user = await User.findOne({ telegramId: telegram_id });

        if (!user) {
          // Create new user if doesn't exist
          user = new User({
            telegramId: telegram_id,
            walletAddresses: {},
            referralCode: await UserController.generateUniqueReferralCode(),
          });
        }

        // Update wallet address
        user.walletAddresses = {
          ...user.walletAddresses,
          [wallet_type]: public_key
        };

        // Store additional data if provided
        if (data) {
          // You might want to validate/process the data before storing
          user.set(`walletData.${wallet_type}`, data);
        }

        await user.save();

        // Store in Redis for quick access
        await redisService.set(
          `wallet:${telegram_id}:${wallet_type}`,
          public_key,
          86400 // 24 hours cache
        );

        res.status(200).json({
          success: true,
          data: {
            telegramId: user.telegramId,
            walletAddresses: user.walletAddresses,
            referralCode: user.referralCode
          },
          message: 'Wallet connected successfully'
        });
      } finally {
        // Release the lock in finally block to ensure it's always released
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
}