import { Request, Response } from "express";
import { ApiResponse } from "../types/api";
import { GrpcManager } from "../grpc/grpc-manager";
import { IUserGet } from "../types/interfaces";
import { User as UserSchema } from "../models/shemas";
import { TonTransactionService } from "../services/tonTransactions";
import { TonTransactionWalletService } from "../services/tonWallet";

interface PayoutRequest {
  password: string;
  winners: Array<{
    user_id: string;
    amount: string;
  }>;
}

export class RaffleController {
  private static instance: RaffleController | null = null;
  private grpcManager: GrpcManager;

  private constructor(grpcManager: GrpcManager) {
    this.grpcManager = grpcManager;
  }

  public static async getInstance(): Promise<RaffleController> {
    if (!RaffleController.instance) {
      const grpcManager = await GrpcManager.getInstance();
      RaffleController.instance = new RaffleController(grpcManager);
    }
    return RaffleController.instance;
  }

  public async processPayout(
    req: Request<{}, {}, PayoutRequest>,
    res: Response<ApiResponse<any>>
  ): Promise<Response<ApiResponse<any>>> {
    try {
      const { password, winners } = req.body;
      console.log("payouts STARTED", req.body);

      // Validate password
      if (password !== process.env.PAYOUT_PASSWORD) {
        return res.status(403).json({
          success: false,
          message: "Invalid password",
          data: null,
        });
      }

      // Validate payouts array
      if (!Array.isArray(winners) || winners.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid payouts data",
          data: null,
        });
      }

      // Process each payout
      const tonWalletService = TonTransactionWalletService.getInstance();
      console.log("payouts", "SERVICE");
      const results = [] as {
        user_id: string;
        amount: string;
        tx_hash: string | undefined;
      }[];
      const errors = [];

      for (const payout of winners) {
        try {
          // Find user's wallet address
          const user = await UserSchema.findOne({ id: payout.user_id })
            .select("-__v") // stuff users
            .lean(); // return object instead of Mongoose doc
          console.log("PAYOUT FOR USER", user, payout.user_id);

          if (!user || !user.ton_public_key) {
            errors.push({
              user_id: payout.user_id,
              error: "User not found or no wallet address",
            });
            continue;
          }

          // Process TON transaction
          const txResult = await tonWalletService.payoutTon(
            user.ton_public_key,
            payout.amount
          );

          console.log("txResult", txResult);

          if (txResult.success) {
            results.push({
              user_id: payout.user_id,
              amount: payout.amount,
              tx_hash: txResult.txHash,
            });
          } else {
            errors.push({
              user_id: payout.user_id,
              error: txResult.error,
            });
          }
        } catch (error: any) {
          errors.push({
            user_id: payout.user_id,
            error: error.message,
          });
        }
      }

      // Return response with results and errors
      return res.status(200).json({
        success: true,
        message: "Payout process completed",
        data: {
          errors: errors,
          results: results,
        },
      });
    } catch (error: any) {
      console.error("Error in processPayout:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error while processing payouts",
        data: null,
      });
    }
  }

  public async getCurrentRaffle(
    req: Request<IUserGet, {}, { userId: string }>,
    res: Response<ApiResponse<any>>
  ): Promise<Response<ApiResponse<any>>> {
    try {
      const { telegramId } = req.params;
      const token = req.headers.authorization?.split(" ")[1];

      if (!telegramId || !token) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
          data: null,
        });
      }

      const grpcClient = this.grpcManager.getRaffleClient();

      if (!grpcClient.isReady()) {
        return res.status(503).json({
          success: false,
          message: "Service temporarily unavailable",
          data: null,
        });
      }
      console.log("token", token);

      const currentRaffle = await grpcClient.getCurrentRaffle(token);

      return res.status(200).json({
        success: true,
        message: "Current raffle retrieved successfully",
        data: currentRaffle,
      });
    } catch (error: any) {
      console.error("Error in getCurrentRaffle:", {
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

      if (error.code === 5) {
        return res.status(404).json({
          success: false,
          message: "No active raffle found",
          data: null,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching current raffle",
        data: null,
      });
    }
  }

  public async purchaseTicket(
    req: Request<IUserGet>,
    res: Response<ApiResponse<any>>
  ): Promise<Response<ApiResponse<any>>> {
    try {
      const { telegramId } = req.params;
      const { boc, game_type, userAddress, toNumber } = req.body;

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

      if (!userAddress) {
        return res.status(404).json({
          success: false,
          message: "User does not have a public key",
          data: null,
        });
      }

      // Validate request body
      if (!boc || typeof boc !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid BOC format",
          data: null,
        });
      }

      // Get gRPC client
      const grpcClient = this.grpcManager.getRaffleClient();

      if (!grpcClient.isReady()) {
        return res.status(503).json({
          success: false,
          message: "Service temporarily unavailable",
          data: null,
        });
      }

      const tonService = TonTransactionService.getInstance();

      // TON Transaction validation
      try {
        const validatedTransaction = await tonService.validateBoc(
          boc,
          userAddress
        );

        if (!validatedTransaction.isValid) {
          return res.status(400).json({
            success: false,
            message: "Invalid transaction",
            data: null,
          });
        }

        const authClient = this.grpcManager.getAuthClient();
        if (!authClient.isReady()) {
          return res.status(503).json({
            success: false,
            message: "Auth service temporarily unavailable",
            data: null,
          });
        }
        const configResponse = await authClient.getConfig();

        const calculatedAmount = Math.floor(
          (+validatedTransaction.amount / configResponse.ticket_price) as number
        );

        // Call gRPC purchaseTicket method
        const responseTickets = await grpcClient.purchaseTickets(
          user.id,
          calculatedAmount,
          game_type,
          toNumber ? toNumber : undefined
        );

        console.log(responseTickets);

        if (!responseTickets) {
          return res.status(400).json({
            success: false,
            message: "Failed to purchase tickets",
            data: null,
          });
        }

        // response 200
        return res.status(200).json({
          success: true,
          message: "Tickets purchased successfully",
          data: {
            amount: calculatedAmount,
            raffleId: responseTickets.raffle_id,
          },
        });
      } catch (tonError: any) {
        // if (tonError instanceof TonTransactionError) {
        //   return res.status(400).json({
        //     success: false,
        //     message: tonError.message,
        //     data: {
        //       code: tonError.code,
        //       details: tonError.details,
        //     },
        //   });
        // }
        throw tonError;
      }
    } catch (error: any) {
      console.error("Error in purchaseTicket:", {
        errorMessage: error.message,
        stack: error.stack,
        code: error.code,
      });

      // Handle specific error cases
      switch (error.code) {
        case 3: // INVALID_ARGUMENT
          return res.status(400).json({
            success: false,
            message: "Invalid transaction data",
            data: null,
          });

        case 7: // PERMISSION_DENIED
          return res.status(403).json({
            success: false,
            message: "Insufficient funds or unauthorized",
            data: null,
          });

        case 5: // NOT_FOUND
          return res.status(404).json({
            success: false,
            message: "Active raffle not found",
            data: null,
          });

        case 14: // UNAVAILABLE
          return res.status(503).json({
            success: false,
            message: "Service temporarily unavailable",
            data: null,
          });

        default:
          return res.status(500).json({
            success: false,
            message: "Failed to process ticket purchase",
            data: null,
          });
      }
    }
  }
}
