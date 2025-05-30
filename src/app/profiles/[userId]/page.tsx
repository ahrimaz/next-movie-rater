"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import { Movie, User } from "@/types";

interface ExtendedUser extends User {
  username?: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState<Partial<ExtendedUser> | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [ratingStats, setRatingStats] = useState<{
    average: number;
    count: number;
    distribution: { name: string; value: number; rating: number }[];
    monthlyActivity: { month: string; count: number }[];
    topGenres: { genre: string; count: number; avgRating: number }[];
  }>({
    average: 0,
    count: 0,
    distribution: [],
    monthlyActivity: [],
    topGenres: []
  });
  
  // Fetch user's details and movies
  useEffect(() => {
    // Helper function to get monthly activity
    const getMonthlyActivity = (movieData: Movie[]) => {
      const months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().substring(0, 7);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const count = movieData.filter(movie => {
          const movieDate = new Date(movie.createdAt);
          const movieMonthKey = movieDate.toISOString().substring(0, 7);
          return movieMonthKey === monthKey;
        }).length;
        
        months.push({ month: monthName, count });
      }
      
      return months;
    };
    
    // Helper function to get top genres (mock implementation)
    const getTopGenres = (movieData: Movie[]) => {
      // This would normally use actual genre data from TMDB
      // For now, returning mock data based on user's favorite genres
      const genres = user?.favoriteGenres || ['Action', 'Drama', 'Comedy'];
      return genres.slice(0, 3).map((genre, index) => ({
        genre,
        count: Math.floor(movieData.length * (0.4 - index * 0.1)),
        avgRating: 4.5 - index * 0.3
      }));
    };

    // Calculate comprehensive rating statistics
    const calculateRatingStats = (movieData: Movie[]) => {
      if (!movieData.length) {
        setRatingStats({
          average: 0,
          count: 0,
          distribution: [],
          monthlyActivity: [],
          topGenres: []
        });
        return;
      }

      // Calculate average rating
      const sum = movieData.reduce((acc, movie) => acc + movie.rating, 0);
      const avg = sum / movieData.length;
      
      // Calculate rating distribution
      const dist = [0, 0, 0, 0, 0]; // For ratings 1-5
      movieData.forEach(movie => {
        if (movie.rating >= 1 && movie.rating <= 5) {
          dist[movie.rating - 1]++;
        }
      });
      
      const distribution = dist.map((count, index) => ({
        name: `${index + 1} Star${index === 0 ? '' : 's'}`,
        value: count,
        rating: index + 1
      }));
      
      // Calculate monthly activity (last 6 months)
      const monthlyActivity = getMonthlyActivity(movieData);
      
      // Calculate top genres (mock data for now - would need genre data from TMDB)
      const topGenres = getTopGenres(movieData);
      
      setRatingStats({
        average: parseFloat(avg.toFixed(1)),
        count: movieData.length,
        distribution,
        monthlyActivity,
        topGenres
      });
    };

    async function fetchUserProfile() {
      try {
        // First fetch user data using ID or username
        const userResponse = await fetch(`/api/users/${userId}`);
        const userData = await userResponse.json();
        
        if (!userData.success) {
          throw new Error(userData.error || "Failed to fetch user profile");
        }
        
        setUser(userData.data);
        
        // Then fetch user's movies
        const moviesResponse = await fetch(`/api/movies?userId=${userData.data.id}`);
        const moviesData = await moviesResponse.json();
        
        if (!moviesData.success) {
          throw new Error(moviesData.error || "Failed to fetch user's movies");
        }
        
        setMovies(moviesData.data);
        
        // Calculate comprehensive rating statistics
        calculateRatingStats(moviesData.data);
        
        // Set the share URL with the user's username if available, otherwise use ID
        const urlIdentifier = userData.data.username || userId;
        setShareUrl(`${window.location.origin}/profiles/${urlIdentifier}`);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load this user's profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [userId, user?.favoriteGenres]);
  
  // Sort movies based on selected option
  const sortedMovies = [...movies].sort((a, b) => {
    switch (sortBy) {
      case "rating-high":
        return b.rating - a.rating;
      case "rating-low":
        return a.rating - b.rating;
      case "title":
        return a.title.localeCompare(b.title);
      case "date":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Filter movies by genre
  const filteredMovies = sortedMovies;
  
  // Favorite movies and featured movies
  const favoriteMovies = movies.filter(movie => movie.isFavorite);
  const featuredMovies = favoriteMovies.length > 0 ? favoriteMovies.slice(0, 8) : sortedMovies.slice(0, 8);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto p-6">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Handle error state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-red-600 dark:text-red-400 my-8 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
            <p>{error || "User not found"}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if profile is private
  if (user.isProfilePublic === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto p-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-12 rounded-xl text-center my-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m0-12a2 2 0 100 4h4a2 2 0 100-4m-6 8a2 2 0 100 4h8a2 2 0 100-4H6z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Private Profile</h2>
            <p className="text-gray-600 dark:text-gray-400">This user has set their profile to private.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Compact Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white dark:border-gray-700 shadow-lg">
                  {user.profileImage ? (
                    <Image 
                      src={user.profileImage} 
                      alt={`${user.name}'s profile`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                {user.isAdmin && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.name || "User"}
                </h1>
                {user.username && (
                  <p className="text-gray-600 dark:text-gray-400 text-lg">@{user.username}</p>
                )}
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Member since {new Date(user.createdAt || "").toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Quick Stats & Bio & Share */}
            <div className="flex flex-col lg:items-end gap-4">
              {/* Quick Stats */}
              {ratingStats.count > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {ratingStats.count}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Movies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {ratingStats.average}★
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {favoriteMovies.length}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Favorites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {Math.max(...ratingStats.distribution.map(d => d.rating), 0)}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Top Rating</div>
                  </div>
                </div>
              )}
              
              {/* Bio & Share */}
              <div className="flex flex-col lg:items-end gap-3">
                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm lg:text-right lg:max-w-md">
                    {user.bio}
                  </p>
                )}
                <ShareButton url={shareUrl} title="Share This Profile" />
              </div>
            </div>
          </div>

          {/* Genres */}
          {user.favoriteGenres && user.favoriteGenres.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {user.favoriteGenres.map(genre => (
                  <span 
                    key={genre} 
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Movies Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Featured Ratings */}
            {featuredMovies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {favoriteMovies.length > 0 ? "Featured Ratings" : "Top Ratings"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {featuredMovies.map((movie) => (
                    <div key={movie.id} className="transform hover:scale-105 transition-transform duration-200">
                      <MovieCard 
                        id={movie.id}
                        title={movie.title}
                        director={movie.director}
                        year={movie.year}
                        poster={movie.poster}
                        rating={movie.rating}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Ratings */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  All Ratings ({filteredMovies.length})
                </h2>
                
                {/* Sort Controls */}
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Latest First</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
              
              {filteredMovies.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Ratings Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This user hasn&apos;t shared any movie ratings yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                  {filteredMovies.map((movie) => (
                    <div key={movie.id} className="transform hover:scale-105 transition-transform duration-200">
                      <MovieCard 
                        id={movie.id}
                        title={movie.title}
                        director={movie.director}
                        year={movie.year}
                        poster={movie.poster}
                        rating={movie.rating}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Latest Reviews (The awesome panel we're keeping!) */}
            {movies.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
                  Latest Reviews
                </h3>
                <div className="space-y-3">
                  {movies.slice(0, 5).map((movie) => (
                    <div key={movie.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <div className="flex-shrink-0">
                        {movie.poster ? (
                          <Image
                            src={movie.poster}
                            alt={movie.title}
                            width={32}
                            height={48}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">?</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {movie.title}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-3 h-3 ${i < movie.rating ? 'fill-current' : 'fill-gray-300 dark:fill-gray-600'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(movie.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 