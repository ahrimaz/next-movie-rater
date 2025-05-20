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
  const [activeTab, setActiveTab] = useState("community");
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
    <div className="min-h-screen bg-gray-950 text-white">
      <Header showAdminLink={true} />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="relative z-10">
            <div className="mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-full">A New Experience</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">Movie Rater</h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-8">
              Discover exceptional films through curated picks and community favorites.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/movies" 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-medium flex items-center transition-colors"
              >
                Explore Movies
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Picks Section */}
      <section className="py-12 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Picks</h2>
              <p className="text-gray-400 mt-1">Curated selections from our editors.</p>
            </div>
            <Link 
              href="/movies" 
              className="text-blue-500 hover:text-blue-400 font-medium flex items-center"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {isLoadingAdmin ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-400">Loading featured picks...</p>
            </div>
          ) : adminError ? (
            <div className="bg-red-900/50 p-4 rounded-md text-red-300">
              {adminError}
            </div>
          ) : adminMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No featured picks available yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {adminMovies.map((movie, index) => (
                <MovieCard 
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  director={movie.director}
                  year={movie.year}
                  poster={movie.poster}
                  rating={movie.rating}
                  badge={index === 0 ? "New Release" : index === 2 ? "Staff Pick" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Spotlight */}
      <section className="py-12 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Community Spotlight</h2>
              <p className="text-gray-400 mt-1">Latest ratings from our community members.</p>
            </div>
            <Link 
              href="/community-ratings" 
              className="text-blue-500 hover:text-blue-400 font-medium flex items-center"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="mb-6 flex overflow-x-auto space-x-2 pb-2">
            <button 
              onClick={() => setActiveTab("community")} 
              className={`px-4 py-2 rounded-md flex items-center whitespace-nowrap ${
                activeTab === "community" 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-800/30 text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Community
            </button>
            <button 
              onClick={() => setActiveTab("trending")} 
              className={`px-4 py-2 rounded-md flex items-center whitespace-nowrap ${
                activeTab === "trending" 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-800/30 text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Trending
            </button>
            <button 
              onClick={() => setActiveTab("recent")} 
              className={`px-4 py-2 rounded-md flex items-center whitespace-nowrap ${
                activeTab === "recent" 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-800/30 text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Recent
            </button>
            <button 
              onClick={() => setActiveTab("awards")} 
              className={`px-4 py-2 rounded-md flex items-center whitespace-nowrap ${
                activeTab === "awards" 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-800/30 text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Awards
            </button>
          </div>
          
          {isLoadingCommunity ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-400">Loading community ratings...</p>
            </div>
          ) : communityError ? (
            <div className="bg-red-900/50 p-4 rounded-md text-red-300">
              {communityError}
            </div>
          ) : communityMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No community ratings available yet.</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* Join the community section */}
      <section className="py-12 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3">
                <h3 className="text-xl text-blue-400 font-medium mb-2">Join the Conversation</h3>
                <h2 className="text-3xl font-bold mb-4">Become part of our community</h2>
                <p className="text-gray-300 mb-6">
                  Share your own ratings, discover hidden gems, and connect with fellow movie enthusiasts.
                </p>
                <div className="flex gap-4">
                  <Link 
                    href="/auth/signup" 
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md font-medium transition-colors"
                  >
                    Create an Account
                  </Link>
                  <Link 
                    href="/about" 
                    className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md font-medium transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="md:w-1/3 mt-8 md:mt-0 flex justify-center">
                <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
