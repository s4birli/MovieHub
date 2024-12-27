import express, { Router } from "express";
import axios from "axios";
import MovieList from "../models/MovieList";
import {
    TMDBResponse,
    TMDBResult,
    TMDB_GENRES,
    FilterOptions,
    TMDBVideosResponse,
    TMDBProvidersResponse,
    TMDBDetailsResponse,
    TMDBCreditsResponse
} from "../models/TMDBTypes";
import { MovieListQuery, CustomRequestHandler } from "../models/types";
import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import { InstagramData } from "../models/InstagramModel";

// SearchRequestHandler tipini güncelle
type SearchRequestHandler = CustomRequestHandler<any, any, any, { query?: string }>;

const router: Router = express.Router();
const searchMovies: SearchRequestHandler = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            res.status(400).json({ message: "Search query required." });
            return;
        }

        const response = await axios.get<TMDBResponse>(`https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${process.env.MOVIE_DB_API_KEY}`);

        const results = response.data.results || [];

        const processedResults = results
            .filter((item: TMDBResult) => item.media_type === "movie" || item.media_type === "tv")
            .map((item: TMDBResult) => ({
                tmdbId: item.id,
                title: item.title || item.name,
                originalTitle: item.original_title || item.original_name,
                year: item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0],
                endYear: item.media_type === "tv" ? item.last_air_date?.split('-')[0] : undefined,
                mediaType: item.media_type,
                posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
                overview: item.overview,
                voteAverage: item.vote_average,
                voteCount: item.vote_count,
                popularity: item.popularity,
                originalLanguage: item.original_language,
                genres: item.genre_ids.map(id => TMDB_GENRES[id]).filter(Boolean)
            }));

        res.json(processedResults);
    } catch (error) {
        console.error("Movie search error:", error);
        res.status(500).json({ message: "An error occurred while searching for the movie." });
    }
};

const getMovieList: CustomRequestHandler = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 60,
            genres,
            mediaType,
            status,
            sortBy = 'rating',
            sortOrder = 'desc',
            search
        } = req.query as unknown as MovieListQuery;

        // Temel sorgu
        const query: any = {
            user: req.user?.id,
            isActive: true
        };

        // Filtreler
        if (genres) {
            query.genres = { $in: Array.isArray(genres) ? genres : [genres] };
        }
        if (mediaType) {
            query.mediaType = mediaType;
        }
        if (status) {
            query.status = status;
        }
        // Arama sorgusu ekle
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { originalTitle: { $regex: search, $options: 'i' } }
            ];
        }

        // Sıralama
        const sortOptions: { [key: string]: any } = {
            title: { title: sortOrder },
            rating: { voteAverage: sortOrder },
            year: { year: sortOrder }
        };

        // Toplam kayıt sayısı
        const total = await MovieList.countDocuments(query);

        // Sayfalama ve sıralama ile verileri getir
        const movies = await MovieList.find(query)
            .sort(sortOptions[sortBy] || sortOptions.rating)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            movies,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error getting movie list:", error);
        res.status(500).json({ message: "Error occurred while getting movie list" });
    }
};

