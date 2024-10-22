import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../types/interfaces';

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      sparse: true,
    },
    walletAddresses: {
      ton: {
        type: String,
        sparse: true,
      },
      solana: {
        type: String,
        sparse: true,
      },
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referredBy: {
      type: String,
      ref: 'User',
      sparse: true,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    totalTickets: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.index({ createdAt: 1 });
// userSchema.index({ referralCount: -1 });

export const User = mongoose.model<UserDocument>('User', userSchema);