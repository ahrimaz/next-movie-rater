"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import { Movie } from "@/types";

// Extended user type to include ID and username
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  isAdmin?: boolean;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/user");
    }
  }, [status, router]);
  
  // Function to refresh movie data when favorites change
  const refreshMovies = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/movies?userId=${(session.user as ExtendedUser).id}`);
      const data = await response.json();
      
      if (data.success) {
        setMovies(data.data);
      }
    } catch (error) {
      console.error("Error refreshing movies:", error);
    }
  };

  useEffect(() => {
    async function fetchMovies() {
      if (!session?.user) return;
      
      try {
        const response = await fetch(`/api/movies?userId=${(session.user as ExtendedUser).id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch movies");
        }
        
        setMovies(data.data);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load your movie ratings.");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (status === "authenticated") {
      fetchMovies();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);
  
  // Fetch user details and movies
  useEffect(() => {
    async function fetchUserData() {
      if (status !== "authenticated") return;
      
      const user = session?.user as ExtendedUser;
      if (!user?.id) return;
      
      try {
        // First, get the full user data to get the username
        const userResponse = await fetch(`/api/users/${user.id}`);
        const userData = await userResponse.json();
        
        if (!userData.success) {
          throw new Error(userData.error || "Failed to fetch user data");
        }
        
        // Then get the user's movies
        const moviesResponse = await fetch(`/api/movies?userId=${user.id}`);
        const moviesData = await moviesResponse.json();
        
        if (!moviesData.success) {
          throw new Error(moviesData.error || "Failed to fetch movies");
        }
        
        setMovies(moviesData.data);
        
        // Set the share URL based on the username if available, otherwise fall back to ID
        const urlIdentifier = userData.data.username || user.id;
        setShareUrl(`${window.location.origin}/profiles/${urlIdentifier}`);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, [session, status]);
  
  // Handle loading and authentication state
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main>
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get favorite movies for stats display
  const favoriteMovies = movies.filter(movie => movie.isFavorite);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />
      
      <main>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Movie Ratings</h1>
            {favoriteMovies.length > 0 && (
              <p className="text-gray-600 text-sm mt-1">
                {favoriteMovies.length}/4 favorites selected
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <ShareButton url={shareUrl} title="Share My Ratings" />
            <a 
              href="/user/add" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add Movie
            </a>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteMovies.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">My Favorite Films</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteMovies.map((movie) => (
                <MovieCard 
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  director={movie.director}
                  year={movie.year}
                  poster={movie.poster}
                  rating={movie.rating}
                  user={{ id: (session?.user as ExtendedUser).id || '' }}
                  showUser={false}
                  isFavorite={movie.isFavorite}
                  onFavoriteChange={refreshMovies}
                  badge="Favorite"
                />
              ))}
            </div>
          </section>
        )}

        {/* All Movies Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">All Your Ratings</h2>
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading your ratings...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500">
              {error}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-10 border rounded-lg p-8 bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">No Ratings Yet</h3>
              <p className="text-gray-500 mb-6">
                You haven&apos;t rated any movies yet. Start by adding your first movie rating!
              </p>
              <a 
                href="/user/add" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Rate Your First Movie
              </a>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {movies.map((movie) => (
                  <MovieCard 
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    director={movie.director}
                    year={movie.year}
                    poster={movie.poster}
                    rating={movie.rating}
                    user={{ id: (session?.user as ExtendedUser).id || '' }}
                    showUser={false}
                    isFavorite={movie.isFavorite}
                    onFavoriteChange={refreshMovies}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
} 