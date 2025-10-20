import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import ConnectGoogle from '@/pages/ConnectGoogle';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import Compose from '@/pages/Compose';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * Centralized routing configuration
 * All application routes are managed from this single file for better maintainability
 */
const Routes = () => {
    return (
        <RouterRoutes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/connect" element={<ConnectGoogle />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes - Require authentication */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/compose" 
                element={
                    <ProtectedRoute>
                        <Compose />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/settings" 
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } 
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </RouterRoutes>
    );
};

export default Routes;
