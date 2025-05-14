import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import authOptions from "@/lib/auth";

const prisma = new PrismaClient();

// Extended user type for session
interface ExtendedUser {
  id?: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

// GET /api/movies - Get all movies or filtered by userId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isAdminParam = searchParams.get("isAdmin");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : undefined;
    
    let movies;
    
    // Filter by userId if provided
    if (userId) {
      movies = await prisma.movie.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              isAdmin: true
            }
          }
        },
        ...(limit && { take: limit })
      });
    } 
    // Only show admin movies if isAdmin=true
    else if (isAdminParam === "true") {
      const adminUsers = await prisma.user.findMany({
        where: {
          isAdmin: true
        }
      });
      
      const adminUserIds = adminUsers.map(user => user.id);
      
      movies = await prisma.movie.findMany({
        where: {
          userId: {
            in: adminUserIds
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              isAdmin: true
            }
          }
        },
        ...(limit && { take: limit })
      });
    }
    // Only show non-admin (community) movies if isAdmin=false
    else if (isAdminParam === "false") {
      const adminUsers = await prisma.user.findMany({
        where: {
          isAdmin: true
        }
      });
      
      const adminUserIds = adminUsers.map(user => user.id);
      
      movies = await prisma.movie.findMany({
        where: {
          userId: {
            notIn: adminUserIds
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              isAdmin: true
            }
          }
        },
        ...(limit && { take: limit })
      });
    }
    // Otherwise, get all movies
    else {
      movies = await prisma.movie.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              isAdmin: true
            }
          }
        },
        ...(limit && { take: limit })
      });
    }
    
    return NextResponse.json({ success: true, data: movies });
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

// POST /api/movies - Create a new movie
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
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
        userId: session.user.id, // Associate movie with current user
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