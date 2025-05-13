import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ensureUsernames } from "@/lib/username";
import { authOptions } from "@/lib/auth";

interface ExtendedUser {
  isAdmin?: boolean;
  [key: string]: unknown;
}

// POST /api/generate-usernames - Generate usernames for all users without one (admin only)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || !(session.user as ExtendedUser).isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Generate usernames for all users who don't have one
    await ensureUsernames();
    
    return NextResponse.json({ 
      success: true, 
      message: "Usernames generated successfully" 
    });
  } catch (error) {
    console.error("Error generating usernames:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate usernames" },
      { status: 500 }
    );
  }
} 