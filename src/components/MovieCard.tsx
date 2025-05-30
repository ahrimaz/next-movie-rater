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
  badge?: string;
  compact?: boolean;
};

export const MovieCard = ({ 
  id, 
  title, 
  director, 
  year, 
  poster, 
  rating, 
  user, 
  showUser = false,
  badge,
  compact = false
}: MovieProps) => {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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
    <div className={`card-hover border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition relative ${
      compact 
        ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
        : 'border-gray-700 bg-gray-800'
    }`}>
      <div 
        className="aspect-[2/3] bg-gray-700 dark:bg-gray-600 relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {badge && (
          <div className={`absolute top-2 right-2 bg-gray-800 text-white font-medium rounded-md z-10 ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
          }`}>
            {badge}
          </div>
        )}
        <Link href={`/movies/${id}`} className="block w-full h-full">
          {poster ? (
            <div className="relative w-full h-full">
              <Image 
                src={poster} 
                alt={`${title} poster`} 
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {isHovered && !compact && (
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 flex flex-col items-center justify-end p-4">
                  <Link 
                    href={`/movies/${id}`}
                    className="bg-gray-800 hover:bg-gray-700 text-white w-full py-3 rounded-md font-medium transition-colors shadow-lg text-center"
                  >
                    View Details
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-700 dark:bg-gray-600 text-gray-400">
              {compact ? <span className="text-xs">No poster</span> : "No poster"}
            </div>
          )}
        </Link>
      </div>
      
      <div className={compact ? 'p-2' : 'p-4'}>
        <Link href={`/movies/${id}`}>
          <h3 className={`font-semibold hover:text-blue-400 transition-colors ${
            compact 
              ? 'text-sm text-gray-900 dark:text-white truncate' 
              : 'text-xl text-white'
          }`}>
            {title}
          </h3>
        </Link>
        
        {!compact && (director || year) && (
          <p className="text-gray-400 mt-1">
            {director && director}
            {director && year && ', '}
            {year && year}
          </p>
        )}
        
        <div className={compact ? 'mt-1' : 'mt-3'}>
          <RatingStars rating={rating} size={compact ? 'sm' : 'md'} />
        </div>

        {showUser && user && !compact && (
          <div className="mt-3 text-sm text-gray-400">
            Rated by: {' '}
            <Link 
              href={`/profiles/${user.username || user.id}`}
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              {user.name || user.username || 'User'}
            </Link>
          </div>
        )}
        
        {/* Action buttons for owner - more visible at bottom of card */}
        {isOwner && !compact && (
          <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between">
            <Link 
              href={`/user/edit/${id}`}
              className="text-blue-400 hover:text-blue-300 hover:underline text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
              Edit Rating
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-400 hover:text-red-300 hover:underline text-sm flex items-center"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-white">Delete Rating</h3>
            <p className="mb-6 text-gray-300">Are you sure you want to delete your rating for &quot;{title}&quot;? This action cannot be undone.</p>
            
            {error && (
              <div className="bg-red-900/50 p-3 rounded text-red-300 text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 transition"
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