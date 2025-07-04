"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import { Movie } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Extend the Session user type
interface ExtendedUser {
  isAdmin?: boolean;
  name?: string | null;
  email?: string | null;
  id?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<Partial<Movie>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }
    
    if (status === "authenticated" && !(session?.user as ExtendedUser)?.isAdmin) {
      console.log("Non-admin user attempted to access admin page, redirecting to homepage");
      router.push("/");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (status !== "authenticated" || !(session?.user as ExtendedUser)?.isAdmin) return;
      
      try {
        setIsLoading(true);
        const response = await fetch("/api/movies?isAdmin=true");
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
  }, [session, status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      setDeleteId(id);
      const response = await fetch(`/api/movies/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to delete movie");
      }
      
      // Remove the movie from the list
      setMovies(movies.filter(movie => movie.id !== id));
    } catch (err) {
      console.error(`Error deleting movie ID ${id}:`, err);
      alert("Failed to delete movie. Please try again.");
    } finally {
      setDeleteId(null);
    }
  };

  // Show loading state if session is still loading
  if (status === "loading") {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header showAdminLink={false} />
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

      <main>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          
          <Link 
            href="/admin/add" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add New Movie
          </Link>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Ratings</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <div className="text-blue-600">Loading...</div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500 mb-4">
              {error}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-gray-500">No movies added yet.</p>
              <Link 
                href="/admin/add" 
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                Add your first movie
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Title</th>
                    <th className="border p-2 text-left">Year</th>
                    <th className="border p-2 text-left">Director</th>
                    <th className="border p-2 text-left">Rating</th>
                    <th className="border p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-gray-50">
                      <td className="border p-2">{movie.title}</td>
                      <td className="border p-2">{movie.year}</td>
                      <td className="border p-2">{movie.director}</td>
                      <td className="border p-2">
                        <RatingStars rating={movie.rating!} size="sm" />
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <Link 
                            href={`/admin/edit/${movie.id}`} 
                            className="text-blue-600 hover:underline px-2"
                          >
                            Edit
                          </Link>
                          <button 
                            className="text-red-600 hover:underline px-2"
                            onClick={() => handleDelete(movie.id!)}
                            disabled={deleteId === movie.id}
                          >
                            {deleteId === movie.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 