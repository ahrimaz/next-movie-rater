"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication";

  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password. Please try again.";
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to access this resource.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">{errorMessage}</p>
        
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
} 