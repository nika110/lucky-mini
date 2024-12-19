import { Request, Response } from "express";
// import { User } from "../models/User";
import { User as UserSchema } from "../models/shemas";
import {
  IUserGet,
  IUserRegistration,
  IWalletConnection,
} from "../types/interfaces";
import { ApiResponse } from "../types/api";
import redisService from "../config/redis";
import { GrpcManager } from "../grpc/grpc-manager";
import {
  UpdateTonWalletRequest,
  UpdateTonWalletResponse,
} from "../generated/service";
import { CustomError } from "../utils/customError";
import { logger } from "../utils/logger";

const USER_INIT_DATA = "user";
const AUTH_DATE_INIT_DATA = "auth_date";
const HASH_DATE_INIT_DATA = "hash";

interface UpdateTonWalletReqApi {
  tonPublicKey: string;
}

export class UserController {
  private static instance: UserController | null = null;
  private grpcManager: GrpcManager;

  private constructor(grpcManager: GrpcManager) {
    this.grpcManager = grpcManager;
  }

  public static async getInstance(): Promise<UserController> {
    if (!UserController.instance) {
      const grpcManager = await GrpcManager.getInstance();
      UserController.instance = new UserController(grpcManager);
    }
    return UserController.instance;
  }

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
      const user = await UserSchema.findOne({ telegram_id: telegramId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      // Delete user
      await UserSchema.findOneAndDelete({ telegram_id: telegramId });

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

  public async getConfig(
    req: Request<IUserGet>,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { telegramId } = req.params;

      const user = await UserSchema.findOne({ telegram_id: telegramId })
        .select("-__v") // stuff users
        .lean(); // return object instead of Mongoose doc

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      try {
        const authClient = this.grpcManager.getAuthClient();
        if (!authClient.isReady()) {
          return res.status(503).json({
            success: false,
            message: "Auth service temporarily unavailable",
            data: null,
          });
        }

        const configResponse = await authClient.getConfig();

        return res.status(200).json({
          success: true,
          data: configResponse,
          message: "Config retrieved successfully",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Internal server error while fetching gRPC data",
          data: null,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching config data",
        data: null,
      });
    }
  }

  public async initUser(
    req: Request<{}, {}, IUserRegistration>,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { telegramId, initData, referralCode }: IUserRegistration =
        req.body;

      try {
        // Get gRPC client and check if it's ready
        const authClient = this.grpcManager.getAuthClient();
        if (!authClient.isReady()) {
          return res.status(503).json({
            success: false,
            message: "Auth service temporarily unavailable",
            data: null,
          });
        }

        // Call gRPC authenticate method
        const authResponse = await authClient.authenticateTelegram(
          telegramId.toString(),
          initData,
          referralCode ? referralCode : ""
        );

        return res.status(201).json({
          success: true,
          data: authResponse,
          message: "User created successfully",
        });
      } catch (error: any) {
        console.error("Error in initData:", {
          errorMessage: error.message,
          stack: error.stack,
          code: error.code,
        });

        if (error.message === "gRPC client not ready") {
          return res.status(503).json({
            success: false,
            message: "Service temporarily unavailable",
            data: null,
          });
        }

        return res.status(500).json({
          success: false,
          message: "Internal server error while fetching current raffle",
          data: null,
        });
      }
    } catch (error) {}
  }

  public async getReferralList(
    req: Request<IUserGet>,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { telegramId } = req.params;

      const user = await UserSchema.findOne({ telegram_id: telegramId })
        .select("-__v") // stuff users
        .lean(); // return object instead of Mongoose doc

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      try {
        const authClient = this.grpcManager.getAuthClient();
        if (!authClient.isReady()) {
          return res.status(503).json({
            success: false,
            message: "Auth service temporarily unavailable",
            data: null,
          });
        }

        const authResponse = await authClient.listUserReferrals(user.id);

        return res.status(200).json({
          success: true,
          data: authResponse,
          message: "Referral list retrieved successfully",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Internal server error while fetching gRPC data",
          data: null,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching user data",
        data: null,
      });
    }
  }

  public static async getUser(
    req: Request<IUserGet>,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { telegramId } = req.params;

      const user = await UserSchema.findOne({ telegram_id: telegramId })
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

  public async updateTonWallet(
    req: Request<IUserGet, {}, UpdateTonWalletReqApi>,
    res: Response<ApiResponse<UpdateTonWalletResponse>>
  ): Promise<Response<ApiResponse<UpdateTonWalletResponse>>> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    try {
      console.log(`[${requestId}] Processing wallet deletion request`);
      const { tonPublicKey } = req.body;
      const { telegramId } = req.params;

      // Get authorization token from headers
      const authHeader =
        req.headers.authorization || req.header("Authorization");
      if (!authHeader) {
        throw new CustomError(
          "UNAUTHORIZED",
          "Authorization header is missing"
        );
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7) // Remove "Bearer " prefix
        : authHeader;
      const user = await UserSchema.findOne({ telegram_id: telegramId });

      logger.info(`TelegramId ${token}`);

      if (!user) {
        throw new CustomError("USER_NOT_FOUND", "User does not exist");
      }

      try {
        // Get gRPC client and check if it's ready
        const authClient = this.grpcManager.getAuthClient();
        if (!authClient.isReady()) {
          throw new CustomError(
            "USER_NOT_FOUND",
            "Auth service temporarily unavailable"
          );
        }

        // Call gRPC authenticate method
        const updateTonWalletResponse: UpdateTonWalletResponse =
          await authClient.updateTonWallet(token, tonPublicKey);

        return res.status(201).json({
          success: true,
          data: updateTonWalletResponse,
          message: "Wallet updated successfully",
        });
      } catch (error) {
        console.error("Error in updateTonWallet:", {
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          code:
            error instanceof Error && "code" in error
              ? (error as any).code
              : undefined,
        });

        if (
          error instanceof Error &&
          error.message === "gRPC client not ready"
        ) {
          return res.status(503).json({
            success: false,
            message: "Service temporarily unavailable",
            error: "INTERNAL_SERVER_ERROR",
          });
        }

        if (error instanceof CustomError) {
          return res.status(error.getStatusCode()).json({
            success: false,
            message: error.message,
            error: error.getCode(),
          });
        }

        return res.status(500).json({
          success: false,
          message: "Internal server error while updating TON wallet",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    } catch (error) {
      console.error("Unexpected error in updateTonWallet:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  // Helper function to generate unique referral code
  // static async generateUniqueReferralCode(): Promise<string> {
  //   const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  //   let code: string;
  //   let isUnique = false;

  //   while (!isUnique) {
  //     code = Array.from(
  //       { length: 8 },
  //       () => characters[Math.floor(Math.random() * characters.length)]
  //     ).join("");

  //     // Check Redis first for performance
  //     const existsInCache = await redisService.exists(`referral:${code}`);
  //     if (!existsInCache) {
  //       // Double-check in MongoDB
  //       const existingUser = await User.findOne({ referralCode: code });
  //       if (!existingUser) {
  //         isUnique = true;
  //         // Cache the new code
  //         await redisService.set(`referral:${code}`, "1", 86400);
  //         return code;
  //       }
  //     }
  //   }

  //   throw new Error("Could not generate unique referral code");
  // }
}
