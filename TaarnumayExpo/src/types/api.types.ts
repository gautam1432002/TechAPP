// ─── API Response wrapper ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
