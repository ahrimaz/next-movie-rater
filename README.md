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
│   │       └── movies/route.ts       # Movie data endpoints
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

## Implementation Plan

1. Setup database with Prisma
2. Implement authentication with NextAuth.js
3. Create core components and layouts
4. Build movie list and detail pages
5. Implement admin functionality
6. Add sorting and filtering
7. Polish UI/UX

## Required Dependencies

```bash
# Database
npm install prisma @prisma/client

# Authentication
npm install next-auth

# UI Components
npm install react-icons
```