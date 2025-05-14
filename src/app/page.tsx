"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import { Movie } from "@/types";

export default function HomePage() {
  const [adminMovies, setAdminMovies] = useState<Movie[]>([]);
  const [communityMovies, setCommunityMovies] = useState<Movie[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [communityError, setCommunityError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminMovies() {
      try {
        const response = await fetch(`/api/movies?isAdmin=true&limit=3`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch admin movies");
        }
        
        setAdminMovies(data.data);
      } catch (err) {
        console.error("Error fetching admin movies:", err);
        setAdminError("Failed to load admin movies. Please try again later.");
      } finally {
        setIsLoadingAdmin(false);
      }
    }
    
    async function fetchCommunityMovies() {
      try {
        const response = await fetch(`/api/movies?isAdmin=false&limit=3`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch community movies");
        }
        
        setCommunityMovies(data.data);
      } catch (err) {
        console.error("Error fetching community movies:", err);
        setCommunityError("Failed to load community movies. Please try again later.");
      } finally {
        setIsLoadingCommunity(false);
      }
    }
    
    fetchAdminMovies();
    fetchCommunityMovies();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header showAdminLink={true} />
      
      <main>
        {/* Admin ratings section */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold mb-6">Eric&apos;s Movie Ratings</h1>
          
          {isLoadingAdmin ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading ratings...</p>
            </div>
          ) : adminError ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500">
              {adminError}
            </div>
          ) : adminMovies.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No admin movie ratings yet.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {adminMovies.map((movie) => (
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
              <div className="text-center mt-6">
                <Link 
                  href="/movies" 
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Of Eric&apos;s Ratings →
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Community ratings section */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Community Ratings</h2>
          
          {isLoadingCommunity ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading community ratings...</p>
            </div>
          ) : communityError ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500">
              {communityError}
            </div>
          ) : communityMovies.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No community ratings yet.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {communityMovies.map((movie) => (
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
                  />
                ))}
              </div>
              <div className="text-center mt-6">
                <Link 
                  href="/community-ratings" 
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Community Ratings →
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
