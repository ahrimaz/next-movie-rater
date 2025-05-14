This is a Next.JS project.

The aim of the project is to act as a simple website for rating movies.

The site allows:
- Admin ratings (displayed on the homepage)
- User registration and user-specific ratings
- Public viewing of all admin ratings
- Shareable links for user profiles and individual movie ratings
- User-friendly URLs with usernames instead of IDs

Each user's ratings are associated with their account and displayed on their own page. Users can share their personal ratings via a shareable link using their username instead of a complex ID.

## Recent Updates

- **Username from Name**: Users' names are now automatically used as their profile username
- **User-friendly URLs**: Spaces in names are converted to hyphens in URLs (e.g., "John Doe" becomes "john-doe")
- **Homepage Update**: Homepage now shows only the latest 3 admin movie ratings with a "View All" link
- **User/Admin Separation**: Clear separation between admin ratings and user ratings
- **Navigation Clarity**: Updated navigation labels to clearly distinguish between admin and user content
- **API Enhancement**: Added limit parameter support to the movies API endpoint
- **Shareable Ratings**: Users can now share their movie ratings via direct links to their profiles
- **Social Sharing**: Added sharing functionality for individual movies and user profiles
- **Username Support**: Added usernames for more user-friendly profile URLs
- **Simplified Sharing**: Updated share button to copy links directly to clipboard
- **Admin Tools**: Added username generation tool for administrators

## Project Structure

