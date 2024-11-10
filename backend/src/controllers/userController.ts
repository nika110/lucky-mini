import { Request, Response } from "express";
import { User } from "../models/User";
import {
  IUserGet,
  IUserRegistration,
  IWalletConnection,
} from "../types/interfaces";
import { ApiResponse } from "../types/api";
import redisService from "../config/redis";

export class UserController {
  public static async deleteUser(
    req: Request<IUserGet>,
    res: Response<ApiResponse<any>>
  ): Promise<Response<ApiResponse<any>>> {
    const { telegramId } = req.params;

    if (!telegramId) {
      return res.status(400).json({
        success: false,
        message: "Telegram ID is required",
        data: null,
      });
    }

    try {
      const user = await User.findOne({ telegramId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      // Update referrer count if exists
      if (user.referredBy) {
        await User.findOneAndUpdate(
          { telegramId: user.referredBy },
          { $inc: { referralCount: -1 } }
        );
      }

      // Delete user
      await User.findOneAndDelete({ telegramId });

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: null,
      });
    } catch (error: any) {
      console.error("Error in deleteUser:", {
        telegramId,
        errorMessage: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error while deleting user",
        data: null,
      });
    }
  }

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
