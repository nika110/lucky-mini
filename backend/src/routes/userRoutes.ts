import express, { Response } from "express";
import { UserController } from "../controllers/userController";
import {
  validateGetUser,
  validateInitUser,
  validateWalletConnection,
} from "../middleware/validation";
import { WalletController } from "../controllers/walletController";
import { RaffleController } from "../controllers/raffleController";

const router = express.Router();

enum ROUTES {
  INIT = "/initialize",
  GET_USER = "/:telegramId",
  // WALLET
  UPDATE_TON_WALLET = "/:telegramId/update-ton-wallet",
  // RAFFLES
  GET_CURRENT_RAFFLE = "/:telegramId/current-raffle",
  PURCHASE_TICKETS = "/:telegramId/purchase-tickets",
  // OTHERS
  // GET_REFERRALS = "/:telegramId/referrals",
  // DELETE_WALLET = "/:telegramId/delete-wallet",
  // INIT_WALLET = "/:telegramId/init-wallet",
  // GET_WALLET = "/:telegramId/wallet",
  // CONNECT_WALLET = "/:telegramId/connect-wallet",
  // INIT_SIGNATURE = "/:telegramId/init-signature",
  // SIGN_MESSAGE = "/:telegramId/sign-message",
  // TEST FUNC
  DELETE_USER = "/:telegramId/delete",
}

// DEV
router.get(ROUTES.DELETE_USER, UserController.deleteUser);

// PROD
let userController: UserController;

(async () => {
  try {
    userController = await UserController.getInstance();
    console.log("✅ UserController initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize RaffleController:", error);
    process.exit(1);
  }
})();

// ____
// USER

router.post(ROUTES.INIT, (req, res) => {
  if (!userController) {
    return res.status(503).json({
      success: false,
      message: "Service is initializing - userController",
      data: null,
    });
  }
  return userController.initUser(req, res);
});
router.get(ROUTES.GET_USER, validateGetUser, UserController.getUser);

// ______
// WALLET
router.post(ROUTES.UPDATE_TON_WALLET, validateInitUser, (req: any, res) => {
  if (!userController) {
    return res.status(503).json({
      success: false,
      message: "Service is initializing - userController",
      data: null,
    });
  }
  return userController.updateTonWallet(req, res);
});

// _______
// RAFFLES
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

router.get(ROUTES.GET_CURRENT_RAFFLE, (req, res) => {
  if (!raffleController) {
    return res.status(503).json({
      success: false,
      message: "Service is initializing",
      data: null,
    });
  }
  return raffleController.getCurrentRaffle(req, res);
});

router.post(ROUTES.PURCHASE_TICKETS, (req, res) => {
  if (!raffleController) {
    return res.status(503).json({
      success: false,
      message: "Service is initializing",
      data: null,
    });
  }
  return raffleController.purchaseTicket(req, res);
});

// TODO FUFUTUTUTRERE

// WALLET
// router.post(ROUTES.INIT_WALLET, validateGetUser, WalletController.initWallet);
// router.get(ROUTES.GET_WALLET, validateGetUser, WalletController.getWallet);
// router.get(
//   ROUTES.DELETE_WALLET,
//   validateGetUser,
//   WalletController.deleteWallet
// );
// router.post(
//   ROUTES.CONNECT_WALLET,
//   validateWalletConnection,
//   WalletController.walletConnection
// );
// router.get(ROUTES.INIT_SIGNATURE, WalletController.getSignatureInitialization);
// router.post(ROUTES.SIGN_MESSAGE, WalletController.signMessage);

export default router;
