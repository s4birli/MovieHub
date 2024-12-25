import { TMDB_GENRES } from '../models/TMDBTypes';
import axiosInstance from '../api/axiosConfig';

const handleAddMovie = async (movie: any) => {
    try {
        const movieData = {
            tmdbId: movie.id,
            title: movie.title || movie.name,
            originalTitle: movie.original_title || movie.original_name,
            year: movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0],
            mediaType: movie.media_type,
            posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
            overview: movie.overview,
            voteAverage: movie.vote_average,
            voteCount: movie.vote_count,
            popularity: movie.popularity,
            originalLanguage: movie.original_language,
            genres: movie.genre_ids.map((id: number) => TMDB_GENRES[id]).filter(Boolean),
            status: 'unwatched'  // Default status
        };

        const response = await axiosInstance.post('/movies/list', movieData);

        if (response.data) {
            // Show success message or update UI
            console.log('Movie added successfully:', response.data);
        }
    } catch (error: any) {
        console.error('Error adding movie:', error.response?.data?.message || error.message);
        // Show error message to user
    }
}; 