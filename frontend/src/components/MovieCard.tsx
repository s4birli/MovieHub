import { Star, Trash2, CheckCircle } from "lucide-react";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster: string;
    genre: string;
    category: string;
    rating: number;
    watched: boolean;
  };
  onToggleWatched: (id: number) => void;
  onDelete: (id: number) => void;
}

const MovieCard = ({ movie, onToggleWatched, onDelete }: MovieCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 truncate">{movie.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {movie.genre}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {movie.category}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-4">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">
            {movie.rating ? movie.rating.toFixed(1) : "0.0"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => onToggleWatched(movie.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${movie.watched
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
              } hover:opacity-80 transition-opacity`}
          >
            <CheckCircle className="w-4 h-4" />
            {movie.watched ? "İzlendi" : "İzlemedim"}
          </button>
          <button
            onClick={() => onDelete(movie.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:opacity-80 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
