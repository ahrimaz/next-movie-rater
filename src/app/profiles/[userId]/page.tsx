"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />
      
      <main>
        <section className="mb-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{user.name || "User"}&apos;s Movie Ratings</h1>
              {user.username && (
                <p className="text-gray-600 mt-1">@{user.username}</p>
              )}
              <p className="text-gray-600 mt-1">Public profile</p>
            </div>
            <ShareButton url={shareUrl} title="Share This Profile" />
          </div>
          
          {movies.length === 0 ? (
            <div className="text-center py-10 border rounded-lg p-8 bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">No Ratings Yet</h3>
              <p className="text-gray-500">
                This user hasn&apos;t shared any movie ratings yet.
              </p>
            </div>
          ) : (
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
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
} 