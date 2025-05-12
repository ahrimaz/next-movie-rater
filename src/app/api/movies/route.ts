import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET /api/movies - Get all movies
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const sort = url.searchParams.get('sort');
    
    let orderBy: any = { createdAt: 'desc' };
    
    // Handle different sort options
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'title') {
      orderBy = { title: 'asc' };
    }
    
    const movies = await prisma.movie.findMany({
      orderBy,
      ...(limit ? { take: parseInt(limit) } : {})
    });
    
    return NextResponse.json({ success: true, data: movies });
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

// POST /api/movies - Create a new movie (protected)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Basic validation
    if (!body.title || typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: "Invalid movie data" },
        { status: 400 }
      );
    }
    
    const movie = await prisma.movie.create({
      data: {
        title: body.title,
        director: body.director || null,
        year: body.year ? parseInt(body.year) : null,
        poster: body.poster || null,
        rating: body.rating,
        review: body.review || null,
      }
    });
    
    return NextResponse.json({ success: true, data: movie }, { status: 201 });
  } catch (error) {
    console.error("Error creating movie:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create movie" },
      { status: 500 }
    );
  }
} 