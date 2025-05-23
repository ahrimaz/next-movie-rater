import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// TODO: Replace with actual authentication - this is a placeholder
async function getCurrentUserId(): Promise<string | null> {
  // In a real app, you'd get this from the session or a token
  // For now, returning a hardcoded ID for testing purposes
  return "clxrz45670000abcdef12345"; // Ensure this ID exists in your User table
}

interface RouteContext {
  params: {
    listId: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { listId } = params;
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { movieId } = await req.json();

    if (!movieId) {
      return NextResponse.json({ success: false, error: 'Movie ID is required' }, { status: 400 });
    }

    // Check if the list exists and belongs to the user
    const list = await prisma.movieList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return NextResponse.json({ success: false, error: 'Movie list not found' }, { status: 404 });
    }

    if (list.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Check if the movie exists
    const movie = await prisma.movie.findUnique({
        where: { id: movieId }
    });
    if (!movie) {
        return NextResponse.json({ success: false, error: 'Movie not found' }, { status: 404 });
    }

    // Check if the movie is already in the list
    const existingItem = await prisma.movieListItem.findFirst({
      where: {
        movieListId: listId,
        movieId: movieId,
      },
    });

    if (existingItem) {
      return NextResponse.json({ success: false, error: 'Movie already in list' }, { status: 409 }); // 409 Conflict
    }

    const newListItem = await prisma.movieListItem.create({
      data: {
        movieListId: listId,
        movieId: movieId,
      },
      include: { // Optionally include the movie details in the response
        movie: true,
      }
    });

    return NextResponse.json({ success: true, data: newListItem }, { status: 201 });
  } catch (error) {
    console.error(`Error adding movie to list ${params.listId}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
