"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import { Movie } from "@/types";
import { notFound, useRouter } from "next/navigation";

type MoviePageProps = {
  params: {
    id: string;
  };
};

export default function MoviePage({ params }: MoviePageProps) {
  const { id } = params;
  const router = useRouter();
  
  const [movie, setMovie] = useState<Partial<Movie> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/movies/${id}`);
        const data = await response.json();
        
        if (!data.success) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error(data.error || "Failed to fetch movie details");
        }
        
        setMovie(data.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching movie ID ${id}:`, err);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);
  
  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-blue-600">Loading...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If there was an error, show an error message
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <div className="bg-red-50 p-4 rounded-md text-red-500 mb-4">
          {error}
        </div>
        <div className="mt-4">
          <Link 
            href="/movies" 
            className="text-blue-600 hover:underline"
          >
            ← Back to all movies
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // If movie is null after loading and no error, it means the movie was not found
  if (!movie) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />

      <main className="mb-8">
        <Link 
          href="/movies" 
          className="inline-flex items-center mb-6 text-blue-600 hover:underline"
        >
          ← Back to all movies
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Movie poster */}
          <div className="aspect-[2/3] bg-gray-200 rounded overflow-hidden">
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-500">
                No poster available
              </div>
            )}
          </div>
          
          {/* Movie details */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            
            <div className="flex items-center mb-4">
              <RatingStars rating={movie.rating || 0} size="lg" />
              <span className="ml-2 font-semibold">{movie.rating}/5</span>
            </div>
            
            <div className="mb-6 space-y-2">
              {movie.director && (
                <p><span className="font-semibold">Director:</span> {movie.director}</p>
              )}
              
              {movie.year && (
                <p><span className="font-semibold">Year:</span> {movie.year}</p>
              )}
            </div>
            
            {movie.review && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-3">Review</h2>
                <div className="prose prose-slate">
                  <p>{movie.review}</p>
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