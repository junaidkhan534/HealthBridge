import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { token } = useSelector((state) => state.user);
  const { role } = useSelector((state) => state.user);
  console.log('Token from localStorage:', localStorage.getItem('token'));


  // If user has a token, redirect to dashboard (meaning logged in)
  if (token && token !== "undefined" && token !== "") {
    if (role === "patient") return <Navigate to="/patient" replace />;
    // return <Navigate to="/patient" replace />;
  }

  
  // Otherwise render public page (login, register, homepage, etc)
  return children;
};

export default PublicRoute;
