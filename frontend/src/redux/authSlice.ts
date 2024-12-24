/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  accessToken:
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken"),
  refreshToken:
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken"),
  isAuthenticated: !!(
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  ),
  loading: false,
  error: null,
};

// Async actions
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    userData: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post("/api/users/register", userData);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response.data.msg || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string; rememberMe: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post("/api/users/", credentials);
      console.log(response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.msg || "Login failed");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await axios.post("/api/users/refresh-token", {
        refreshToken: auth.refreshToken,
      });
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response.data.msg || "Token refresh failed");
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
    },
    setCredentials(state, action) {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user; // Store user details
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;

        // Store tokens and user in localStorage by default after registration
        localStorage.setItem("accessToken", state.accessToken!);
        localStorage.setItem("refreshToken", state.refreshToken!);
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user; // Store user details
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;

        const rememberMe = action.meta.arg.rememberMe;

        // Store tokens and user based on rememberMe
        if (rememberMe) {
          localStorage.setItem("accessToken", state.accessToken!);
          localStorage.setItem("refreshToken", state.refreshToken!);
          localStorage.setItem("user", JSON.stringify(state.user));
        } else {
          sessionStorage.setItem("accessToken", state.accessToken!);
          sessionStorage.setItem("refreshToken", state.refreshToken!);
          sessionStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;

        // Determine where the token is stored
        if (localStorage.getItem("refreshToken")) {
          localStorage.setItem("accessToken", state.accessToken!);
        } else if (sessionStorage.getItem("refreshToken")) {
          sessionStorage.setItem("accessToken", state.accessToken!);
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
