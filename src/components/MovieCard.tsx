import Link from 'next/link';
import Image from 'next/image';
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