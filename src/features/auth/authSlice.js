// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
    user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
    accessToken: Cookies.get('accessToken') || null,
    isAuthenticated: !!Cookies.get('accessToken')
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const { user, accessToken = null } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.isAuthenticated = true;

            Cookies.set('user', JSON.stringify(user), { secure: true });
            Cookies.set('accessToken', accessToken, { secure: true });
        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;

            Cookies.remove('user');
            Cookies.remove('accessToken');
        }
    }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
