export interface ApiResponse<T = unknown> {
  code: number;
  message?: string; // For backward compatibility
  msg?: string;    // For backward compatibility
  data: T;
} 