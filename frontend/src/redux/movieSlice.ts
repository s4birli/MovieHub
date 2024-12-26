/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";
import { Movie } from '../types/movie';

// Interface tanımlamaları
interface FilterOption {
  value: string;
  label: string;
}

interface FilterOptions {
  mediaTypes: FilterOption[];
  genres: FilterOption[];
  statusOptions: FilterOption[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MovieState {
  movies: any[];
  filteredMovies: any[];
  searchResults: any[];
  filterOptions: FilterOptions;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  currentMovie: Movie | null;
  currentMovieLoading: boolean;
  currentMovieError: string | null;
}

const initialState: MovieState = {
  movies: [],
  filteredMovies: [],
  searchResults: [],
  filterOptions: {
    mediaTypes: [],
    genres: [],
    statusOptions: []
  },
  pagination: null,
  loading: false,
  error: null,
  currentMovie: null,
  currentMovieLoading: false,
  currentMovieError: null,
};

// Async actions
export const fetchMovies = createAsyncThunk(
  "movie/fetchMovies",
  async (params: {
    page?: number;
    limit?: number;
    genres?: string[];
    mediaType?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Add parameters to query string
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.genres?.length) params.genres.forEach(genre => queryParams.append('genres', genre));
      if (params.mediaType) queryParams.append('mediaType', params.mediaType);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.search) queryParams.append('search', params.search);
      const response = await axios.get(`/api/movies/list?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch movies");
    }
  }
);

export const addMovie = createAsyncThunk(
  "movie/addMovie",
  async (movieData: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post("/api/movies/list", movieData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add movie");
    }
  }
);

export const updateMovieStatus = createAsyncThunk(
  'movies/updateStatus',
  async ({ movieId, status }: { movieId: number; status: 'watched' | 'unwatched' }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/movies/list/${movieId}`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const deleteMovie = createAsyncThunk(
  'movies/delete',
  async (movieId: number, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/movies/list/${movieId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete movie');
    }
  }
);

export const searchMovies = createAsyncThunk(
  "movie/searchMovies",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/movies/search", {
        params: { query }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.msg || "Search failed");
    }
  }
);

export const fetchFilterOptions = createAsyncThunk(
  "movie/fetchFilterOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/movies/filters");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || "Failed to fetch filter options");
    }
  }
);

// Film detaylarını getir
export const fetchMovieDetails = createAsyncThunk(
  "movie/fetchMovieDetails",
  async ({ movieId, movieType }: { movieId: string, movieType: string }) => {
    const response = await axios.get(`/api/movies/details/${movieId}/${movieType}`);
    return response.data;
  }
);

// Instagram'dan film ekleme action'ı
export const addMovieFromInstagram = createAsyncThunk(
  'movies/addFromInstagram',
  async (url: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('/api/movies/from-instagram', { url });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error adding movie');
    }
  }
);

// Slice
const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setMovies(state, action) {
      state.movies = action.payload;
      state.filteredMovies = action.payload; // Initialize filteredMovies
      state.loading = false;
      state.error = null;
    },
    setFilteredMovies(state, action) {
      state.filteredMovies = action.payload;
    },
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
      state.currentMovieLoading = false;
      state.currentMovieError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Movies
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.movies;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages
        };
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Movie
      .addCase(addMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovie.fulfilled, (state) => {
        state.loading = false;
        // Liste zaten fetchMovies ile güncellenecek
      })
      .addCase(addMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Movie Status
      .addCase(updateMovieStatus.fulfilled, (state, action) => {
        if (state.currentMovie && state.currentMovie.tmdbId === action.payload.tmdbId) {
          state.currentMovie = action.payload;
        }
        // Ana listede de güncelle
        const index = state.movies.findIndex(
          (movie) => movie.tmdbId === action.payload.tmdbId
        );
        if (index !== -1) {
          state.movies[index] = action.payload;
        }
      })
      // Delete Movie
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.movies = state.movies.filter(
          (movie) => movie.tmdbId !== action.payload
        );
        state.filteredMovies = state.filteredMovies.filter(
          (movie) => movie.tmdbId !== action.payload
        );
      })
      // Search Movies
      .addCase(searchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Filter Options
      .addCase(fetchFilterOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.filterOptions = action.payload;
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Movie Details
      .addCase(fetchMovieDetails.pending, (state) => {
        state.currentMovieLoading = true;
        state.currentMovieError = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.currentMovieLoading = false;
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.currentMovieLoading = false;
        state.currentMovieError = action.error.message || "Failed to fetch movie details";
      })
      // Instagram'dan film ekleme case'leri
      .addCase(addMovieFromInstagram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovieFromInstagram.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = [...state.movies, action.payload];
      })
      .addCase(addMovieFromInstagram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setMovies, setFilteredMovies, clearCurrentMovie } = movieSlice.actions;
export default movieSlice.reducer;
