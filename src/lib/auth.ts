import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        
        console.log("Auth: Checking credentials against env vars");
        console.log("Auth: ADMIN_EMAIL env var exists:", !!process.env.ADMIN_EMAIL);
        console.log("Auth: ADMIN_PASSWORD env var exists:", !!process.env.ADMIN_PASSWORD);
        
        // This is a simplified example
        // In a real app, you would check against your database
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          console.log("Auth: Credentials match, returning admin user");
          return {
            id: "1",
            name: "Site Owner",
            email: credentials.email,
            isAdmin: true,
          } as ExtendedUser;
        }
        
        console.log("Auth: Invalid credentials");
        return null;
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
        token.isAdmin = (user as ExtendedUser).isAdmin;
        console.log("Auth: Setting isAdmin in token");
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Auth: Session callback called");
      if (session.user) {
        (session as ExtendedSession).user!.isAdmin = token.isAdmin as boolean | undefined;
        console.log("Auth: Setting isAdmin in session");
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: true, // Enable debug mode for NextAuth.js
};

export default authOptions; 