const addMovie: CustomRequestHandler = async (req, res) => {
    try {
        const movieData = {
            ...req.body,
            user: req.user?.id
        };

        // Önce filmin listede olup olmadığını kontrol et
        const existingMovie = await MovieList.findOne({
            user: req.user?.id,
            tmdbId: movieData.tmdbId
        });

        // Zorunlu alanların kontrolü
        const requiredFields = ['tmdbId', 'title', 'mediaType'];
        for (const field of requiredFields) {
            if (!movieData[field]) {
                return res.status(400).json({ message: `${field} field is required` });
            }
        }

        // Geçerli mediaType kontrolü
        if (!['movie', 'tv'].includes(movieData.mediaType)) {
            return res.status(400).json({ message: "Invalid mediaType value." });
        }

        if (existingMovie) {
            if (existingMovie.isActive) {
                // Film zaten aktif olarak listede
                return res.status(400).json({ message: "This movie is already in your list." });
            } else {
                // Film listede ama inactive, aktif hale getir
                existingMovie.isActive = true;
                existingMovie.updatedAt = new Date();
                await existingMovie.save();
                return res.status(201).json(existingMovie);
            }
        }

        // Yeni film ekle
        const movie = new MovieList({
            ...movieData,
            status: movieData.status || 'unwatched',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json({ message: "Error occurred while adding movie" });
    }
};

const updateMovie: CustomRequestHandler = async (req, res) => {
    try {
        // Sadece status güncellenebilir
        const allowedUpdates = ['status'];

        // İzin verilmeyen alanları filtrele
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {} as Record<string, any>);

        // Status değerinin geçerliliğini kontrol et
        if (updates.status && !['watched', 'unwatched'].includes(updates.status)) {
            res.status(400).json({ message: "Invalid status value" });
            return;
        }

        // Güncelleme zamanını ekle
        updates.updatedAt = new Date();

        const movie = await MovieList.findOneAndUpdate(
            { tmdbId: req.params.id, user: req.user?.id, isActive: true },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!movie) {
            res.status(404).json({ message: "Movie not found" });
            return;
        }

        res.json(movie);
    } catch (error) {
        console.error("Error updating movie:", error);
        res.status(500).json({ message: "Error occurred while updating movie" });
    }
};

const removeMovie: CustomRequestHandler = async (req, res) => {
    try {
        const movie = await MovieList.findOneAndUpdate(
            { tmdbId: req.params.id, user: req.user?.id, isActive: true },
            { $set: { isActive: false, updatedAt: new Date() } },
            { new: true }
        );

        if (!movie) {
            res.status(404).json({ message: "Movie not found" });
            return;
        }

        res.json({ message: "Movie successfully removed" });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while removing movie" });
    }
};

const getFilterOptions: CustomRequestHandler = async (req, res) => {
    try {
        const mediaTypes = [
            { value: 'movie', label: 'Movie' },
            { value: 'tv', label: 'TV Series' }
        ];

        const genres = Object.values(TMDB_GENRES).map(name => ({
            value: name,
            label: name
        }));

        const statusOptions = [
            { value: 'watched', label: 'Watched' },
            { value: 'unwatched', label: 'Unwatched' }
        ];

        const filterOptions: FilterOptions = {
            mediaTypes,
            genres,
            statusOptions
        };

        res.json(filterOptions);
    } catch (error) {
        console.error("Error getting filter options:", error);
        res.status(500).json({ message: "Error while fetching filter options" });
    }
};

const getMovieDetails: CustomRequestHandler = async (req, res) => {
    try {
        const { id, type } = req.params;

        if (!id || !type) {
            return res.status(400).json({ message: "ID and type parameters are required" });
        }

        if (!['movie', 'tv'].includes(type)) {
            return res.status(400).json({ message: "Invalid media type" });
        }

        const API_KEY = process.env.MOVIE_DB_API_KEY;
        if (!API_KEY) {
            return res.status(500).json({ message: "API key not found" });
        }

        const userMovie = await MovieList.findOne({
            tmdbId: Number(id),
            user: req.user?.id,
            isActive: true
        });

        const isInList = userMovie ? true : false;

        const mediaType = type;
        const detailsUrl = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${API_KEY}`;
        const providersUrl = `https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers?api_key=${API_KEY}`;
        const videosUrl = `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${API_KEY}`;
        const creditsUrl = `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${API_KEY}`;

        const [detailsResponse, providersResponse, videosResponse, creditsResponse] = await Promise.all([
            axios.get<TMDBDetailsResponse>(detailsUrl),
            axios.get<TMDBProvidersResponse>(providersUrl),
            axios.get<TMDBVideosResponse>(videosUrl),
            axios.get<TMDBCreditsResponse>(creditsUrl)
        ]);

        const trailer = videosResponse.data.results.find(
            (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        const netflixProvider = Object.values(providersResponse.data.results || {}).find(
            (country) => country.flatrate?.some((provider) => provider.provider_id === 8)
        );

        const directors = creditsResponse.data.crew
            .filter(person => person.job === "Director")
            .map(director => ({
                id: director.id,
                name: director.name,
                profilePath: director.profile_path
                    ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
                    : null
            }));

        const cast = creditsResponse.data.cast
            .slice(0, 10)
            .map(actor => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profilePath: actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : null
            }));
        const movieDetails = {
            backdropPath: detailsResponse.data.backdrop_path
                ? `https://image.tmdb.org/t/p/original${detailsResponse.data.backdrop_path}`
                : null,
            trailer: trailer
                ? `https://www.youtube.com/watch?v=${trailer.key}`
                : null,
            posterPath: detailsResponse.data.poster_path
                ? `https://image.tmdb.org/t/p/w500${detailsResponse.data.poster_path}`
                : null,
            availableOnNetflix: !!netflixProvider,
            providers: providersResponse.data.results || {},
            runtime: detailsResponse.data.runtime || detailsResponse.data.episode_run_time?.[0],
            status: isInList ? userMovie?.status : 'unwatched',
            originalLanguage: detailsResponse.data.original_language,
            productionCountries: detailsResponse.data.production_countries?.map((c) => c.name) || [],
            directors,
            cast,
            year: detailsResponse.data.release_date?.split('-')[0] || detailsResponse.data.first_air_date?.split('-')[0],
            genres: detailsResponse.data.genres?.map((g) => g.name) || [],
            overview: detailsResponse.data.overview,
            voteAverage: detailsResponse.data.vote_average,
            voteCount: detailsResponse.data.vote_count,
            popularity: detailsResponse.data.popularity,
            mediaType: type,
            isInList: isInList,
            tmdbId: detailsResponse.data.id,
            title: detailsResponse.data.title || detailsResponse.data.name,
            adult: detailsResponse.data.adult,
        };

        res.json(movieDetails);
    } catch (error) {
        console.error("Movie details fetch error:", error);
        res.status(500).json({ message: "An error occurred while fetching movie details." });
    }
};

