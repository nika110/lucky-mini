export interface ConfigApp {
  ticket_price: number;
}

export interface CurrentRaffle {
  raffle_id: string;
  end_time: number;
  current_pool: number;
  participating: boolean;
}

export enum GAME_TYPE {
  LUCKY_31 = "lucky_31",
  LUCKY_RAFFLE = "lucky_raffle",
}