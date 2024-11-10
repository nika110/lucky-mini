import express from "express";
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
  GET_REFERRALS = "/:telegramId/referrals",
  DELETE_WALLET = "/:telegramId/delete-wallet",
  INIT_WALLET = "/:telegramId/init-wallet",
  GET_WALLET = "/:telegramId/wallet",
  CONNECT_WALLET = "/:telegramId/connect-wallet",
  INIT_SIGNATURE = "/:telegramId/init-signature",
  SIGN_MESSAGE = "/:telegramId/sign-message",
  // TEST FUNC
  DELETE_USER = "/:telegramId/delete",
  // RAFFLES
  GET_CURRENT_RAFFLE = "/current-raffle",
}

// DEV
router.get(ROUTES.DELETE_USER, UserController.deleteUser);

// PROD

router.post(ROUTES.INIT, validateInitUser, UserController.initUser);
router.get(ROUTES.GET_USER, validateGetUser, UserController.getUser);

// WALLET
router.post(ROUTES.INIT_WALLET, validateGetUser, WalletController.initWallet);
router.get(ROUTES.GET_WALLET, validateGetUser, WalletController.getWallet);
router.get(
  ROUTES.DELETE_WALLET,
  validateGetUser,
  WalletController.deleteWallet
);
router.post(
  ROUTES.CONNECT_WALLET,
  validateWalletConnection,
  WalletController.walletConnection
);
router.get(ROUTES.INIT_SIGNATURE, WalletController.getSignatureInitialization);
router.post(ROUTES.SIGN_MESSAGE, WalletController.signMessage);

// RAFFLES
router.get(ROUTES.GET_CURRENT_RAFFLE, RaffleController.getCurrentRaffle);

export default router;
