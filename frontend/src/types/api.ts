export interface ApiError {
  status: number;
  data: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}


export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
} 