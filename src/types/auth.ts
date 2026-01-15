export interface CurrentUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

// FIX: Use 'unknown' default to satisfy linter
// FIX: Ensure 'message' is explicitly declared
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}