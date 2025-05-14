"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User } from "@/types";

export default function Settings() {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main className="my-8">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading settings...</p>
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
            You need to be logged in to access this page. Please <Link href="/auth/signin" className="underline font-medium">sign in</Link> first.
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Settings Card */}
          <Link 
            href="/user/settings/profile"
            className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
            <p className="text-gray-600 mb-4">
              Update your personal information, bio, and profile visibility
            </p>
            <span className="text-blue-600 font-medium">Edit Profile →</span>
          </Link>
          
          {/* Account Settings Card */}
          <Link 
            href="/user/settings/account"
            className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
            <p className="text-gray-600 mb-4">
              Manage your account details, email, and password
            </p>
            <span className="text-blue-600 font-medium">Edit Account →</span>
          </Link>
          
          {/* Movie Preferences Card */}
          <Link 
            href="/user/settings/preferences"
            className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Movie Preferences</h2>
            <p className="text-gray-600 mb-4">
              Set your default movie rating preferences and display options
            </p>
            <span className="text-blue-600 font-medium">Edit Preferences →</span>
          </Link>
        </div>
        
        {/* View Public Profile */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-2">Your Public Profile</h2>
          <p className="text-gray-600 mb-4">
            View your public profile as others see it
          </p>
          <Link 
            href={`/profiles/${user.username || user.id}`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Public Profile
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 