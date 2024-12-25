export interface Movie {
    id: string;
    tmdbId: number;
    title: string;
    mediaType: 'movie' | 'tv';
    posterPath: string | null;
    status: 'watched' | 'unwatched';
    year?: string;
    voteAverage?: number;
    genres: string[];
    overview: string;
} 