"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import { Movie } from "@/types";

// Extended user type to include ID
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  isAdmin?: boolean;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/user");
    }
  }, [status, router]);
  
  // Fetch user's movies
  useEffect(() => {
    async function fetchUserMovies() {
      if (status !== "authenticated") return;
      
      const user = session?.user as ExtendedUser;
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/movies?userId=${user.id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch movies");
        }
        
        setMovies(data.data);
      } catch (err) {
        console.error("Error fetching user movies:", err);
        setError("Failed to load your movies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserMovies();
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
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />
      
      <main>
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Movie Ratings</h1>
            <a 
              href="/user/add" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add New Rating
            </a>
          </div>
          
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