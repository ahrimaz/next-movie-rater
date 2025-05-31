import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

interface ExtendedUser {
  id?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

// PATCH /api/movies/[id]/favorite - Toggle favorite status
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id },
      include: { 
        user: {
          select: { id: true }
        } 
      }
    });
    
    if (!existingMovie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized (only the owner can favorite/unfavorite their movies)
    const currentUser = session.user as ExtendedUser;
    const isOwner = currentUser.id === existingMovie.user.id;
    
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "You can only favorite your own movies" },
        { status: 403 }
      );
    }
    
    const newFavoriteStatus = !existingMovie.isFavorite;
    
    // If trying to set as favorite, check limit
    if (newFavoriteStatus) {
      const currentFavoriteCount = await prisma.movie.count({
        where: {
          userId: existingMovie.userId,
          isFavorite: true
        }
      });
      
      if (currentFavoriteCount >= 4) {
        return NextResponse.json(
          { success: false, error: "You can only have up to 4 favorite movies. Remove a favorite first." },
          { status: 400 }
        );
      }
    }
    
    const movie = await prisma.movie.update({
      where: { id },
      data: {
        isFavorite: newFavoriteStatus
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: movie,
      message: newFavoriteStatus ? "Added to favorites" : "Removed from favorites"
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
} 