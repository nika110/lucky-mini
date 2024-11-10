import { Request, Response } from "express";
import { ApiResponse } from "../types/api";
import { GrpcManager } from "../grpc/grpc-manager";

interface PurchaseTicketsBody {
  userId: string;
  ticketCount: number;
}

interface GetRaffleResultsParams {
  raffleId: string;
}

export class RaffleController {
  private static grpcClient = GrpcManager.getInstance().getRaffleClient();

  public static async purchaseTickets(
    req: Request<{}, {}, PurchaseTicketsBody>,
    res: Response<ApiResponse<any>>
  ): Promise<Response<ApiResponse<any>>> {
    try {
      const { userId, ticketCount } = req.body;

      if (!userId || !ticketCount) {
        return res.status(400).json({
          success: false,
          message: "User ID and ticket count are required",
          data: null,
        });
      }

      if (ticketCount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Ticket count must be greater than 0",
          data: null,
        });
      }

      const result = await this.grpcClient.purchaseTickets(userId, ticketCount);

      console.log(
        `Tickets purchased for user ${userId}:`,
        result.ticketNumbers
      );

      return res.status(200).json({
        success: true,
        message: "Tickets purchased successfully",
        data: {
          ticketNumbers: result.ticketNumbers,
          raffleId: result.raffleId,
        },
      });
    } catch (error: any) {
      console.error("Error in purchaseTickets:", {
        userId: req.body.userId,
        ticketCount: req.body.ticketCount,
        errorMessage: error.message,
        stack: error.stack,
      });

      if (error.code) {
        switch (error.code) {
          case 3: // INVALID_ARGUMENT
            return res.status(400).json({
              success: false,
              message: "Invalid request parameters",
              data: null,
            });
          case 5: // NOT_FOUND
            return res.status(404).json({
              success: false,
              message: "Raffle not found",
              data: null,
            });
          case 7: // PERMISSION_DENIED
            return res.status(403).json({
              success: false,
              message: "Permission denied",
              data: null,
            });
          default:
            return res.status(500).json({
              success: false,
              message: "Error while purchasing tickets",
              data: null,
            });
        }
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error while purchasing tickets",
        data: null,
      });
    }
  }

  public static async getCurrentRaffle(
    req: Request,
    res: Response<ApiResponse<any>>
  ): Promise<Response<ApiResponse<any>>> {
    try {
      const currentRaffle = await this.grpcClient.getCurrentRaffle();

      return res.status(200).json({
        success: true,
        message: "Current raffle retrieved successfully",
        data: {
          raffleId: currentRaffle.raffleId,
          endTime: currentRaffle.endTime,
          currentPool: currentRaffle.currentPool,
        },
      });
    } catch (error: any) {
      console.error("Error in getCurrentRaffle:", {
        errorMessage: error.message,
        stack: error.stack,
      });

      if (error.code === 5) {
        // NOT_FOUND
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

  public static async getRaffleResults(
    req: Request<GetRaffleResultsParams>,
    res: Response<ApiResponse<any>>
  ): Promise<Response<ApiResponse<any>>> {
    try {
      const { raffleId } = req.params;

      if (!raffleId) {
        return res.status(400).json({
          success: false,
          message: "Raffle ID is required",
          data: null,
        });
      }

      const results = await this.grpcClient.getRaffleResults(raffleId);

      const formattedWinners = results.winners.map((winner) => ({
        userId: winner.userId,
        amount: winner.amount,
        position: winner.position,
      }));

      return res.status(200).json({
        success: true,
        message: "Raffle results retrieved successfully",
        data: {
          winners: formattedWinners,
          totalPool: results.totalPool,
        },
      });
    } catch (error: any) {
      console.error("Error in getRaffleResults:", {
        raffleId: req.params.raffleId,
        errorMessage: error.message,
        stack: error.stack,
      });

      if (error.code) {
        switch (error.code) {
          case 5: // NOT_FOUND
            return res.status(404).json({
              success: false,
              message: "Raffle not found",
              data: null,
            });
          case 9: // FAILED_PRECONDITION
            return res.status(400).json({
              success: false,
              message: "Raffle has not ended yet",
              data: null,
            });
          default:
            return res.status(500).json({
              success: false,
              message: "Error while fetching raffle results",
              data: null,
            });
        }
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching raffle results",
        data: null,
      });
    }
  }
}
