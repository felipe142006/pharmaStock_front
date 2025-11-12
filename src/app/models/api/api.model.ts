export interface ApiPage<T> {
  current_page?: number;
  data: T[];
  total?: number;
  per_page?: number;
}

export interface ApiEnvelope<T = any> {
  success?: boolean;
  data: T | ApiPage<T>;
  message?: string;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  data: T;
}