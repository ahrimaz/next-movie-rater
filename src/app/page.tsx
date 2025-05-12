"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types";

export default function Home() {
  const [latestRatings, setLatestRatings] = useState<Partial<Movie>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/movies?limit=3");
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch movie ratings");
        }
        
        setLatestRatings(data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching latest ratings:", err);
        setError("Failed to load latest ratings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />

      <main>
        <section>
          <h2 className="text-2xl font-semibold mb-6">Latest Ratings</h2>
          
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
          ) : latestRatings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No movie ratings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestRatings.map((movie) => (
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
          
          <div className="mt-8 text-center">
            <Link 
              href="/movies" 
              className="inline-block bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              View All Movies
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
