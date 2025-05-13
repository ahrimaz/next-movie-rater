import { NextResponse } from "next/server";

// Define interfaces for TMDB API responses
interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
}

interface TMDBCreditsResponse {
  id: number;
  crew: TMDBCrewMember[];
}

// This endpoint gets detailed information about a specific movie from TMDB
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure the TMDB API key is configured
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "TMDB API key not configured" },
        { status: 500 }
      );
    }
    
    const id = params.id;
    
    // Get basic movie details
    const movieResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`,
      { next: { revalidate: 60 * 60 } } // Cache for 1 hour
    );
    
    if (!movieResponse.ok) {
      if (movieResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: "Movie not found" },
          { status: 404 }
        );
      }
      throw new Error(`TMDB API error: ${movieResponse.status}`);
    }
    
    // Get credits to extract director
    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`,
      { next: { revalidate: 60 * 60 } } // Cache for 1 hour
    );
    
    if (!creditsResponse.ok) {
      throw new Error(`TMDB API error (credits): ${creditsResponse.status}`);
    }
    
    const movieData = await movieResponse.json();
    const creditsData: TMDBCreditsResponse = await creditsResponse.json();
    
    // Find director(s) from crew
    const directors = creditsData.crew
      .filter((person: TMDBCrewMember) => person.job === 'Director')
      .map((director: TMDBCrewMember) => director.name);
    
    const posterUrl = movieData.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
      : null;
    
    const movieDetails = {
      id: movieData.id,
      title: movieData.title,
      director: directors.join(', '),
      release_year: movieData.release_date ? new Date(movieData.release_date).getFullYear() : null,
      poster_url: posterUrl,
      overview: movieData.overview,
      runtime: movieData.runtime
    };
    
    return NextResponse.json({
      success: true,
      movie: movieDetails
    });
    
  } catch (error) {
    console.error("Error fetching movie details from TMDB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get movie details" },
      { status: 500 }
    );
  }
} 