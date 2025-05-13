"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function GenerateUsernamesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Handle username generation
  const handleGenerateUsernames = async () => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/generate-usernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.success 
          ? "Usernames generated successfully for all users." 
          : (data.error || "Failed to generate usernames")
      });
    } catch (err) {
      console.error("Error generating usernames:", err);
      setResult({
        success: false,
        message: "An error occurred while generating usernames."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // If not admin, redirect
  if (status === "loading") {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Header />
        <main className="py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // @ts-expect-error - safe to ignore as we're checking for admin status
  if (status !== "authenticated" || !session?.user?.isAdmin) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />
      
      <main className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Usernames</h1>
          <p className="text-gray-600">
            This utility will generate usernames for all users who don&apos;t have one yet.
            Usernames will be based on either the user&apos;s name or email address.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <button
            onClick={handleGenerateUsernames}
            disabled={isGenerating}
            className={`px-4 py-2 rounded text-white ${
              isGenerating ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate Usernames"}
          </button>
          
          {result && (
            <div className={`mt-4 p-3 rounded ${
              result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}>
              {result.message}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 