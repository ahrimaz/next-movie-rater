# Next Movie Rater

A Next.js web application for rating and sharing movie reviews.

## Overview

Next Movie Rater allows users to:
- Create and share personal movie ratings
- View curated admin rating recommendations
- Browse community ratings from other users
- Manage their own movie ratings (add, edit, delete)
- Customize user profiles with bios and preferences
- Share content via user-friendly URLs

## Key Features

### User Features
- Personal movie ratings with TMDB integration
- Customizable user profiles
- Edit and delete functionality for ratings
- Shareable links with username-based URLs
- Rating statistics and visualization
- Privacy controls for profile visibility

### Community Features
- Browse all community ratings
- View featured admin picks
- Explore other users' profiles and ratings
- Social sharing for movies and profiles

### Admin Features
- Curate featured movie recommendations
- Access admin dashboard with statistics
- Generate usernames for users
- Manage site content

## Tech Stack

- **Framework**: Next.js with App Router
- **Database**: SQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **Deployment**: Vercel
- **External API**: TMDB (The Movie Database)

## Project Structure

```
next-movie-rater/
├── src/
│   ├── app/                         # Application routes
│   │   ├── page.tsx                 # Homepage
│   │   ├── admin/                   # Admin section (protected)
│   │   ├── user/                    # User-specific pages
│   │   ├── profiles/                # Public user profiles
│   │   ├── community-ratings/       # Community ratings
│   │   ├── movies/                  # Admin movie ratings
│   │   ├── auth/                    # Authentication pages
│   │   └── api/                     # API routes
│   ├── components/                  # Reusable components
│   ├── lib/                         # Library code
│   └── types/                       # TypeScript types
└── prisma/                          # Prisma ORM
    └── schema.prisma                # Database schema
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
  id            String    @id @default(cuid())
  email         String    @unique
  username      String?   @unique   // Username for profile URLs
  name          String?
  passwordHash  String?   // Store hashed passwords
  isAdmin       Boolean   @default(false)
  movies        Movie[]   // Relation to user's movie ratings
  createdAt     DateTime  @default(now())
}
```

## API Reference

### Movies Endpoints
- `GET /api/movies` - Fetch movie ratings with filters
- `PUT /api/movies/[id]` - Update a movie rating
- `DELETE /api/movies/[id]` - Delete a movie rating

### Users Endpoints
- `GET /api/users/[userId]` - Get user profile by ID or username
- `POST /api/generate-usernames` - Admin-only username generation

### TMDB Integration
- `GET /api/tmdb/search` - Search movies on TMDB
- `GET /api/tmdb/movie/[id]` - Get movie details from TMDB

## Username System

The application uses a username system for friendly URLs:
- Automatically generated from user's name at registration
- Spaces converted to hyphens (e.g., "John Doe" becomes "john-doe")
- Alphanumeric characters plus underscores, hyphens, and periods
- 3-20 characters in length
- Unique across all users

## Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   DATABASE_URL=your_database_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   TMDB_API_KEY=your_tmdb_api_key
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## TMDB API Integration

1. Sign up at [TMDB](https://www.themoviedb.org/)
2. Request an API key (Developer option)
3. Add to `.env.local`:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

## Dependencies

```bash
# Core
npm install next react react-dom

# Database
npm install prisma @prisma/client

# Authentication
npm install next-auth

# UI Components
npm install react-icons

# Charts and Data Visualization
npm install recharts
```