```
next-movie-rater/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Homepage - displays admin's 3 latest ratings
│   │   ├── layout.tsx                # Root layout
│   │   ├── admin/                    # Admin section (protected)
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── add/page.tsx          # Add new movie rating
│   │   │   ├── generate-usernames/page.tsx # Admin tool to generate usernames
│   │   │   └── edit/[id]/page.tsx    # Edit existing rating
│   │   ├── user/                     # User-specific section
│   │   │   ├── page.tsx              # User's ratings page (with sharing)
│   │   │   ├── settings/page.tsx     # User account settings
│   │   │   ├── add/page.tsx          # Add new movie rating (for user)
│   │   │   └── edit/[id]/page.tsx    # Edit existing rating (for user)
│   │   ├── profiles/                 # Public user profiles
│   │   │   └── [userId]/page.tsx     # Public profile with shareable link (supports username or ID)
│   │   ├── movies/                   # Admin movie ratings
│   │   │   ├── page.tsx              # All admin movies list
│   │   │   └── [id]/page.tsx         # Single movie details (with sharing)
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── signin/page.tsx       # Sign in page
│   │   │   └── signup/page.tsx       # Sign up page
│   │   └── api/                      # API routes
│   │       ├── auth/[...nextauth]/route.ts  # Auth endpoints
│   │       ├── movies/route.ts       # Movie data endpoints (with limit support)
│   │       ├── users/route.ts        # User-related endpoints
│   │       ├── users/[userId]/route.ts # Get public user profile by ID or username
│   │       ├── generate-usernames/route.ts # Generate usernames for users
│   │       └── tmdb/                 # TMDB API integration
│   │           ├── search/route.ts   # Search movies on TMDB
│   │           └── movie/[id]/route.ts # Get movie details from TMDB
│   ├── components/                   # Reusable components
│   │   ├── MovieCard.tsx             # Movie card component
│   │   ├── RatingStars.tsx           # Star rating component
│   │   ├── Header.tsx                # Site header with clearer navigation labels
│   │   ├── UserMenu.tsx              # User dropdown menu
│   │   ├── ShareButton.tsx           # Reusable clipboard sharing component
│   │   ├── AuthForms.tsx             # Sign in/up forms
│   │   └── Footer.tsx                # Site footer
│   ├── lib/                          # Library code
│   │   ├── db.ts                     # Database client
│   │   ├── auth.ts                   # Authentication utilities
│   │   └── username.ts               # Username generation and lookup utilities
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

## Tech Stack

- **Framework**: Next.js with App Router
- **Database**: SQL database with Prisma ORM
- **Authentication**: NextAuth.js with email/password
- **Styling**: TailwindCSS
- **Deployment**: Vercel
- **External API**: TMDB (The Movie Database) for movie information

## Core Features

1. **Public**
   - View admin movie ratings (limited to 3 on homepage)
   - View full list of admin ratings
   - View single movie details
   - Sort/filter movies by rating, date, etc.
   - Register for an account
   - Browse user profiles via shareable username-based links

2. **Registered Users**
   - Sign in to personal account
   - Add new movie ratings
   - Edit/delete own ratings
   - View personal ratings page
   - Search for movies using TMDB API
   - Share profile via a username-based URL
   - Share individual movie ratings

3. **Admin Only**
   - Manage all ratings
   - Admin dashboard with statistics
   - Generate usernames for all users
   - Special admin privileges

## API Reference

### GET /api/movies
Fetches movie ratings with various filter options:

- `?userId={id}` - Filter movies by specific user ID
- `?isAdmin=true` - Return only movies created by admin users
- `?limit={number}` - Limit the number of results returned

Example: `/api/movies?isAdmin=true&limit=3` fetches the 3 most recent admin ratings

### GET /api/users/[userId]
Fetches a user's public profile information:

- Takes either a username or user ID to identify the user
- Returns user's public data (name, id, username, admin status)
- Does not include private information like email

### POST /api/generate-usernames
Admin-only endpoint to generate usernames for all users:

- Generates usernames for all users who don't have one
- Derives username from user's name or email
- Ensures uniqueness by adding numeric suffixes if needed

## Shareable Content

The application supports sharing content through unique URLs:

1. **User Profiles**: `/profiles/[usernameOrId]`
   - Uses human-readable usernames in URLs when available (e.g., `/profiles/moviefan1`)
   - Falls back to user ID if no username is set
   - Publicly viewable page showing all ratings by a specific user
   - No authentication required to view
   - Displays username with @ symbol

2. **Individual Movies**: `/movies/[id]`
   - Publicly viewable page showing details for a specific movie rating
   - Shows who created the rating with a link to their profile
   - No authentication required to view

3. **Share Features**:
   - One-click copy to clipboard functionality
   - Visual feedback when links are copied
   - Simple, intuitive interface

## Username System

The application includes a username system for more user-friendly URLs:

1. **Username Format**:
   - Alphanumeric characters, underscores, hyphens, and periods
   - 3-20 characters in length
   - Automatically created from the user's name during registration
   - Spaces in names are converted to hyphens (e.g., "John Doe" becomes "john-doe")
   - Unique across all users

2. **Username Generation**:
   - Created from the name field during user registration
   - Automatic for new users
   - Admin tool to generate for existing users
   - Handles duplicates by adding numeric suffixes
   - Converts spaces and special characters appropriately

3. **URL Support**:
   - All user profile URLs support either username or ID
   - Username-based URLs are preferred when available
   - Backwards compatible with ID-based URLs

4. **User Registration**:
   - The name field during signup is used as the base for the user's profile URL
   - Users are informed that their name will be used for their profile URL
   - Validation ensures names can be converted to valid usernames
   - Minimum of 3 characters with only allowed special characters (hyphens, underscores, periods)

## Authentication and User Registration

The application uses NextAuth.js for authentication with custom registration:

1. **User Registration**:
   - Users provide their name, email, and password
   - The name field is used to generate their public username for profile URLs
   - Names are automatically converted to URL-friendly format:
     - Spaces are replaced with hyphens
     - Special characters are removed
     - Made lowercase for consistency
   - Uniqueness is guaranteed by adding a numeric suffix if needed

2. **Login**:
   - Users can login with their email and password
   - After login, they're directed to their personal dashboard

3. **Profile Sharing**:
   - Users can share their profile using their username in the URL
   - Example: `/profiles/john-doe` instead of `/profiles/clk2x9f340000356etsgaklj2`

## Implementation Plan

1. **Update Database Schema**
   - Modify the Movie model to include a relation to the User model
   - Add a movies relation field to the User model
   - Add a username field to the User model
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
   - Update homepage queries to only display admin ratings (limited to 3)
   - Add "View All" link to the full admin ratings page
   - Ensure proper filtering of movies by admin user ID

6. **User Profile Implementation**
   - Create user profile page that displays only that user's ratings
   - Implement the same layout and functionality as the homepage
   - Add user information display

7. **UI Component Updates**
   - Update navigation labels to clearly distinguish admin vs user content
   - Create UserMenu component for the header
   - Add authentication status indicators
   - Update navigation to show appropriate links based on user role
   - Implement AuthForms component for sign-in/sign-up

8. **Add Shareable Content Features**
   - Create public profiles page for viewing user ratings
   - Update movie detail pages to include creator information
   - Add share buttons to user and movie pages
   - Implement copy-to-clipboard functionality
   - Create reusable ShareButton component

9. **Username System Implementation**
   - Add username field to User model
   - Create username generation utilities
   - Update profile URLs to use usernames
   - Ensure URL compatibility with both usernames and IDs
   - Create admin tool for generating usernames

10. **Authorization & Security**
    - Update middleware to protect routes based on user roles
    - Implement proper error handling for unauthorized access
    - Add CSRF protection for forms
    - Ensure proper validation of user input
    - Ensure sharing endpoints don't expose sensitive data

11. **Testing**
    - Test user registration flow
    - Verify proper association of movies with users
    - Test authorization boundaries between users
    - Ensure homepage only shows latest admin ratings
    - Verify user profile pages display correct ratings
    - Test sharing functionality across different devices
    - Verify username generation and URL handling

12. **Deployment & Monitoring**
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

## Username Setup for Existing Users

If you have existing users in your database, you'll need to generate usernames for them:

1. Log in as an admin user
2. Navigate to `/admin/generate-usernames`
3. Click the "Generate Usernames" button
4. All users will receive automatically generated usernames based on their name or email

After generating usernames, all profile share links will use the new username format.