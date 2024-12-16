import { Request, Response, NextFunction } from "express";
import { IUserGet, IUserRegistration } from "../types/interfaces";
import {
  InitWalletParams,
  WalletConnection,
} from "../controllers/walletController";

export const validateInitUser = (
  req: Request<{}, {}, IUserRegistration>,
  res: Response,
  next: NextFunction
) => {
  // Check Authorization header
  const authHeader = req.headers.authorization || req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "UNAUTHORIZED",
      message: "Authorization header is missing",
    });
  }

  // Validate token format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token || token.trim() === "") {
    return res.status(401).json({
      success: false,
      error: "UNAUTHORIZED",
      message: "Invalid authorization token",
    });
  }

  // Add token to request
  (req as Request & { token: string }).token = token;

  next();
};

export const validateGetUser = (
  req: Request<{ telegramId: string }>,
  res: Response,
  next: NextFunction
) => {
  const { telegramId } = req.params;

  if (!telegramId || typeof telegramId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Valid telegramId is required",
    });
  }

  next();
};

export const validateWalletConnection = (
  req: Request<InitWalletParams, {}, WalletConnection>,
  res: Response,
  next: NextFunction
) => {
  const { telegramId } = req.params;
  const {
    phantom_encryption_public_key,
    nonce: phantom_nonce,
    data: phantom_data,
  } = req.body;

  if (!telegramId || typeof telegramId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Valid telegramId is required",
    });
  }

  if (!phantom_encryption_public_key || !phantom_nonce || !phantom_data) {
    return res.status(400).json({
      success: false,
      error: "Valid phantom data is required",
    });
  }

  next();
};
