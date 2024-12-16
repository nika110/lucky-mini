import express from "express";
import { RaffleController } from "../controllers/raffleController";

const router = express.Router();

enum ROUTES {
  PAYOUT = "/payout",
}

let raffleController: RaffleController;

(async () => {
  try {
    raffleController = await RaffleController.getInstance();
    console.log("✅ RaffleController initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize RaffleController:", error);
    process.exit(1);
  }
})();

router.post(ROUTES.PAYOUT, (req, res) => {
  if (!raffleController) {
    return res.status(503).json({
      success: false,
      message: "Service is initializing",
      data: null,
    });
  }
  return raffleController.processPayout(req, res);
});

export default router;
