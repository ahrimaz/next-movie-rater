import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// TODO: Replace with actual authentication - this is a placeholder
async function getCurrentUserId(): Promise<string | null> {
  // In a real app, you'd get this from the session or a token
  // For now, returning a hardcoded ID for testing purposes
  // Ensure this user ID exists in your User table if you're testing relations
  return "clxrz45670000abcdef12345"; // Replace with a valid ID from your DB
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const newList = await prisma.movieList.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: newList }, { status: 201 });
  } catch (error) {
    console.error('Error creating movie list:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      // Attempt to get the current authenticated user's ID if no userId query param is provided
      const currentAuthUserId = await getCurrentUserId();
      if (!currentAuthUserId) {
        return NextResponse.json({ success: false, error: 'User ID is required or unauthorized' }, { status: 400 });
      }
      // Fetch lists for the authenticated user
      const lists = await prisma.movieList.findMany({
        where: { userId: currentAuthUserId },
      });
      return NextResponse.json({ success: true, data: lists });
    }

    // Fetch lists for the userId provided in the query parameter
    const lists = await prisma.movieList.findMany({
      where: { userId },
    });

    return NextResponse.json({ success: true, data: lists });
  } catch (error) {
    console.error('Error fetching movie lists:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
