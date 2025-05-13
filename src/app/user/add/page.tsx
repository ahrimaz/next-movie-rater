"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";

// Interface for movie search results
interface TMDBMovieResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
}

// Type for movie details returned from API
interface TMDBMovieDetails {
  id: number;
  title: string;
  director: string;
  release_year: number | null;
  poster_url: string | null;
  overview: string;
  runtime: number | null;
}

export default function UserAddMoviePage() {
  const { status } = useSession();
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/user/add");
    }
  }, [status, router]);
  
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    year: new Date().getFullYear(),
    poster: '',
    rating: 3,
    review: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovieResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [posterError, setPosterError] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
    
    if (name === 'poster') {
      setPosterError(false);
    }
  };
  
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to search for movies");
      }
      
      setSearchResults(data.results);
    } catch (err) {
      console.error("Error searching for movies:", err);
      setError("Failed to search for movies. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectMovie = async (movieId: number) => {
    try {
      setIsSearching(true);
      setError(null);
      
      const response = await fetch(`/api/tmdb/movie/${movieId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: Failed to get movie details`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to get movie details");
      }
      
      const movie: TMDBMovieDetails = data.movie;
      
      setFormData(prev => ({
        ...prev,
        title: movie.title,
        director: movie.director || '',
        year: movie.release_year || prev.year,
        poster: movie.poster_url || '',
        rating: prev.rating,
        review: prev.review
      }));
      
      setPosterError(false);
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      console.error("Error getting movie details:", err);
      setError("Failed to get movie details. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to add movie");
      }
      
      // Redirect to the user dashboard on success
      router.push("/user");
    } catch (err) {
      console.error("Error adding movie:", err);
      setError("Failed to add movie. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  const handlePosterError = () => {
    setPosterError(true);
  };
  
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

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header showAdminLink={false} />

      <main className="mb-8">
        <div className="mb-6">
          <Link 
            href="/user" 
            className="text-blue-600 hover:underline"
          >
            ← Back to my ratings
          </Link>
          <h1 className="text-2xl font-bold mt-4">Add New Movie Rating</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-500 mb-6">
            {error}
          </div>
        )}
        
        {/* TMDB Search Section */}
        <div className="mb-8 max-w-2xl">
          <h2 className="text-lg font-medium mb-2">Find a movie</h2>
          <p className="text-sm text-gray-600 mb-4">
            Search for a movie to automatically fill in details from TMDB.
          </p>
          
          <form onSubmit={handleSearch} className="flex mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a movie..."
              className="flex-grow p-2 border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium mb-3">Search Results</h3>
              <ul className="divide-y">
                {searchResults.map((movie) => (
                  <li key={movie.id} className="py-3 first:pt-0 last:pb-0">
                    <button
                      onClick={() => handleSelectMovie(movie.id)}
                      className="flex items-start text-left w-full hover:bg-gray-50 p-2 rounded transition"
                    >
                      <div className="flex-shrink-0 w-12 h-16 bg-gray-200 mr-3 relative overflow-hidden">
                        {movie.poster_path ? (
                          <Image 
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                            alt={`${movie.title} poster`}
                            width={92}
                            height={138}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-xs text-gray-500">
                            No poster
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{movie.title}</div>
                        <div className="text-sm text-gray-500">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
          
        {/* Movie Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Movie Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Director */}
          <div>
            <label htmlFor="director" className="block text-sm font-medium mb-1">
              Director
            </label>
            <input
              type="text"
              id="director"
              name="director"
              value={formData.director}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-1">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              min="1900"
              max={new Date().getFullYear() + 5}
              value={formData.year}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Poster URL */}
          <div>
            <label htmlFor="poster" className="block text-sm font-medium mb-1">
              Poster URL
            </label>
            <input
              type="text"
              id="poster"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {formData.poster && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Poster Preview:</p>
                <div className="w-32 h-48 bg-gray-200 relative overflow-hidden">
                  <Image
                    src={formData.poster}
                    alt="Movie poster preview"
                    width={128}
                    height={192}
                    className={`w-full h-full object-cover ${posterError ? 'hidden' : 'block'}`}
                    onError={handlePosterError}
                  />
                  {posterError && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                      Invalid image URL
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Rating *
            </label>
            <RatingStars rating={formData.rating} onChange={handleRatingChange} readonly={false} />
          </div>
          
          {/* Review */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium mb-1">
              Review
            </label>
            <textarea
              id="review"
              name="review"
              value={formData.review}
              onChange={handleChange}
              rows={5}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Movie"}
            </button>
            <Link 
              href="/user" 
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
} 