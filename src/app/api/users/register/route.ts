import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { generateUsername } from "@/lib/username";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 } // Conflict
      );
    }

    // Generate a username from the name
    const username = await generateUsername(name, email);

    // Hash the password
    const passwordHash = await hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        username, // Add the generated username
        passwordHash,
        isAdmin: false, // Ensure new users are not admins
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true, // Include username in the response
        isAdmin: true,
        createdAt: true,
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        } 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 }
    );
  }
} 