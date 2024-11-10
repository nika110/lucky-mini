import mongoose, { Document, Schema } from "mongoose";
import { ISolanaWallet, ITonWallet, IUser, IWallet } from "../types/interfaces";
import { BlockchainType } from "../types/enums";

export interface UserDocument extends IUser, Document {}

// Solana Wallet Schema with validation
const SolanaWalletSchema = new Schema<ISolanaWallet>(
  {
    session: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string | null) {
          return v === null || v.length > 0;
        },
        message: "Session must be either null or non-empty string",
      },
    },
    shared_key: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string | null) {
          return v === null || v.length > 0;
        },
        message: "Shared key must be either null or non-empty string",
      },
    },
    nonce: {
      type: String,
      required: [true, "Nonce is required"],
      validate: {
        validator: function (v: string) {
          return v.length > 0;
        },
        message: "Nonce cannot be empty",
      },
    },
    phantom_account_public_key: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string | null) {
          return v === null || v.length > 0;
        },
        message:
          "Phantom account public key must be either null or non-empty string",
      },
    },
    server_public_key: {
      type: String,
      required: [true, "Server public key is required"],
      validate: {
        validator: function (v: string) {
          return v.length > 0;
        },
        message: "Server public key cannot be empty",
      },
    },
    server_secret_key: {
      type: String,
      required: [true, "Server secret key is required"],
      select: false, // Important: Don't return secret key in queries by default
      validate: {
        validator: function (v: string) {
          return v.length > 0;
        },
        message: "Server secret key cannot be empty",
      },
    },
  },
  { _id: false }
);

// TON Wallet Schema (empty for now but structured for future expansion)
const TonWalletSchema = new Schema<ITonWallet>({}, { _id: false });

// Type guard for wallet discrimination
function isSolanaWallet(
  wallet: ISolanaWallet | ITonWallet
): wallet is ISolanaWallet {
  return (
    (wallet as ISolanaWallet).nonce !== undefined &&
    (wallet as ISolanaWallet).server_public_key !== undefined &&
    (wallet as ISolanaWallet).server_secret_key !== undefined
  );
}

// Wallet Schema with discriminator
const WalletSchema = new Schema<IWallet>(
  {
    walletType: {
      type: String,
      required: [true, "Wallet type is required"],
      enum: {
        values: ["solana", "ton"],
        message: "Invalid wallet type",
      },
    },
    walletData: {
      type: Schema.Types.Mixed,
      required: [true, "Wallet data is required"],
      validate: {
        validator: function (value: ISolanaWallet | ITonWallet) {
          const walletType = (this as any).walletType;
          if (walletType === "solana") {
            return isSolanaWallet(value);
          }
          // Add TON wallet validation when implemented
          return true;
        },
        message: "Invalid wallet data for specified wallet type",
      },
    },
  },
  { _id: false }
);

// Main User Schema with optimizations and validations
const UserSchema = new Schema<UserDocument>(
  {
    telegramId: {
      type: String,
      required: [true, "Telegram ID is required"],
      unique: true,
      index: true,
      validate: {
        validator: function (v: string) {
          return v.length > 0;
        },
        message: "Telegram ID cannot be empty",
      },
    },
    username: {
      type: String,
      sparse: true,
      index: true,
      validate: {
        validator: function (v: string | undefined) {
          return v === undefined || v.length > 0;
        },
        message: "Username must be either undefined or non-empty string",
      },
    },
    wallet: {
      type: WalletSchema,
      default: undefined,
    },
    referralCode: {
      type: String,
      required: [true, "Referral code is required"],
      unique: true,
      index: true,
      validate: {
        validator: function (v: string) {
          return v.length > 0;
        },
        message: "Referral code cannot be empty",
      },
    },
    referredBy: {
      type: String,
      default: undefined,
      index: true,
      validate: {
        validator: function (v: string | undefined) {
          return v === undefined || v.length > 0;
        },
        message: "ReferredBy must be either undefined or non-empty string",
      },
    },
    referralCount: {
      type: Number,
      default: 0,
      min: [0, "Referral count cannot be negative"],
    },
    totalTickets: {
      type: Number,
      default: 0,
      min: [0, "Total tickets cannot be negative"],
    },
    balance: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v: number) {
          // Allow negative balance for potential debt scenarios
          return typeof v === "number" && !isNaN(v);
        },
        message: "Balance must be a valid number",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes for query optimization
UserSchema.index({ telegramId: 1, createdAt: 1 }); // Optimize user timeline queries
UserSchema.index({ referralCode: 1, referralCount: -1 }); // Optimize referral leaderboard queries
UserSchema.index({ balance: -1 }); // Optimize balance-based sorting
UserSchema.index({ totalTickets: -1 }); // Optimize ticket-based sorting

// Additional indexes for common query patterns
UserSchema.index({ createdAt: 1 }); // Time-based queries
UserSchema.index({ "wallet.walletType": 1 }); // Wallet type filtering
UserSchema.index({ referredBy: 1, createdAt: -1 }); // Referral timeline queries
UserSchema.index({ telegramId: 1, "wallet.walletType": 1 }); // User wallet queries

// Partial indexes for active users
UserSchema.index(
  { balance: -1 },
  {
    partialFilterExpression: { balance: { $gt: 0 } },
    name: "active_users_balance",
  }
);

// Partial index for users with tickets
UserSchema.index(
  { totalTickets: -1 },
  {
    partialFilterExpression: { totalTickets: { $gt: 0 } },
    name: "users_with_tickets",
  }
);

// Middleware for data sanitization before save
UserSchema.pre("save", function (next) {
  // Trim string fields to remove whitespace
  if (this.username) this.username = this.username.trim();
  if (this.referralCode) this.referralCode = this.referralCode.trim();
  if (this.referredBy) this.referredBy = this.referredBy.trim();
  next();
});

// Add instance method for safe user data retrieval
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  if (obj.wallet?.walletData) {
    delete obj.wallet.walletData.server_secret_key;
  }
  return obj;
};

// Add static method for finding user by telegram ID with basic error handling
UserSchema.statics.findByTelegramId = async function (telegramId: string) {
  try {
    return await this.findOne({ telegramId }).exec();
  } catch (error) {
    throw new Error(`Error finding user by Telegram ID`);
  }
};

export const User = mongoose.model<UserDocument>("User", UserSchema);
