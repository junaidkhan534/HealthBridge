import { createSlice } from '@reduxjs/toolkit';

// This function attempts to get the user from localStorage safely
const getUserFromLocalStorage = () => {
    try {
        const serializedUser = localStorage.getItem('user');
        if (serializedUser === null || serializedUser === "undefined") {
            return null;
        }
        return JSON.parse(serializedUser);
    } catch (error) {
        console.error("Could not load user from local storage", error);
        return null;
    }
};

const initialState = {
    user: getUserFromLocalStorage(), 
    token: localStorage.getItem('token') || null, 
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const newUser = action.payload.user || action.payload; 
            const newToken = action.payload.token || state.token;


            state.user = { ...state.user, ...newUser };
            state.token = newToken;

            if (state.user) {
                localStorage.setItem('user', JSON.stringify(state.user));
            }
            if (state.token) {
                localStorage.setItem('token', state.token);
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;