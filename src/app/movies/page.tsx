"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Partial<Movie>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        let url = "/api/movies?isAdmin=true";
        
        if (sortOption) {
          url += `&sort=${sortOption}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch movies");
        }
        
        setMovies(data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [sortOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />

      <main>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Eric&apos;s Movies</h1>
          
          <div className="flex gap-2">
            <select 
              className="border rounded p-2 text-sm"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="">Sort by...</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-blue-600">Loading...</div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-500 mb-4">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No movies found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id}
                id={movie.id!}
                title={movie.title!}
                director={movie.director}
                year={movie.year}
                poster={movie.poster}
                rating={movie.rating!}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 