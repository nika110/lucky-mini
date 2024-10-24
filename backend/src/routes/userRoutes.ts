// src/routes/userRoutes.ts
import express from 'express';
import { UserController } from '../controllers/userController';
import { validateWalletConnection } from '../middleware/validation';

const router = express.Router();

router.post('/connect-wallet', validateWalletConnection, UserController.connectWallet);
router.get('/uset, ')

export default router;
