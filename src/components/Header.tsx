"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

interface HeaderProps {
  showAdminLink?: boolean;
}

// Extend the Session user type
interface ExtendedUser {
  isAdmin?: boolean;
  name?: string | null;
  email?: string | null;
}

export default function Header({ showAdminLink = true }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = (session?.user as ExtendedUser)?.isAdmin;
  const isAuthenticated = status === "authenticated";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b mb-8 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Movie Rater
          </Link>
        </div>

        <nav className="relative">
          <div className="flex items-center space-x-4">
            <Link href="/movies" className="text-gray-700 hover:text-blue-600">
              All Movies
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && showAdminLink && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                    Admin
                  </Link>
                )}
                
                {!isAdmin && (
                  <Link href="/user" className="text-gray-700 hover:text-blue-600">
                    My Ratings
                  </Link>
                )}
                
                <button
                  onClick={toggleMenu}
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  {session.user?.name || session.user?.email || "Account"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`ml-1 h-4 w-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 top-full w-48 bg-white rounded-md shadow-lg z-10 py-1">
                    {isAdmin ? (
                      <Link
                        href="/admin/add"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Add New Rating
                      </Link>
                    ) : (
                      <Link
                        href="/user/add"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Add New Rating
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
} 