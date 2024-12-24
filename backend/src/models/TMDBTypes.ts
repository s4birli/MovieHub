export interface TMDBResponse {
    page: number;
    results: Array<TMDBResult>;
    total_pages: number;
    total_results: number;
}

export interface TMDBResult {
    id: number;
    media_type: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    release_date?: string;
    first_air_date?: string;
    last_air_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    original_language: string;
    genre_ids: number[];
}

// TMDB'nin genre listesi (https://developers.themoviedb.org/3/genres/get-movie-list)
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