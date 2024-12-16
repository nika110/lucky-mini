import { Schema, model } from "mongoose";
import { IUser, IRaffle, ITicket, IWinner } from "./../types/models";

const WinnerSchema = new Schema<IWinner>({
  user_id: { type: String, required: true },
  amount: { type: Number, required: true },
  position: { type: Number, required: true },
});

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true },
  telegram_id: { type: String, required: true, unique: true },
  ton_public_key: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  created_at: { type: Date, required: true, default: Date.now },
  xp: { type: Number, required: true, default: 0 },
  referred_by: { type: String },
});

const RaffleSchema = new Schema<IRaffle>({
  id: { type: String, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  total_pool: { type: Number, required: true, default: 0 },
  winners: { type: [WinnerSchema], default: undefined },
  is_active: { type: Boolean, required: true, default: true },
});

const TicketSchema = new Schema<ITicket>({
  raffle_id: { type: String, required: true },
  ticket_number: { type: String, required: true },
  user_id: { type: String, required: true },
  purchase_time: { type: Date, required: true, default: Date.now },
});

// Indexes
UserSchema.index({ telegram_id: 1 });
RaffleSchema.index({ is_active: 1 });
TicketSchema.index({ raffle_id: 1, user_id: 1 });

// Models
export const User = model<IUser>("User", UserSchema, "users");
export const Raffle = model<IRaffle>("Raffle", RaffleSchema, "raffles");
export const Ticket = model<ITicket>("Ticket", TicketSchema, "tickets");
