import Link from 'next/link';
import RatingStars from './RatingStars';

type MovieProps = {
  id: string;
  title: string;
  director?: string;
  year?: number;
  poster?: string;
  rating: number;
};

export const MovieCard = ({ id, title, director, year, poster, rating }: MovieProps) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      <Link href={`/movies/${id}`} className="block">
        <div className="aspect-[2/3] bg-gray-200 relative">
          {poster ? (
            <img 
              src={poster} 
              alt={`${title} poster`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-500">
              No poster
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          
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
        </div>
      </Link>
    </div>
  );
};

export default MovieCard; 