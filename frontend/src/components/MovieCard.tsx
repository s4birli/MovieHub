import { Star, Trash2, Circle, CircleCheckBig, Film, Tv } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onStatusChange: (status: 'watched' | 'unwatched') => void;
  onRemove: () => void;
}

const MovieCard = ({ movie, onStatusChange, onRemove }: MovieCardProps) => {
  const navigate = useNavigate();

  const toggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newStatus = movie.status === 'watched' ? 'unwatched' : 'watched';
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this movie?')) {
      try {
        await onRemove();
      } catch (error) {
        console.error('Error removing movie:', error);
      }
    }
  };

  return (
    <div
      onClick={() => navigate(`/movie/${movie.tmdbId}/${movie.mediaType}`)}
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.posterPath ? (
          <img
            src={movie.posterPath}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full flex items-center gap-1">
            {movie.mediaType === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />} </div>

          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-sm">{movie.originalLanguage.toLocaleUpperCase()}</div>
        </div>
        {movie.voteAverage && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">{movie.voteAverage.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-semibold leading-tight">{movie.title}</h3>
          {movie.year && (
            <span className="text-sm text-gray-500 whitespace-nowrap">{movie.year}</span>
          )}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {movie.overview && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{movie.overview}</p>
        )}

        <div className="flex justify-between gap-2">
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${movie.status === 'watched'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
              } hover:opacity-80 transition-opacity flex-1`}
          >
            {movie.status === 'watched' ? (
              <CircleCheckBig className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            <span className="text-sm">{movie.status === 'watched' ? 'Watched' : 'Not Watched'}</span>
          </button>
          <button
            onClick={handleRemove}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:opacity-80 transition-opacity"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
