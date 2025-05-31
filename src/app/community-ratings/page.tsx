"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import { Movie } from "@/types";

export default function CommunityRatingsPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh movies data
  const refreshMovies = async () => {
    try {
      const response = await fetch(`/api/movies?isAdmin=false`);
      const data = await response.json();
      if (data.success) {
        setMovies(data.data);
      }
    } catch (error) {
      console.error("Error refreshing community movies:", error);
    }
  };

  useEffect(() => {
    async function fetchCommunityMovies() {
      try {
        const response = await fetch(`/api/movies?isAdmin=false`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch community ratings");
        }
        
        setMovies(data.data);
      } catch (err) {
        console.error("Error fetching community ratings:", err);
        setError("Failed to load community ratings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCommunityMovies();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header showAdminLink={true} />
      
      <main>
        <section className="mb-10">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Community Ratings</h1>
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </Link>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading community ratings...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500">
              {error}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No community ratings yet.</p>
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
                  user={movie.user}
                  showUser={true}
                  isFavorite={movie.isFavorite}
                  onFavoriteChange={refreshMovies}
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