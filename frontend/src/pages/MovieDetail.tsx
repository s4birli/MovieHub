import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Check, Circle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMovieDetails, updateMovieStatus, clearCurrentMovie } from '../redux/movieSlice';
import MovieTrailer from '../components/MovieTrailer';
import MovieProviders from '../components/MovieProviders';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [showTrailer, setShowTrailer] = useState(false);

    const { currentMovie: movie, currentMovieLoading: loading } = useAppSelector(
        (state) => state.movie
    );

    useEffect(() => {
        if (id) {
            dispatch(fetchMovieDetails(id));
        }
        return () => {
            dispatch(clearCurrentMovie());
        };
    }, [id, dispatch]);

    const handleStatusUpdate = async () => {
        if (!movie) return;

        dispatch(updateMovieStatus({
            movieId: movie.tmdbId,
            status: movie.status === 'watched' ? 'unwatched' : 'watched'
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">Movie not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative h-96">
                        {movie.backdropPath ? (
                            <img
                                src={movie.backdropPath}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                No Image
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                            <div className="flex items-center gap-4">
                                {movie.year && <span>{movie.year}</span>}
                                {movie.voteAverage && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span>{movie.voteAverage.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <MovieTrailer
                            trailerUrl={movie.trailer || ''}
                            showTrailer={showTrailer}
                            onShowTrailer={() => setShowTrailer(true)}
                            onClose={() => setShowTrailer(false)}
                        />

                        <div className="grid md:grid-cols-3 gap-8 mt-5">
                            <div className="md:col-span-2 space-y-6">
                                {movie.overview && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Overview</h2>
                                        <p className="text-gray-600">{movie.overview}</p>
                                    </div>
                                )}

                                {movie.genres && movie.genres.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Genres</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.genres.map((genre: string) => (
                                                <span
                                                    key={genre}
                                                    className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {movie.directors && movie.directors.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-3">Directors</h2>
                                        <div className="flex flex-wrap gap-4">
                                            {movie.directors.map((director: { id: number; name: string; profilePath: string | null }) => (
                                                <div key={director.id} className="flex items-center gap-3">
                                                    {director.profilePath ? (
                                                        <img
                                                            src={director.profilePath}
                                                            alt={director.name}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xl">{director.name[0]}</span>
                                                        </div>
                                                    )}
                                                    <span className="text-gray-800">{director.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {movie.cast && movie.cast.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-3">Cast</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {movie.cast.map((actor: { id: number; name: string; character: string; profilePath: string | null }) => (
                                                <div key={actor.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                                    {actor.profilePath ? (
                                                        <img
                                                            src={actor.profilePath}
                                                            alt={actor.name}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xl">{actor.name[0]}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{actor.name}</div>
                                                        <div className="text-sm text-gray-500">{actor.character}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold mb-4">Information</h2>
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-sm text-gray-500 mb-2">Status</dt>
                                            <button
                                                onClick={handleStatusUpdate}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${movie.status === 'watched'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {movie.status === 'watched' ? (
                                                    <>
                                                        <Check className="w-5 h-5" />
                                                        <span>Watched</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Circle className="w-5 h-5" />
                                                        <span>Not Watched</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-gray-500">Type</dt>
                                            <dd className="text-gray-900 capitalize">{movie.mediaType}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {movie.providers && Object.keys(movie.providers).length > 0 && (
                                    <MovieProviders providers={movie.providers} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetail; 