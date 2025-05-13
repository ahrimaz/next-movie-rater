import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// This is a temporary endpoint to seed the database
// DELETE THIS FILE IN PRODUCTION
export async function GET() {
  try {
    // Check if we already have movies in the database
    const count = await prisma.movie.count();
    
    if (count > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Database already has movies. No movies added." 
      });
    }
    
    // Create or find admin user
    let adminUser = await prisma.user.findFirst({
      where: { email: "eric.stanard@gmail.com" }
    });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: "Admin User",
          email: "eric.stanard@gmail.com",
          isAdmin: true,
        }
      });
    }
    
    // Sample movie data
    const movies = [
      { 
        title: 'Inception', 
        director: 'Christopher Nolan', 
        year: 2010, 
        rating: 5,
        review: 'A mind-bending thriller about dream invasion. The concept of planting ideas in someone\'s mind through their dreams is brilliantly executed.',
        userId: adminUser.id
      },
      { 
        title: 'The Godfather', 
        director: 'Francis Ford Coppola', 
        year: 1972, 
        rating: 5,
        review: 'A cinematic masterpiece that revolutionized gangster films. The performances, particularly by Marlon Brando and Al Pacino, are legendary.',
        userId: adminUser.id
      },
      { 
        title: 'Pulp Fiction', 
        director: 'Quentin Tarantino', 
        year: 1994, 
        rating: 4,
        review: 'A nonlinear narrative that redefined filmmaking in the 90s. The dialogue is sharp and witty, and the characters are unforgettable.',
        userId: adminUser.id
      },
      { 
        title: 'The Dark Knight', 
        director: 'Christopher Nolan', 
        year: 2008, 
        rating: 5,
        review: 'An exceptional superhero film that transcends the genre. Heath Ledger\'s performance as the Joker is iconic.',
        userId: adminUser.id
      },
      { 
        title: 'Fight Club', 
        director: 'David Fincher', 
        year: 1999, 
        rating: 4,
        review: 'A psychological thriller with a twist that changes everything. The commentary on consumerism and masculinity remains relevant.',
        userId: adminUser.id
      },
    ];
    
    // Insert all movies
    await prisma.movie.createMany({
      data: movies
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${movies.length} sample movies to the database.` 
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
} 