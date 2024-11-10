// src/types/express/index.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        telegramId: string;
        walletAddress: string;
        iat?: number;
        exp?: number;
      } & JwtPayload;
    }
  }
}