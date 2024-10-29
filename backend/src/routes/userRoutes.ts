// src/routes/userRoutes.ts
import express from "express";
import { UserController } from "../controllers/userController";
import {
  validateGetUser,
  validateInitUser,
  validateWalletConnection,
} from "../middleware/validation";
import { WalletController } from "../controllers/walletController";

const router = express.Router();

enum ROUTES {
  INIT = "/initialize",
  GET_USER = "/:telegramId",
  GET_REFERRALS = "/:telegramId/referrals",
  GET_SOL_WALLET = "/:telegramId/sol-wallet",
  CONNECT_WALLET = "/:telegramId/connect-wallet",
  INIT_SIGNATURE = "/:telegramId/init-signature",
  SIGN_MESSAGE = "/:telegramId/sign-message",
}

router.post(ROUTES.INIT, validateInitUser, UserController.initUser);
router.get(ROUTES.GET_USER, validateGetUser, UserController.getUser);
router.get(
  ROUTES.GET_SOL_WALLET,
  validateGetUser,
  WalletController.getSolanaWallet
);
router.post(
  ROUTES.CONNECT_WALLET,
  validateWalletConnection,
  WalletController.walletConnection
);
router.get(ROUTES.INIT_SIGNATURE, WalletController.getSignatureInitialization);
router.post(ROUTES.SIGN_MESSAGE, WalletController.signMessage);

export default router;
