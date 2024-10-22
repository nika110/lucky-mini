import express from 'express';
import { UserController } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/connect-wallet', auth, UserController.connectWallet);
router.get('/profile/:telegramId', auth, UserController.getProfile);
router.get('/referrals/:telegramId', auth, UserController.getReferrals);

export default router;