import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}
import { User } from '../models/User';

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get telegram data from request
    const telegramData = req.headers['x-telegram-data'];
    
    if (!telegramData) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Verify telegram data here
    // This is where you'd implement Telegram's auth verification
    // https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app

    // For now, just check if user exists
    const user = await User.findOne({ telegramId: telegramData });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};