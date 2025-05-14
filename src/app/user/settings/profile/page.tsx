"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User } from "@/types";

// Common genre list for selection
const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "History",
  "Horror", "Music", "Mystery", "Romance", "Science Fiction", 
  "Thriller", "War", "Western"
];

export default function ProfileSettings() {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [themeColor, setThemeColor] = useState("#0088FE");
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  
  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/users/me");
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Could not fetch user data");
        }
        
        setUser(data.data);
        
        // Initialize form with user data
        setName(data.data.name || "");
        setBio(data.data.bio || "");
        setProfileImage(data.data.profileImage || "");
        setThemeColor(data.data.themeColor || "#0088FE");
        setIsProfilePublic(data.data.isProfilePublic !== false);
        setFavoriteGenres(data.data.favoriteGenres || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          bio,
          profileImage,
          themeColor,
          isProfilePublic,
          favoriteGenres,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to update profile");
      }
      
      setSuccess("Profile updated successfully!");
      
      // Update local user state
      setUser({
        ...user,
        name,
        bio,
        profileImage,
        themeColor,
        isProfilePublic,
        favoriteGenres,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle genre toggle
  const handleGenreToggle = (genre: string) => {
    setFavoriteGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main className="my-8">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading profile settings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main className="my-8">
          <div className="bg-red-50 p-4 rounded-md text-red-500">
            You need to be logged in to access this page.
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />
      
      <main className="my-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600">Update your profile information and preferences</p>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-500 mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 p-4 rounded-md text-green-600 mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Tell others about yourself and your movie preferences..."
                />
              </div>
            </div>
          </section>
          
          {/* Profile Customization */}
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Profile Customization</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  id="profileImage"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://example.com/your-image.jpg"
                />
                
                {/* Profile image preview */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profileImage ? (
                      <Image 
                        src={profileImage} 
                        alt="Profile preview"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-3xl text-gray-400">
                        {name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="themeColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Theme Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="themeColor"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-10 w-20 border-0"
                  />
                  <span className="ml-2 text-gray-600">{themeColor}</span>
                </div>
              </div>
            </div>
          </section>
          
          {/* Privacy Settings */}
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isProfilePublic}
                  onChange={() => setIsProfilePublic(!isProfilePublic)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">Make my profile public</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 pl-6">
                When off, other users won&apos;t be able to view your profile
              </p>
            </div>
          </section>
          
          {/* Favorite Genres */}
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Favorite Genres</h2>
            <p className="text-gray-600 text-sm mb-4">Select up to 5 favorite movie genres to display on your profile</p>
            
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(genre => (
                <label key={genre} className={`
                  px-3 py-2 rounded-full text-sm cursor-pointer transition-colors duration-200
                  ${favoriteGenres.includes(genre) 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}
                  ${favoriteGenres.length >= 5 && !favoriteGenres.includes(genre) ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={favoriteGenres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    disabled={favoriteGenres.length >= 5 && !favoriteGenres.includes(genre)}
                  />
                  {genre}
                </label>
              ))}
            </div>
          </section>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`
                px-6 py-2 rounded-md text-white font-medium
                ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
} 