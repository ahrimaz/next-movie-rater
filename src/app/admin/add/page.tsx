"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";

// Define types for TMDB movie results
interface TMDBMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
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

export default function AddMoviePage() {
  const router = useRouter();
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
  
  // Add state for poster error handling
  const [posterError, setPosterError] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
    
    // Reset poster error when the poster URL changes
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
        // Keep the current rating and review as these are user-specific
        rating: prev.rating,
        review: prev.review
      }));
      
      // Reset poster error when selecting a new movie
      setPosterError(false);
      
      // Clear search results after selection
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
      
      // Redirect to the admin page on success
      router.push("/admin");
    } catch (err) {
      console.error("Error adding movie:", err);
      setError("Failed to add movie. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handlePosterError = () => {
    setPosterError(true);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header showAdminLink={false} />

      <main className="mb-8">
        <div className="mb-6">
          <Link 
            href="/admin" 
            className="text-blue-600 hover:underline"
          >
            ← Back to admin
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
            <div className="border rounded-md overflow-hidden mb-6">
              <div className="text-sm font-medium bg-gray-100 p-2">
                Search Results
              </div>
              <ul className="divide-y">
                {searchResults.map((movie: TMDBMovieResult) => (
                  <li key={movie.id} className="p-3 hover:bg-gray-50 cursor-pointer flex items-center" onClick={() => handleSelectMovie(movie.id)}>
                    {movie.poster_path && (
                      <div className="w-10 h-14 bg-gray-200 mr-3 flex-shrink-0 overflow-hidden rounded relative">
                        <Image 
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{movie.title}</div>
                      <div className="text-sm text-gray-600">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
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
              type="url"
              id="poster"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              placeholder="https://"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.poster && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Preview:</div>
                <div className="w-20 h-28 bg-gray-200 overflow-hidden rounded relative">
                  {posterError ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 p-1 text-center">
                      Invalid image
                    </div>
                  ) : (
                    <Image 
                      src={formData.poster} 
                      alt="Poster preview"
                      fill
                      className="object-cover"
                      onError={handlePosterError}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Rating *
            </label>
            <div className="flex items-center">
              <RatingStars 
                rating={formData.rating} 
                readonly={false}
                onChange={handleRatingChange}
                size="lg"
              />
              <span className="ml-2">{formData.rating}/5</span>
            </div>
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
              href="/admin" 
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