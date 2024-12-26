/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Get initial state from localStorage with proper type checking
const getInitialState = (): AuthState => {
  try {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      isAuthenticated: !!accessToken,
      loading: false,
      error: null
    };
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return initialState;
  }
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// Async actions
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData: FormData) => {
    const response = await axios.post("/api/users/register", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: { email: string; password: string; rememberMe: boolean }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/users", credentials);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

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

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData: FormData) => {
    const response = await axios.put("/api/users/profile", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (data: { currentPassword: string; newPassword: string }) => {
    const response = await axios.put("/api/users/password", data);
    return response.data;
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(), // Use getInitialState instead of initialState
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
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
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(updatePassword.fulfilled, (state) => {
        // Password updated successfully, no need to update state
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
