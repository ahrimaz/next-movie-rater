"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";

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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
  };
  
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
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