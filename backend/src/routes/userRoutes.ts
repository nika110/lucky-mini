// src/routes/userRoutes.ts
import express from "express";
import { UserController } from "../controllers/userController";
import { validateGetUser, validateInitUser, validateWalletConnection } from "../middleware/validation";
import { WalletController } from "../controllers/walletController";

const router = express.Router();

enum ROUTES {
  INIT = "/initialize",
  GET_USER = "/:telegramId",
  GET_REFERRALS = "/:telegramId/referrals",
  INIT_SOL_WALLET = "/:telegramId/init-sol-wallet",
  GET_SOL_WALLET = "/:telegramId/sol-wallet",
  CONNECT_WALLET = "/:telegramId/connect-wallet",
}

router.post(ROUTES.INIT, validateInitUser, UserController.initUser);
router.get(ROUTES.GET_USER, validateGetUser, UserController.getUser);
router.post(
  ROUTES.INIT_SOL_WALLET,
  validateGetUser,
  WalletController.initSolanaWallet
);
router.get(
  ROUTES.GET_SOL_WALLET,
  validateGetUser,
  WalletController.getSolanaWallet
);
router.get(
  ROUTES.CONNECT_WALLET,
  validateWalletConnection,
  WalletController.walletConnection
);

export default router;
