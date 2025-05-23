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

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { listId } = params;

    const list = await prisma.movieList.findUnique({
      where: { id: listId },
      include: {
        movies: { // This is the relation to MovieListItem
          include: {
            movie: true, // Include the actual Movie details for each item
          },
          orderBy: {
            addedAt: 'asc', // Optional: order movies by when they were added
          }
        },
      },
    });

    if (!list) {
      return NextResponse.json({ success: false, error: 'Movie list not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error(`Error fetching movie list ${params.listId}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { listId } = params;
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name && description === undefined) {
      return NextResponse.json({ success: false, error: 'Name or description must be provided' }, { status: 400 });
    }

    const list = await prisma.movieList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return NextResponse.json({ success: false, error: 'Movie list not found' }, { status: 404 });
    }

    if (list.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updatedList = await prisma.movieList.update({
      where: { id: listId },
      data: {
        name: name || list.name,
        description: description !== undefined ? description : list.description,
      },
    });

    return NextResponse.json({ success: true, data: updatedList });
  } catch (error) {
    console.error(`Error updating movie list ${params.listId}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { listId } = params;
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const list = await prisma.movieList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return NextResponse.json({ success: false, error: 'Movie list not found' }, { status: 404 });
    }

    if (list.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Assuming Prisma schema is set up for cascading delete for MovieListItems
    // If not, manual deletion of MovieListItems would be required here first.
    // e.g., await prisma.movieListItem.deleteMany({ where: { movieListId: listId } });
    await prisma.movieList.delete({
      where: { id: listId },
    });

    return NextResponse.json({ success: true, message: 'Movie list deleted successfully' });
  } catch (error) {
    console.error(`Error deleting movie list ${params.listId}:`, error);
    // Check for specific Prisma error for related records if cascade isn't set up
    if ((error as any).code === 'P2014' || (error as any).code === 'P2003' ) { // Foreign key constraint failed
        return NextResponse.json({ success: false, error: 'Cannot delete list with movies. Ensure items are removed or cascade delete is configured.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
