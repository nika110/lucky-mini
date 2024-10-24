// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { IWalletConnection } from '../types/interfaces';

export const validateWalletConnection = (
  req: Request<{}, {}, IWalletConnection>,
  res: Response,
  next: NextFunction
) => {
  const { public_key, wallet_type, telegram_id } = req.body;

  if (!public_key || typeof public_key !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Valid public_key is required'
    });
  }

  if (!wallet_type || !['ton', 'solana'].includes(wallet_type)) {
    return res.status(400).json({
      success: false,
      error: 'Valid wallet_type is required (ton or solana)'
    });
  }

  if (!telegram_id || typeof telegram_id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Valid telegram_id is required'
    });
  }

  if (req.body.signature && typeof req.body.signature !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Data must be a string if provided'
    });
  }

  next();
};