import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Interface for extended session
interface ExtendedSession {
  user?: {
    id?: string;
    isAdmin?: boolean;
    [key: string]: unknown;
  };
}

// Interface for profile update request
interface ProfileUpdateRequest {
  name?: string;
  bio?: string;
  profileImage?: string;
  themeColor?: string;
  isProfilePublic?: boolean;
  favoriteGenres?: string[];
}

// PUT /api/users/profile - Update current user's profile
export async function PUT(request: Request) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions) as ExtendedSession;
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({
        success: false,
        error: "You must be logged in to access this endpoint",
      }, { status: 401 });
    }
    
    // Parse the request body
    const body: ProfileUpdateRequest = await request.json();
    
    // Validate the request data
    if (body.favoriteGenres && body.favoriteGenres.length > 5) {
      return NextResponse.json({
        success: false,
        error: "You can select up to 5 favorite genres",
      }, { status: 400 });
    }
    
    // Validate profile image URL if provided
    if (body.profileImage && !isValidUrl(body.profileImage)) {
      return NextResponse.json({
        success: false,
        error: "Invalid profile image URL",
      }, { status: 400 });
    }
    
    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: body.name,
        bio: body.bio,
        profileImage: body.profileImage,
        themeColor: body.themeColor,
        isProfilePublic: body.isProfilePublic,
        favoriteGenres: body.favoriteGenres,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        themeColor: updatedUser.themeColor,
        isProfilePublic: updatedUser.isProfilePublic,
        favoriteGenres: updatedUser.favoriteGenres,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update profile",
    }, { status: 500 });
  }
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
} 