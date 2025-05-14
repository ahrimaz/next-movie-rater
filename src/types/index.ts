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
  isFavorite?: boolean;
  isPublic?: boolean;
};

// User related types
export type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  isAdmin: boolean;
  createdAt?: Date;
  
  // Profile fields
  bio?: string;
  profileImage?: string;
  themeColor?: string;
  isProfilePublic?: boolean;
  favoriteGenres?: string[];
};

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}; 