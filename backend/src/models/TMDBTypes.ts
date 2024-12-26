export interface TMDBResponse {
    page: number;
    results: TMDBResult[];
    total_pages: number;
    total_results: number;
}

export interface TMDBResult {
    id: number;
    media_type: 'movie' | 'tv';
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    last_air_date?: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    original_language: string;
    genre_ids: number[];
}

export interface FilterOptions {
    mediaTypes: Array<{
        value: string;
        label: string;
    }>;
    genres: Array<{
        value: string;
        label: string;
    }>;
    statusOptions: Array<{
        value: string;
        label: string;
    }>;
}

export interface TMDBVideoResult {
    id: string;
    key: string;
    site: string;
    type: string;
}

export interface TMDBVideosResponse {
    id: number;
    results: TMDBVideoResult[];
}

export interface TMDBProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}

export interface TMDBProviderCountry {
    link: string;
    flatrate?: TMDBProvider[];
    rent?: TMDBProvider[];
    buy?: TMDBProvider[];
}

export interface TMDBProvidersResponse {
    id: number;
    results: {
        [country: string]: TMDBProviderCountry;
    };
}

export interface TMDBProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface TMDBDetailsResponse {
    backdrop_path: string | null;
    runtime?: number;
    episode_run_time?: number[];
    original_language: string;
    production_countries: TMDBProductionCountry[];
    release_date?: string;
    first_air_date?: string;
    genres?: TMDBGenre[];
    overview: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    isInList: boolean;
    id: number;
    title: string;
    name: string;
    adult: boolean;
    poster_path: string | null;
}

export interface TMDBGenre {
    id: number;
    name: string;
}

export const TMDB_GENRES: { [key: number]: string } = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
    10759: "Action & Adventure",
    10762: "Kids",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics"
};

export interface TMDBCastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

export interface TMDBCrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface TMDBCreditsResponse {
    id: number;
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
} 