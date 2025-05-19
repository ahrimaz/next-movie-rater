"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state if sign-in takes more than 15 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        console.log("Sign-in timeout reached, resetting loading state");
        setIsLoading(false);
        setErrorMessage("Sign-in request timed out. Please check your Vercel environment variables and try again.");
      }, 15000); // 15 second timeout
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    console.log("Sign-in attempt started");

    try {
      console.log("Calling NextAuth signIn");
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      console.log("Sign-in result:", result);

      if (result?.error) {
        console.log("Sign-in error:", result.error);
        setErrorMessage("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // After successful sign-in, retrieve the session to check if user is admin
      console.log("Sign-in successful, fetching user session");
      
      // We need to refresh the page to get the updated session with user data
      // Then the app layout will handle redirect based on user role
      console.log("Redirecting to homepage");
      router.push("/");
      
    } catch (error) {
      console.error("Authentication error:", error);
      setErrorMessage("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header showAdminLink={false} />
      
      <div className="max-w-5xl mx-auto py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Sign In</h1>
              <p className="text-gray-400 mt-2">Sign in to access your account</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3 bg-red-900/50 text-red-300 rounded-md border border-red-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-2">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Create an account
                </Link>
              </p>
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 