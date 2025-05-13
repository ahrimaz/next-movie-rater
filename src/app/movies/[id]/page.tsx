"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import ShareButton from "@/components/ShareButton";
import { Movie } from "@/types";
import { notFound } from "next/navigation";

// Extended movie type to include user info
interface ExtendedMovie extends Movie {
  user?: {
    id: string;
    name?: string;
    isAdmin?: boolean;
  };
}

export default function MoviePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [movie, setMovie] = useState<Partial<ExtendedMovie> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");

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
        setShareUrl(`${window.location.origin}/movies/${id}`);
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
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/movies" 
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            ← Back to all movies
          </Link>
          
          <ShareButton url={shareUrl} title="Share This Rating" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Movie poster */}
          <div className="aspect-[2/3] bg-gray-200 rounded overflow-hidden">
            {movie.poster ? (
              <div className="relative w-full h-full">
                <Image
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
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
            
            {/* Rated by information with link to profile */}
            {movie.user && (
              <div className="mb-4 text-gray-600">
                Rated by:{' '}
                <Link href={`/profiles/${movie.user.id}`} className="text-blue-600 hover:underline">
                  {movie.user.name || (movie.user.isAdmin ? 'Admin' : 'User')}
                </Link>
                {movie.user.isAdmin && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            )}
            
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