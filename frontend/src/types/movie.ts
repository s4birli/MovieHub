export interface Movie {
    id: string;
    tmdbId: number;
    title: string;
    mediaType: 'movie' | 'tv';
    posterPath: string | null;
    backdropPath: string | null;
    status: 'watched' | 'unwatched';
    year?: string;
    voteAverage?: number;
    genres: string[];
    overview: string;
    trailer?: string | null;
    availableOnNetflix?: boolean;
    runtime?: number;
    originalLanguage: string;
    productionCountries?: string[];
    providers?: {
        [key: string]: {
            link: string;
            flatrate?: Array<{
                logo_path: string;
                provider_id: number;
                provider_name: string;
                display_priority: number;
            }>;
        };
    };
    directors?: Array<{
        id: number;
        name: string;
        profilePath: string | null;
    }>;
    cast?: Array<{
        id: number;
        name: string;
        character: string;
        profilePath: string | null;
    }>;
    voteCount?: number;
    popularity?: number;
    isInList?: boolean;
    adult?: boolean;
} 