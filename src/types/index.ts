// Movie related types
export type Movie = {
  id: string;
  title: string;
  director?: string;
  year?: number;
  poster?: string;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  user?: User;
};

// User related types
export type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  isAdmin: boolean;
};

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}; 