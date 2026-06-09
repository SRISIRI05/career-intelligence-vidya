import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-cyan-500 animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
