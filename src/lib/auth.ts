import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

// Extend the user type
interface ExtendedUser {
  id: string;
  name?: string;
  email?: string;
  isAdmin: boolean;
}

// Extend the session type
interface ExtendedSession {
  user?: {
    id?: string;
    isAdmin?: boolean;
    [key: string]: unknown;
  };
}

// This is a simplified auth setup
// In a real app, you would use proper password hashing and database integration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth: authorize function called");
        // Handle case where credentials might be undefined
        if (!credentials?.email || !credentials?.password) {
          console.log("Auth: Missing credentials");
          return null;
        }
        
        try {
          // First, check if it's the admin credentials from env vars
          if (
            process.env.ADMIN_EMAIL &&
            process.env.ADMIN_PASSWORD &&
            credentials.email === process.env.ADMIN_EMAIL &&
            credentials.password === process.env.ADMIN_PASSWORD
          ) {
            console.log("Auth: Admin credentials match from env vars");
            
            // Find or create the admin user in the database
            let adminUser = await prisma.user.findUnique({
              where: { email: credentials.email }
            });
            
            if (!adminUser) {
              adminUser = await prisma.user.create({
                data: {
                  email: credentials.email,
                  name: "Site Owner",
                  isAdmin: true,
                }
              });
              console.log("Auth: Created admin user in database");
            }
            
            return {
              id: adminUser.id,
              name: adminUser.name || "Site Owner",
              email: adminUser.email,
              isAdmin: true,
            } as ExtendedUser;
          }
          
          // If not admin, look for regular user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          if (!user) {
            console.log("Auth: User not found in database");
            return null;
          }
          
          // Handle case where user was created directly through DB (no passwordHash)
          if (!user.passwordHash) {
            console.log("Auth: User has no password hash");
            return null;
          }
          
          // Verify password with bcrypt
          const isValidPassword = await compare(credentials.password, user.passwordHash);
          
          if (!isValidPassword) {
            console.log("Auth: Invalid password for user");
            return null;
          }
          
          console.log("Auth: User authenticated successfully");
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          } as ExtendedUser;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("Auth: JWT callback called");
      if (user) {
        token.id = (user as ExtendedUser).id;
        token.isAdmin = (user as ExtendedUser).isAdmin;
        console.log("Auth: Setting user id and isAdmin in token");
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Auth: Session callback called");
      if (session.user) {
        (session as ExtendedSession).user!.id = token.id as string;
        (session as ExtendedSession).user!.isAdmin = token.isAdmin as boolean | undefined;
        console.log("Auth: Setting user id and isAdmin in session");
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // NextAuth doesn't have a built-in signUp page configuration
    // We'll handle that with a separate route
    error: "/auth/error",
  },
  debug: true, // Enable debug mode for NextAuth.js
};

export default authOptions; 