import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
// import Spinner from './Spinner';

const AdminRoute = ({ children }) => {
    const { user, token } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);

    if (token && user?.role === 'admin') {
        // If the check is done and you are an admin, show the page
        return children;
    } else {
        // Otherwise, redirect to the homepage
        return <Navigate to="/" />;
    }
};

export default AdminRoute;