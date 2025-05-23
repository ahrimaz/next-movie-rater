'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MovieList, MovieListItem, ApiResponse } from '@/types'; // Assuming MovieListItem is defined
import { PencilIcon, TrashIcon, PlusCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface MovieListDetailProps {
  listId: string;
  // TODO: Add onEditList callback, onAddMovie callback
}

const MovieListDetail: React.FC<MovieListDetailProps> = ({ listId }) => {
  const [list, setList] = useState<MovieList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/movie-lists/${listId}`);
      const result: ApiResponse<MovieList> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch movie list details');
      }
      setList(result.data || null);
    } catch (err: any) {
      console.error(`Error fetching movie list ${listId}:`, err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    if (listId) {
      fetchListDetails();
    }
  }, [listId, fetchListDetails]);

  const handleRemoveMovie = async (itemId: string, movieTitle: string) => {
    if (!list) return;
    if (window.confirm(`Are you sure you want to remove "${movieTitle}" from this list?`)) {
      try {
        const response = await fetch(`/api/movie-lists/${list.id}/movies/${itemId}`, {
          method: 'DELETE',
        });
        const result: ApiResponse<null> = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to remove movie from list');
        }
        // Refresh list details to show updated movie list
        fetchListDetails(); 
        alert(`"${movieTitle}" removed from list.`); // Placeholder
      } catch (error: any) {
        console.error('Error removing movie:', error);
        alert(`Error removing movie: ${error.message}`); // Placeholder
      }
    }
  };

  const handleAddMovie = () => {
    // TODO: Implement modal for searching and adding movies
    alert('Placeholder: Open modal to add movie to list.');
    console.log('Add movie to list button clicked for list ID:', listId);
  };
  
  const handleEditList = () => {
    // TODO: Implement modal or navigation for editing list details
    alert(`Placeholder: Edit details for list "${list?.name}"`);
    console.log('Edit list button clicked for list ID:', listId);
  };


  if (isLoading) {
    return <div className="text-center text-gray-400 py-12">Loading movie list details...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>Error loading movie list: {error}</p>
        <button 
          onClick={fetchListDetails}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!list) {
    return <div className="text-center text-gray-500 py-12">Movie list not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-[var(--border-dark)]"> {/* Use var for border */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-blue)]">{list.name}</h1> {/* Use var for text color */}
            {list.description && (
              <p className="text-gray-400 mt-2 text-sm md:text-base">{list.description}</p>
            )}
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleEditList}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 hover:text-[var(--primary-blue)] transition-colors" /* Use var for hover text */
              title="Edit list details"
            >
              <PencilIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={handleAddMovie}
              className="p-2 bg-[var(--primary-blue)] hover:bg-[var(--primary-hover)] rounded-full text-white transition-colors" /* Use var for bg */
              title="Add movie to list"
            >
              <PlusCircleIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>

        {/* Movie Items Section */}
        {list.movies && list.movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {list.movies.map((item: MovieListItem) => (
              <div key={item.id} className="bg-gray-700 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-600"> {/* Changed bg-gray-750 to bg-gray-700, added border */}
                <Link href={`/movies/${item.movie.id}`} legacyBehavior>
                  <a>
                    {item.movie.poster ? (
                      <img 
                        src={item.movie.poster} 
                        alt={`Poster for ${item.movie.title}`} 
                        className="w-full h-72 object-cover"
                      />
                    ) : (
                      <div className="w-full h-72 bg-gray-600 flex items-center justify-center text-gray-400"> {/* Consistent placeholder */}
                        No Poster
                      </div>
                    )}
                  </a>
                </Link>
                <div className="p-4">
                  <Link href={`/movies/${item.movie.id}`} legacyBehavior>
                    <a className="text-lg font-semibold text-[var(--primary-blue)] hover:text-[var(--primary-hover)] line-clamp-1"> {/* Use var for text */}
                      {item.movie.title}
                    </a>
                  </Link>
                  {item.movie.year && (
                    <p className="text-xs text-gray-400 mt-1">{item.movie.year}</p> {/* text-gray-500 to text-gray-400 */}
                  )}
                  <button
                    onClick={() => handleRemoveMovie(item.id, item.movie.title)}
                    className="mt-3 w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-red-400 bg-gray-600 hover:bg-red-700 hover:text-red-300 rounded-md transition-colors" /* bg-gray-700 to bg-gray-600, hover:bg-red-800 to hover:bg-red-700 */
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Remove from List
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10"> {/* text-gray-500 to text-gray-400 */}
            <p className="text-xl text-white">This list is empty.</p> {/* Added text-white for emphasis */}
            <p>Click the "Add Movie" button to start adding movies!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieListDetail;
