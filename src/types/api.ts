export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
