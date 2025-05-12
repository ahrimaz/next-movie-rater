import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

interface ExtendedUser {
  isAdmin?: boolean;
  [key: string]: unknown;
}

// GET /api/movies/[id] - Get a single movie
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const movie = await prisma.movie.findUnique({
      where: { id }
    });
    
    if (!movie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch movie" },
      { status: 500 }
    );
  }
}

// PUT /api/movies/[id] - Update a movie (protected)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || !(session.user as ExtendedUser).isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id }
    });
    
    if (!existingMovie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (body.rating !== undefined && (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Invalid rating" },
        { status: 400 }
      );
    }
    
    const movie = await prisma.movie.update({
      where: { id },
      data: {
        title: body.title || undefined,
        director: body.director !== undefined ? body.director || null : undefined,
        year: body.year !== undefined ? (body.year ? parseInt(body.year) : null) : undefined,
        poster: body.poster !== undefined ? body.poster || null : undefined,
        rating: body.rating || undefined,
        review: body.review !== undefined ? body.review || null : undefined,
      }
    });
    
    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    console.error("Error updating movie:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update movie" },
      { status: 500 }
    );
  }
}

// DELETE /api/movies/[id] - Delete a movie (protected)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || !(session.user as ExtendedUser).isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id }
    });
    
    if (!existingMovie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }
    
    await prisma.movie.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting movie:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete movie" },
      { status: 500 }
    );
  }
} 