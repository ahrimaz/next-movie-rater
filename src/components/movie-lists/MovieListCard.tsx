'use client';

import React from 'react';
import Link from 'next/link';
import { MovieList, ApiResponse } from '@/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Using Heroicons

interface MovieListCardProps {
  list: MovieList;
  onEdit: (list: MovieList) => void; // Callback to handle edit action
  onDelete: (listId: string) => void; // Callback to handle delete action
}

const MovieListCard: React.FC<MovieListCardProps> = ({ list, onEdit, onDelete }) => {
  const movieCount = list._count?.movies ?? list.movies?.length ?? 0;

  const handleDelete = async () => {
    // Basic confirmation for now
    // TODO: Replace with a proper modal for consistency
    if (window.confirm(`Are you sure you want to delete the list "${list.name}"?`)) {
      try {
        const response = await fetch(`/api/movie-lists/${list.id}`, {
          method: 'DELETE',
        });
        const result: ApiResponse<null> = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to delete list');
        }
        onDelete(list.id); // Notify parent component
        alert('List deleted successfully'); // Placeholder
      } catch (error: any) {
        console.error('Error deleting list:', error);
        alert(`Error deleting list: ${error.message}`); // Placeholder
      }
    }
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <Link href={`/movie-lists/${list.id}`} legacyBehavior>
          <a className="text-2xl font-semibold text-[var(--primary-blue)] hover:text-[var(--primary-hover)] transition-colors">
            {list.name}
          </a>
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(list)}
            className="p-2 text-gray-400 hover:text-[var(--primary-blue)] transition-colors"
            aria-label="Edit list"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete list"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {list.description && (
        <p className="text-gray-400 mb-3 text-sm line-clamp-2"> {/* text-gray-400 is var(--text-secondary)-like */}
          {list.description}
        </p>
      )}

      <div className="text-sm text-gray-500 mb-4"> {/* text-gray-500 is darker than var(--text-secondary) */}
        <p>Movies: {movieCount}</p>
        <p className="mt-1">
          Last updated: {new Date(list.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Movie previews - simple list of titles for now */}
      {list.movies && list.movies.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs text-gray-400 font-semibold mb-1">Movie Previews:</h4>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {list.movies.slice(0, 3).map(item => ( // Show max 3 previews
              <li key={item.id} className="text-xs text-gray-500 truncate">
                {item.movie.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 text-right">
        <Link href={`/movie-lists/${list.id}`} legacyBehavior>
          <a className="inline-block px-4 py-2 text-sm font-medium text-white bg-[var(--primary-blue)] hover:bg-[var(--primary-hover)] rounded-md transition-colors">
            View List
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MovieListCard;
