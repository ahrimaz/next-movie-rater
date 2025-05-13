import { NextResponse } from "next/server";

// This endpoint searches for movies using TMDB API
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter is required" },
        { status: 400 }
      );
    }
    
    // Make sure the TMDB API key is configured
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "TMDB API key not configured" },
        { status: 500 }
      );
    }
    
    // Call TMDB API to search for movies
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.status}`);
    }
    
    const tmdbData = await tmdbResponse.json();
    
    return NextResponse.json({
      success: true,
      results: tmdbData.results.slice(0, 10) // Limit to 10 results
    });
    
  } catch (error) {
    console.error("Error searching TMDB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search for movies" },
      { status: 500 }
    );
  }
} 