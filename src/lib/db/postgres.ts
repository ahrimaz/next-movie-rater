import { sql } from '@vercel/postgres';
import { PrismaClient } from '@prisma/client';

// Initialize PrismaClient for more complex interactions
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connect_timeout=15&pool_timeout=15'
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Use Vercel Postgres directly for simpler queries
export async function executeQuery(query: string, values: unknown[] = []) {
  try {
    const result = await sql.query(query, values);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Example function to get all movies
export async function getAllMovies() {
  try {
    return await prisma.movie.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

// Example function to get a movie by ID
export async function getMovieById(id: string) {
  try {
    return await prisma.movie.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    return null;
  }
} 