export interface IUser {
  id: string;
  telegram_id: string;
  ton_public_key: string;
  balance: number;
  created_at: Date;
  xp: number;
  referred_by?: string;
}

export interface IWinner {
  user_id: string;
  amount: number;
  position: number;
}

export interface IRaffle {
  id: string;
  start_time: Date;
  end_time: Date;
  total_pool: number;
  winners?: IWinner[];
  is_active: boolean;
}

export interface ITicket {
  raffle_id: string;
  ticket_number: string;
  user_id: string;
  purchase_time: Date;
}
