"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import UserMovieLists from "@/components/movie-lists/UserMovieLists"; // Import UserMovieLists
import { Movie, User } from "@/types";

interface ExtendedUser extends User {
  username?: string;
}

// Rating distribution chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
    distribution: { name: string; value: number }[];
  }>({
    average: 0,
    count: 0,
    distribution: []
  });
  
  // Fetch user's details and movies
  useEffect(() => {
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
        
        // Calculate rating statistics
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
  }, [userId]);
  
  // Calculate rating statistics
  const calculateRatingStats = (movieData: Movie[]) => {
    if (!movieData.length) {
      setRatingStats({
        average: 0,
        count: 0,
        distribution: []
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
      value: count
    }));
    
    setRatingStats({
      average: parseFloat(avg.toFixed(1)),
      count: movieData.length,
      distribution
    });
  };
  
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
  
  // Favorite movies
  const favoriteMovies = movies.filter(movie => movie.isFavorite);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main>
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Handle error state
  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main>
          <div className="bg-red-50 p-4 rounded-md text-red-500 my-8">
            {error || "User not found"}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if profile is private
  if (user.isProfilePublic === false) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main>
          <div className="bg-gray-50 p-8 rounded-md text-center my-8">
            <h2 className="text-2xl font-bold mb-3">Private Profile</h2>
            <p className="text-gray-600">This user has set their profile to private.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />
      
      <main>
        {/* Profile Header */}
        <section className="mb-10 bg-[var(--background-card)] rounded-lg shadow-sm p-6 border border-[var(--border-dark)]">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Profile image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center"> {/* bg-gray-200 to bg-gray-700 */}
                {user.profileImage ? (
                  <Image 
                    src={user.profileImage} 
                    alt={`${user.name}'s profile`}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-3xl text-gray-500"> {/* text-gray-400 to text-gray-500 (darker placeholder) */}
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            
            {/* Profile info */}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-1 text-white">{user.name || "User"}</h1> {/* text-white */}
                  {user.username && (
                    <p className="text-gray-400">@{user.username}</p> {/* text-gray-600 to text-gray-400 */}
                  )}
                  <p className="text-gray-500 text-sm"> {/* text-gray-500 is fine for less emphasis */}
                    Member since {new Date(user.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
                <ShareButton url={shareUrl} title="Share This Profile" /> {/* ShareButton may need internal text color review if it assumes light bg */}
              </div>
              
              {user.bio && (
                <div className="mt-4 text-gray-300"> {/* text-gray-700 to text-gray-300 */}
                  <p>{user.bio}</p>
                </div>
              )}
              
              {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.favoriteGenres.map(genre => (
                    <span key={genre} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm text-gray-300"> {/* bg-gray-100 to bg-gray-700, text-gray-700 to text-gray-300 */}
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="mb-10 bg-[var(--background-card)] rounded-lg shadow-sm p-6 border border-[var(--border-dark)]">
          <h2 className="text-xl font-bold mb-4 text-white">Rating Statistics</h2> {/* text-white */}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded-lg"> {/* bg-gray-50 to bg-gray-700 */}
                <h3 className="text-sm text-gray-400 mb-1">Total Movies Rated</h3> {/* text-gray-500 to text-gray-400 */}
                <p className="text-2xl font-bold text-white">{ratingStats.count}</p> {/* text-white */}
              </div>
              
              <div className="bg-gray-700 p-3 rounded-lg"> {/* bg-gray-50 to bg-gray-700 */}
                <h3 className="text-sm text-gray-400 mb-1">Average Rating</h3> {/* text-gray-500 to text-gray-400 */}
                <p className="text-2xl font-bold text-white">{ratingStats.average}</p> {/* text-white */}
              </div>
              
              {favoriteMovies.length > 0 && (
                <div className="bg-gray-700 p-3 rounded-lg"> {/* bg-gray-50 to bg-gray-700 */}
                  <h3 className="text-sm text-gray-400 mb-1">Favorite Movies</h3> {/* text-gray-500 to text-gray-400 */}
                  <p className="text-2xl font-bold text-white">{favoriteMovies.length}</p> {/* text-white */}
                </div>
              )}
            </div>
            
            {/* Rating Distribution Chart */}
            <div className="md:col-span-2 h-64">
              {ratingStats.count > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingStats.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8" // This color is fine for chart
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}: {name: string; percent: number}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {ratingStats.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background-card)', border: '1px solid var(--border-dark)' }} itemStyle={{ color: 'var(--text-primary)' }}/> {/* Tooltip styling for dark theme */}
                    <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} /> {/* Legend styling for dark theme */}
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500"> {/* text-gray-500 is fine here */}
                  No rating data available
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Favorite Movies Section (if any) */}
        {favoriteMovies.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-white">Favorite Movies</h2> {/* text-white */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteMovies.map((movie) => (
                <MovieCard 
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  director={movie.director}
                  year={movie.year}
                  poster={movie.poster}
                  rating={movie.rating}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* All Movies Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">All Movie Ratings</h2> {/* text-white */}
            
            {/* Sort options */}
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm text-gray-400">Sort by:</label> {/* text-gray-600 to text-gray-400 */}
              <select
                id="sort"
                className="border border-[var(--border-dark)] bg-gray-700 text-white rounded-md p-1 text-sm focus:ring-[var(--primary-blue)] focus:border-[var(--primary-blue)]" /* Style select for dark theme */
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Latest</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
          
          {sortedMovies.length === 0 ? (
            <div className="text-center py-10 border border-[var(--border-dark)] rounded-lg p-8 bg-[var(--background-card)]"> {/* Dark theme for empty state box */}
              <h3 className="text-xl font-semibold mb-2 text-white">No Ratings Yet</h3> {/* text-white */}
              <p className="text-gray-400"> {/* text-gray-500 to text-gray-400 */}
                This user hasn&apos;t shared any movie ratings yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedMovies.map((movie) => (
                <MovieCard 
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  director={movie.director}
                  year={movie.year}
                  poster={movie.poster}
                  rating={movie.rating}
                />
              ))}
            </div>
          )}
        </section>

        {/* Movie Lists Section */}
        <section className="mb-10">
          {/* 
            The UserMovieLists component handles its own title ("Your Movie Lists")
            and overall layout. We just need to provide a section wrapper.
            It also handles its own loading/error/empty states.
            The userId prop is essential.
          */}
          {user?.id && <UserMovieLists userId={user.id} />}
        </section>
      </main>

      <Footer />
    </div>
  );
} 