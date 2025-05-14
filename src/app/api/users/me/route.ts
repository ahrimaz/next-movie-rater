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

// GET /api/users/me - Get current user data
export async function GET() {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions) as ExtendedSession;
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({
        success: false,
        error: "You must be logged in to access this endpoint",
      }, { status: 401 });
    }
    
    // Get user from the database with all profile fields
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      }, { status: 404 });
    }
    
    // Return user data without sensitive information
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        bio: user.bio,
        profileImage: user.profileImage,
        themeColor: user.themeColor,
        isProfilePublic: user.isProfilePublic,
        favoriteGenres: user.favoriteGenres,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch user data",
    }, { status: 500 });
  }
} 