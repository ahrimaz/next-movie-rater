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
    itemId: string; // This is the ID of the MovieListItem
  };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { listId, itemId } = params;
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the list exists and belongs to the user
    const list = await prisma.movieList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return NextResponse.json({ success: false, error: 'Movie list not found' }, { status: 404 });
    }

    if (list.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this list.' }, { status: 403 });
    }

    // Check if the movie list item exists
    const listItem = await prisma.movieListItem.findUnique({
      where: { id: itemId },
    });

    if (!listItem) {
      return NextResponse.json({ success: false, error: 'Movie item not found in list' }, { status: 404 });
    }

    // Ensure the item actually belongs to the specified list (important for data integrity)
    if (listItem.movieListId !== listId) {
        return NextResponse.json({ success: false, error: 'Movie item does not belong to the specified list' }, { status: 400 });
    }

    await prisma.movieListItem.delete({
      where: {
        id: itemId,
        // Optional: Could also add movieListId: listId here for extra safety,
        // but the check above and user ownership of the list should suffice.
      },
    });

    return NextResponse.json({ success: true, message: 'Movie item removed successfully' });
  } catch (error) {
    console.error(`Error removing movie item ${params.itemId} from list ${params.listId}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
