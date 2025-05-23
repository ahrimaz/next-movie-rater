// Movie related types
export type Movie = {
  id: string;
  title: string;
  director?: string;
  year?: number;
  poster?: string;
  rating: number;
  review?: string;
  createdAt: Date | string; // Allow string for serialized dates
  updatedAt: Date | string; // Allow string for serialized dates
  userId?: string;
  user?: User;
  isFavorite?: boolean;
  isPublic?: boolean;
};

// User related types
export type User = {
  id:string;
  email: string;
  username?: string;
  name?: string;
  isAdmin: boolean;
  createdAt?: Date | string; // Allow string for serialized dates
  
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

// MovieList related types
export interface MovieListItem {
  id: string;
  movieId: string;
  movieListId: string;
  addedAt: Date | string; // Allow string for serialized dates
  movie: Movie; // Embed the full Movie object
}

export interface MovieList {
  id: string;
  name: string;
  description?: string | null; // Allow null
  userId: string;
  user?: User; // Optional: if you plan to populate user details
  createdAt: Date | string; // Allow string for serialized dates
  updatedAt: Date | string; // Allow string for serialized dates
  movies: MovieListItem[]; // Array of MovieListItems
  // For MovieListCard, we might only have a count or a few preview items
  _count?: { // Prisma's way of returning counts
    movies: number;
  };
}