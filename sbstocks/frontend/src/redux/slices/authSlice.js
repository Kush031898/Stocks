import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const login = createAsyncThunk('auth/login', async (data, thunkAPI) => {
  try {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, thunkAPI) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const updateBalance = createAsyncThunk('auth/updateBalance', async (_, thunkAPI) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

const stored = localStorage.getItem('user');
const initialUser = stored ? JSON.parse(stored) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: initialUser, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => { state.error = null; },
    setBalance: (state, action) => {
      if (state.user) {
        state.user.virtualBalance = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateBalance.fulfilled, (state, action) => {
        if (state.user) {
          state.user.virtualBalance = action.payload.virtualBalance;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      });
  }
});

export const { logout, clearError, setBalance } = authSlice.actions;
export default authSlice.reducer;
