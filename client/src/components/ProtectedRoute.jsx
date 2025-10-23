import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 * Redirects to /connect if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Don't show loading state (instant check)
    if (isLoading) {
        return null;
    }

    // Redirect to landing page if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Render the protected component
    return children;
};

export default ProtectedRoute;
