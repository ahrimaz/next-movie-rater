"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic validation
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    // Validate name format if provided
    if (name) {
      // Name should be at least 3 characters and contain no invalid special characters
      if (name.length < 3) {
        setErrorMessage("Name must be at least 3 characters");
        return;
      }
      
      const namePattern = /^[a-zA-Z0-9_\-\. ]+$/;
      if (!namePattern.test(name)) {
        setErrorMessage("Name can only contain letters, numbers, spaces, and characters: _ - .");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Call our API endpoint to create a user
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      // If registration is successful, sign in the user
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.error("Sign-in after registration failed:", result.error);
        setErrorMessage("Registration successful, but sign-in failed. Please try signing in manually.");
        router.push("/auth/signin");
        return;
      }

      // Redirect to user dashboard
      router.push("/user");
    } catch (error: unknown) {
      console.error("Registration error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Registration failed. Please try again."
      );
    } finally {
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
              <h1 className="text-3xl font-bold text-white">Create an Account</h1>
              <p className="text-gray-400 mt-2">Join our movie community</p>
            </div>
            
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-900/50 text-red-300 rounded-md border border-red-800">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Name/Username
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Your name"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will be used for your profile URL (e.g., /profiles/yourname)
                </p>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 hover:underline">
                  Sign In
                </Link>
              </p>
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white inline-block mt-2"
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