async function getMovieDetailsFromGPT(comment: string) {

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    if (!openai) {
        throw new Error('OpenAI API key is not configured');
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are a movie expert with a deep knowledge of movies, including their titles in various languages and their English equivalents. 
                    When extracting movie details, follow these rules:
                        1. Always check if the provided title corresponds to a known movie. also if it is english, do not translate. If it does, use the correct English title.
                        2. If no exact match exists, translate the title into English.
                        3. Include the category as 'movie' or 'tv' based on the context.
                        4. If the year is not mentioned, make an educated guess based on the movie or TV show's known release date.
                        5. Always return a valid JSON object. Do not include any additional explanation or text outside the JSON.
                        6. - "title" (the exact English title of the movie or TV show),
                        7. - "category" ("movie" or "tv"),
                        8. - "year" (release year, or an educated guess if not provided).`
            },
            {
                role: "user",
                content: comment
            }
        ],
        temperature: 0,
        max_tokens: 100
    });

    if (response.choices[0].message.content) {
        try {
            const parsedResponse = JSON.parse(response.choices[0].message.content);

            // Validate response structure
            if (!parsedResponse.title || !parsedResponse.category) {
                throw new Error('Missing or invalid movie information format');
            }

            return parsedResponse;
        } catch (error) {
            console.error('JSON parse error:', error);
            throw new Error('Could not parse movie information. Please check the comment.');
        }
    } else {
        throw new Error('Could not get movie information. Please try again later.');
    }
}

async function scrapeInstagramComment(url: string) {
    try {
        // Remove @ if exists at the start
        const cleanUrl = url.startsWith('@') ? url.substring(1) : url;

        // Try different regex patterns to extract the code
        const patterns = [
            /\/reel\/([A-Za-z0-9_-]+)/, // matches /reel/CODE
            /\/p\/([A-Za-z0-9_-]+)/, // matches /p/CODE
            /([A-Za-z0-9_-]{11})\/?(?:\?|$)/ // matches CODE directly or with query params
        ];

        let code = null;
        for (const pattern of patterns) {
            const match = cleanUrl.match(pattern);
            if (match && match[1]) {
                code = match[1];
                break;
            }
        }

        if (!code) {
            throw new Error('Invalid Instagram URL. Could not extract post code.');
        }

        const options = {
            method: 'GET',
            url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info',
            params: {
                code_or_id_or_url: code
            },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
            }
        };

        const response = await axios.request<InstagramData>(options);

        if (!response.data?.data?.caption?.text) {
            throw new Error('No caption found in the Instagram post');
        }
        return response.data.data.caption.text;

    } catch (error) {
        console.error('Instagram API error:', error);
        throw new Error('Could not fetch Instagram post data');
    }
}

async function searchMovieInTMDB(title: string, year?: string, mediaType?: string) {
    let endpoint: string;

    if (mediaType === 'movie') {
        endpoint = `https://api.themoviedb.org/3/search/movie?query=${title}&year=${year}&api_key=${process.env.MOVIE_DB_API_KEY}`;
    } else if (mediaType === 'tv') {
        endpoint = `https://api.themoviedb.org/3/search/tv?query=${title}&year=${year}&api_key=${process.env.MOVIE_DB_API_KEY}`;
    } else {
        endpoint = `https://api.themoviedb.org/3/search/multi?query=${title}&year=${year}&api_key=${process.env.MOVIE_DB_API_KEY}`;
    }

    const response = await axios.get<TMDBResponse>(endpoint);

    if (response.data.results.length === 0) {
        throw new Error('Movie not found in TMDB');
    }

    return response.data.results[0];
}

