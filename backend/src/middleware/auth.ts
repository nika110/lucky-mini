// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../utils/jwt';
import redisService from '../config/redis';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    telegramId: string;
    walletAddress: string;
    iat?: number;
    exp?: number;
  };
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = JwtService.verifyToken(token);

    // Check if token is blacklisted
    const tokenKey = `jwt:${decoded.userId}:${token.slice(-10)}`;
    const isValid = await redisService.get(tokenKey);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Token is invalid or expired'
      });
    }

    // Add user data to request with type assertion
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Export types for use in other files
