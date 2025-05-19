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
  id?: string;
  username?: string;
}

export default function Header({ showAdminLink = true }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const user = session?.user as ExtendedUser;
  const isAdmin = user?.isAdmin;
  const isAuthenticated = status === "authenticated";
  const userProfilePath = user?.username ? `/profiles/${user.username}` : user?.id ? `/profiles/${user.id}` : "#";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-950 py-4 px-4 sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              MR
            </div>
            <span className="text-xl font-bold text-blue-500">Movie Rater</span>
          </Link>
        </div>

        <nav className="relative">
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/movies" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Admin Ratings
            </Link>
            
            <Link 
              href="/community-ratings" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Community Ratings
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && showAdminLink && (
                  <Link 
                    href="/admin" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Admin
                  </Link>
                )}
                
                {!isAdmin && (
                  <Link 
                    href="/user" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    My Ratings
                  </Link>
                )}
                
                <button
                  onClick={toggleMenu}
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
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
                  <div className="absolute right-0 mt-2 top-full w-48 bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-700">
                    <Link
                      href={userProfilePath}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View My Profile
                    </Link>
                    
                    <Link
                      href="/user/settings/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    
                    <Link
                      href="/user/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    
                    {isAdmin ? (
                      <Link
                        href="/admin/add"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Add New Rating
                      </Link>
                    ) : (
                      <Link
                        href="/user/add"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
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
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button className="md:hidden text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
} 