const getInstagramMovie: CustomRequestHandler = async (req, res) => {
    try {
        const { url } = req.body;

        // 1. Get comment from Instagram
        const comment = await scrapeInstagramComment(url);
        if (!comment) {
            return res.status(400).json({ message: "No comment found" });
        }
        // 2. Get movie details from ChatGPT
        try {
            const movieDetails = await getMovieDetailsFromGPT(comment);
            console.log(movieDetails);
            if (!movieDetails) {
                return res.status(400).json({ message: "Could not get movie details" });
            }
            // 3. Search for the movie in TMDB
            const tmdbMovie = await searchMovieInTMDB(
                movieDetails.title,
                movieDetails.year,
                movieDetails.category
            );
            // 4. Add the movie to the list
            const movieData = {
                tmdbId: tmdbMovie.id,
                title: tmdbMovie.title || tmdbMovie.name,
                originalTitle: tmdbMovie.original_title || tmdbMovie.original_name,
                year: tmdbMovie.release_date?.split('-')[0] || tmdbMovie.first_air_date?.split('-')[0],
                mediaType: movieDetails.category, // Use the category from ChatGPT
                posterPath: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
                backdropPath: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}` : null,
                overview: tmdbMovie.overview,
                voteAverage: tmdbMovie.vote_average,
                voteCount: tmdbMovie.vote_count,
                popularity: tmdbMovie.popularity,
                originalLanguage: tmdbMovie.original_language,
                genres: tmdbMovie.genre_ids.map(id => TMDB_GENRES[id]).filter(Boolean),
                user: req.user?.id
            };

            // Check if the movie already exists in the list
            const existingMovie = await MovieList.findOne({
                user: req.user?.id,
                tmdbId: movieData.tmdbId
            });

            // Check required fields
            const requiredFields = ['tmdbId', 'title', 'mediaType'];
            for (const field of requiredFields) {
                if (!movieData[field as keyof typeof movieData]) {
                    return res.status(400).json({ message: `${field} field is required` });
                }
            }

            // Check valid mediaType
            if (!['movie', 'tv'].includes(movieData.mediaType)) {
                return res.status(400).json({ message: "Invalid mediaType value." });
            }

            if (existingMovie) {
                if (existingMovie.isActive) {
                    // Return error with movie title
                    return res.status(400).json({
                        message: `"${movieDetails.title}" is already in your list.`
                    });
                } else {
                    // Film is inactive, activate it
                    existingMovie.isActive = true;
                    existingMovie.updatedAt = new Date();
                    await existingMovie.save();
                    return res.status(201).json(existingMovie);
                }
            }

            // Add new movie
            const movie = new MovieList({
                ...movieData,
                status: 'unwatched',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await movie.save();
            res.status(201).json(movie);
        } catch (gptError: any) {
            return res.status(400).json({
                message: gptError.message
            });
        }

    } catch (error: any) {
        console.error('Error processing Instagram URL:', error);
        // Show general errors directly
        res.status(500).json({
            message: error.message
        });
    }
};

router.get("/search", searchMovies);
router.get("/list", getMovieList);
router.post("/list", addMovie);
router.put("/list/:id", updateMovie);
router.delete("/list/:id", removeMovie);
router.get("/filters", getFilterOptions);
router.get("/details/:id/:type", getMovieDetails);
router.post("/from-instagram", getInstagramMovie);

export default router; 