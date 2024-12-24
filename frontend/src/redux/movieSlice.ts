/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";

interface MovieState {
  movies: any[];
  filteredMovies: any[];
  searchResults: any[];
  loading: boolean;
  error: string | null;
}

const initialState: MovieState = {
  movies: [],
  filteredMovies: [],
  searchResults: [],
  loading: false,
  error: null,
};

// Async actions
export const fetchMovies = createAsyncThunk(
  "movie/fetchMovies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/movies/list");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response.data.msg || "Failed to fetch movies"
      );
    }
  }
);

export const addMovie = createAsyncThunk(
  "movie/addMovie",
  async (movieData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/movies/list", movieData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.msg || "Failed to add movie");
    }
  }
);

export const updateMovieStatus = createAsyncThunk(
  "movie/updateMovieStatus",
  async (
    data: { imdbID: string; watched?: boolean; favorite?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/api/movies/list/${data.imdbID}`, {
        watched: data.watched,
        favorite: data.favorite,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response.data.msg || "Failed to update movie"
      );
    }
  }
);

export const deleteMovie = createAsyncThunk(
  "movie/deleteMovie",
  async (imdbID: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/movies/list/${imdbID}`);
      return imdbID;
    } catch (error: any) {
      return rejectWithValue(
        error.response.data.msg || "Failed to delete movie"
      );
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
        state.movies = action.payload;
        state.filteredMovies = action.payload;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Movie
      .addCase(addMovie.fulfilled, (state, action) => {
        state.movies.push(action.payload);
        state.filteredMovies.push(action.payload);
      })
      // Update Movie Status
      .addCase(updateMovieStatus.fulfilled, (state, action) => {
        const index = state.movies.findIndex(
          (movie) => movie.imdbID === action.payload.imdbID
        );
        if (index !== -1) {
          state.movies[index] = action.payload;
          const filteredIndex = state.filteredMovies.findIndex(
            (movie) => movie.imdbID === action.payload.imdbID
          );
          if (filteredIndex !== -1) {
            state.filteredMovies[filteredIndex] = action.payload;
          }
        }
      })
      // Delete Movie
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.movies = state.movies.filter(
          (movie) => movie.imdbID !== action.payload
        );
        state.filteredMovies = state.filteredMovies.filter(
          (movie) => movie.imdbID !== action.payload
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
      });
  },
});

export const { setMovies, setFilteredMovies } = movieSlice.actions;
export default movieSlice.reducer;
