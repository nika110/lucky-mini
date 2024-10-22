import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateReferralCode } from '../utils/helpers';
import { IUserRegistration, IWalletConnection, IUser } from '../types/interfaces';
import { ApiResponse } from '../types/api';

export class UserController {
  // Register new user
  static async register(
    req: Request<{}, {}, IUserRegistration>,
    res: Response<ApiResponse<IUser>>
  ) {
    try {
      const { telegramId, username, referralCode } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ telegramId });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        });
      }

      // Handle referral
      let referredBy: string | undefined;
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referredBy = referrer.telegramId;
          // Increment referrer's count
          await User.findOneAndUpdate(
            { telegramId: referrer.telegramId },
            { $inc: { referralCount: 1 } }
          );
        }
      }

      // Generate unique referral code
      let newReferralCode: string;
      let isUnique = false;
      do {
        newReferralCode = generateReferralCode();
        const existing = await User.findOne({ referralCode: newReferralCode });
        if (!existing) isUnique = true;
      } while (!isUnique);

      // Create new user
      const user = new User({
        telegramId,
        username,
        referralCode: newReferralCode,
        referredBy,
      });

      await user.save();

      res.status(201).json({
        success: true,
        data: user.toObject(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error creating user',
      });
    }
  }

  // Connect wallet
  static async connectWallet(
    req: Request<{}, {}, IWalletConnection>,
    res: Response<ApiResponse<IUser>>
  ) {
    try {
      const { telegramId, walletType, address } = req.body;

      const user = await User.findOne({ telegramId });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Update wallet address
      user.walletAddresses = {
        ...user.walletAddresses,
        [walletType]: address,
      };

      await user.save();

      res.json({
        success: true,
        data: user.toObject(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error connecting wallet',
      });
    }
  }

  // Get user profile
  static async getProfile(
    req: Request<{ telegramId: string }>,
    res: Response<ApiResponse<IUser>>
  ) {
    try {
      const { telegramId } = req.params;

      const user = await User.findOne({ telegramId });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user.toObject(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error fetching user profile',
      });
    }
  }

  // Get user's referrals
  static async getReferrals(
    req: Request<{ telegramId: string }>,
    res: Response<ApiResponse<IUser[]>>
  ) {
    try {
      const { telegramId } = req.params;

      const referrals = await User.find({ referredBy: telegramId });

      res.json({
        success: true,
        data: referrals.map(ref => ref.toObject()),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error fetching referrals',
      });
    }
  }

  // Update user balance
  static async updateBalance(
    telegramId: string,
    amount: number
  ): Promise<boolean> {
    try {
      const result = await User.updateOne(
        { telegramId },
        { $inc: { balance: amount } }
      );
      return result.modifiedCount > 0;
    } catch {
      return false;
    }
  }
}
