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
        // Handle case where credentials might be undefined
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // This is a simplified example
        // In a real app, you would check against your database
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "1",
            name: "Site Owner",
            email: credentials.email,
            isAdmin: true,
          } as ExtendedUser;
        }
        
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as ExtendedUser).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as ExtendedSession).user!.isAdmin = token.isAdmin as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default authOptions; 