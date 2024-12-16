export type WebSocketMessage = unknown;

export interface RaffleState {
  currentPool: number;
  ticketCount: number;
  timeRemaining: number;
}
