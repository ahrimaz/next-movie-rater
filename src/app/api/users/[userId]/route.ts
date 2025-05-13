import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/users/[userId] - Get a user's public profile
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        isAdmin: true,
        // Don't include email for privacy reasons
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 