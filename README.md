This is a Next.JS project.

The aim of the project is to act as a simple website for rating movies.

The site allows:
- Admin ratings (displayed on the homepage)
- User registration and user-specific ratings
- Public viewing of all ratings

Each user's ratings are associated with their account and displayed on their own page.

## Project Structure

```
next-movie-rater/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Homepage - displays admin's latest ratings
│   │   ├── layout.tsx                # Root layout
│   │   ├── admin/                    # Admin section (protected)
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── add/page.tsx          # Add new movie rating
│   │   │   └── edit/[id]/page.tsx    # Edit existing rating
│   │   ├── user/                     # User-specific section
│   │   │   ├── page.tsx              # User's ratings page
│   │   │   ├── settings/page.tsx     # User account settings
│   │   │   ├── add/page.tsx          # Add new movie rating (for user)
│   │   │   └── edit/[id]/page.tsx    # Edit existing rating (for user)
│   │   ├── movies/                   # Public movie ratings
│   │   │   ├── page.tsx              # All movies list
│   │   │   └── [id]/page.tsx         # Single movie details
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── signin/page.tsx       # Sign in page
│   │   │   └── signup/page.tsx       # Sign up page
│   │   └── api/                      # API routes
│   │       ├── auth/[...nextauth]/route.ts  # Auth endpoints
│   │       ├── movies/route.ts       # Movie data endpoints
│   │       ├── users/route.ts        # User-related endpoints
│   │       └── tmdb/                 # TMDB API integration
│   │           ├── search/route.ts   # Search movies on TMDB
│   │           └── movie/[id]/route.ts # Get movie details from TMDB
│   ├── components/                   # Reusable components
│   │   ├── MovieCard.tsx             # Movie card component
│   │   ├── RatingStars.tsx           # Star rating component
│   │   ├── Header.tsx                # Site header
│   │   ├── UserMenu.tsx              # User dropdown menu
│   │   ├── AuthForms.tsx             # Sign in/up forms
│   │   └── Footer.tsx                # Site footer
│   ├── lib/                          # Library code
│   │   ├── db.ts                     # Database client
│   │   └── auth.ts                   # Authentication utilities
│   └── types/                        # TypeScript type definitions
│       └── index.ts                  # Shared types
└── prisma/                           # Prisma ORM
    └── schema.prisma                 # Database schema
```

## Database Schema

```prisma
model Movie {
  id          String   @id @default(cuid())
  title       String
  director    String?
  year        Int?
  poster      String?  // URL to movie poster
  rating      Int      // 1-5 rating
  review      String?  // Optional review text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String   // Reference to the user who created the rating
  user        User     @relation(fields: [userId], references: [id])
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  isAdmin     Boolean  @default(false)
  movies      Movie[]  // Relation to user's movie ratings
  createdAt   DateTime @default(now())
}
```

## Tech Stack

- **Framework**: Next.js with App Router
- **Database**: SQL database with Prisma ORM
- **Authentication**: NextAuth.js with email/password
- **Styling**: TailwindCSS
- **Deployment**: Vercel
- **External API**: TMDB (The Movie Database) for movie information

## Core Features

1. **Public**
   - View all movie ratings
   - View single movie details
   - Sort/filter movies by rating, date, etc.
   - Register for an account

2. **Registered Users**
   - Sign in to personal account
   - Add new movie ratings
   - Edit/delete own ratings
   - View personal ratings page
   - Search for movies using TMDB API

3. **Admin Only**
   - Manage all ratings
   - Admin dashboard with statistics
   - Special admin privileges

## Implementation Plan

1. **Update Database Schema**
   - Modify the Movie model to include a relation to the User model
   - Add a movies relation field to the User model
   - Run migration to update the database structure
   - Update existing movie records to associate with the admin user

2. **Extend Authentication System**
   - Implement user registration functionality
   - Update NextAuth configuration to support regular user accounts
   - Add password hashing and secure storage
   - Create signup page and forms
   - Modify authorization middleware to handle user vs admin permissions

3. **Create User-Specific Pages**
   - Implement user dashboard at /user route
   - Create user movie rating pages with same layout as admin pages
   - Add user settings page for profile management
   - Ensure all user pages have proper authorization checks

4. **Update Movie Creation/Editing**
   - Modify movie creation to associate with the current logged-in user
   - Update movie editing to verify ownership before allowing changes
   - Add user-specific movie filtering in the database queries

5. **Homepage Modification**
   - Update homepage queries to only display admin ratings
   - Ensure proper filtering of movies by admin user ID

6. **User Profile Implementation**
   - Create user profile page that displays only that user's ratings
   - Implement the same layout and functionality as the homepage
   - Add user information display

7. **UI Component Updates**
   - Create UserMenu component for the header
   - Add authentication status indicators
   - Update navigation to show appropriate links based on user role
   - Implement AuthForms component for sign-in/sign-up

8. **Authorization & Security**
   - Update middleware to protect routes based on user roles
   - Implement proper error handling for unauthorized access
   - Add CSRF protection for forms
   - Ensure proper validation of user input

9. **Testing**
   - Test user registration flow
   - Verify proper association of movies with users
   - Test authorization boundaries between users
   - Ensure homepage only shows admin ratings
   - Verify user profile pages display correct ratings

10. **Deployment & Monitoring**
    - Update environment variables for production
    - Deploy updated application
    - Monitor for any authentication or database issues
    - Set up error logging for security-related events

## Required Dependencies

```bash
# Database
npm install prisma @prisma/client

# Authentication
npm install next-auth

# UI Components
npm install react-icons
```

## TMDB API Integration

This project uses The Movie Database (TMDB) API to fetch movie information when adding new ratings. To use this feature:

1. Sign up for a free account at [TMDB](https://www.themoviedb.org/)
2. Go to your account settings and navigate to the API section
3. Request an API key (choose "Developer" option)
4. Create a `.env.local` file in the project root with:
   ```
   TMDB_API_KEY=your_api_key_here
   ```
5. Restart the development server

The TMDB integration allows you to search for movies and automatically fill in details like title, director, release year, and poster image.