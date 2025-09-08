import { createSlice } from '@reduxjs/toolkit';

// This function attempts to get the user from localStorage
const getUserFromLocalStorage = () => {
    try {
        const serializedUser = localStorage.getItem('user');
        if (serializedUser === null) {
            return null;
        }
        return JSON.parse(serializedUser);
    } catch (error) {
        console.error("Could not load user from local storage", error);
        return null;
    }
};

const initialState = {
    user: getUserFromLocalStorage(), // Load user on initial start
    token: localStorage.getItem('token') || null, // Load token on initial start
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            // Save to local storage so it persists on refresh
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            // Clear from local storage on logout
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;