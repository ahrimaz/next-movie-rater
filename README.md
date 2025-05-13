This is a Next.JS project.

The aim of the project is to act a simple website with which I can rate movies.

Only I, the owner, should be able to login to the site.

Ratings should be viewable by any visitors.
Visitors will not be able to post comments or sign up for their own account.

The primary page will be the homepage, that will display the latest ratings.

## Project Structure

```
next-movie-rater/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Homepage - displays latest ratings
│   │   ├── layout.tsx                # Root layout
│   │   ├── admin/                    # Admin section (protected)
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── add/page.tsx          # Add new movie rating
│   │   │   └── edit/[id]/page.tsx    # Edit existing rating
│   │   ├── movies/                   # Public movie ratings
│   │   │   ├── page.tsx              # All movies list
│   │   │   └── [id]/page.tsx         # Single movie details
│   │   └── api/                      # API routes
│   │       ├── auth/[...nextauth]/route.ts  # Auth endpoints
│   │       ├── movies/route.ts       # Movie data endpoints
│   │       └── tmdb/                 # TMDB API integration
│   │           ├── search/route.ts   # Search movies on TMDB
│   │           └── movie/[id]/route.ts # Get movie details from TMDB
│   ├── components/                   # Reusable components
│   │   ├── MovieCard.tsx             # Movie card component
│   │   ├── RatingStars.tsx           # Star rating component
│   │   ├── Header.tsx                # Site header
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
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  isAdmin     Boolean  @default(false)
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

2. **Admin Only**
   - Secure login
   - Add new movie ratings
   - Edit existing ratings
   - Delete ratings
   - Search for movies using TMDB API

## Implementation Plan

1. Setup database with Prisma
2. Implement authentication with NextAuth.js
3. Create core components and layouts
4. Build movie list and detail pages
5. Implement admin functionality
6. Add sorting and filtering
7. Polish UI/UX
8. Integrate with TMDB API for movie data

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