export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userType: 'ADMIN' | 'CUSTOMER';
  userId: number;
  email: string;
  expiresIn: number;
}

export interface User {
  userId: number;
  email: string;
  userType: 'ADMIN' | 'CUSTOMER';
}

export interface ApiError {
  message: string;
  status?: number;
}
