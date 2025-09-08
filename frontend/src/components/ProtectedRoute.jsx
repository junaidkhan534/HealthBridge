import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { token } = useSelector((state) => state.user);
    const location = useLocation();

    if (token) {
        // If user is authenticated
        return children;
    } else {
        // If not authenticated
            return <Navigate to="/" />;
        // if(location.pathname.startsWith("/doctor")) {
        //     return <Navigate to="/portal/login" />;
        // } else {
        // }
    }
};

export default ProtectedRoute;