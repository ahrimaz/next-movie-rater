import Link from 'next/link';import Image from 'next/image';import RatingStars from './RatingStars';import { useState } from 'react';import { useSession } from 'next-auth/react';

// Define a type for the session user
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

type User = {
  id: string;
  name?: string;
  username?: string;
  isAdmin?: boolean;
};

type MovieProps = {
  id: string;
  title: string;
  director?: string;
  year?: number;
  poster?: string;
  rating: number;
  user?: User;
  showUser?: boolean;
};

export const MovieCard = ({ 
  id, 
  title, 
  director, 
  year, 
  poster, 
  rating, 
  user, 
  showUser = false 
}: MovieProps) => {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = session?.user && user && (session.user as SessionUser).id === user.id;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/movies/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete movie');
      }
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error('Error deleting movie:', err);
      setError('Failed to delete movie. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition relative">
      <div className="aspect-[2/3] bg-gray-200 relative">
        <Link href={`/movies/${id}`} className="block w-full h-full">
          {poster ? (
            <div className="relative w-full h-full">
              <Image 
                src={poster} 
                alt={`${title} poster`} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-500">
              No poster
            </div>
          )}
        </Link>
      </div>
      
      <div className="p-4">
        <Link href={`/movies/${id}`}>
          <h3 className="text-xl font-semibold hover:text-blue-600 transition-colors">{title}</h3>
        </Link>
        
        {(director || year) && (
          <p className="text-gray-600">
            {director && director}
            {director && year && ', '}
            {year && year}
          </p>
        )}
        
        <div className="mt-3">
          <RatingStars rating={rating} />
        </div>

        {showUser && user && (
          <div className="mt-3 text-sm text-gray-600">
            Rated by: {' '}
            <Link 
              href={`/profiles/${user.username || user.id}`}
              className="text-blue-600 hover:underline"
            >
              {user.name || user.username || 'User'}
            </Link>
          </div>
        )}
        
        {/* Action buttons for owner - more visible at bottom of card */}
        {isOwner && (
          <div className="mt-4 pt-3 border-t flex justify-between">
            <Link 
              href={`/user/edit/${id}`}
              className="text-blue-600 hover:underline text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
              Edit Rating
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:underline text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Delete Rating</h3>
            <p className="mb-6">Are you sure you want to delete your rating for &quot;{title}&quot;? This action cannot be undone.</p>
            
            {error && (
              <div className="bg-red-50 p-3 rounded text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard; 