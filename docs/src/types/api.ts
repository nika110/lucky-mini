export interface ApiError {
  status: number;
  data: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}
