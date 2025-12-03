import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext - Manages authentication state across the application
 */
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            console.log('🔍 Checking auth on mount...');
            
            // Check for JWT token (localStorage first for "remember me", then sessionStorage)
            const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

            console.log('📦 Auth Token:', authToken ? 'Found' : 'Not found');

            if (authToken) {
                try {
                    // Import API service dynamically
                    const { authAPI } = await import('@/services/api.js');
                    
                    // Fetch current user from backend
                    console.log('👤 Fetching current user from backend...');
                    const response = await authAPI.getCurrentUser();
                    
                    if (response.success && response.data.user) {
                        console.log('✅ Restoring user session:', response.data.user.email);
                        setUser(response.data.user);
                        setIsAuthenticated(true);
                    } else {
                        console.log('⚠️ Invalid user data, clearing auth');
                        clearAuth();
                    }
                } catch (error) {
                    console.error('❌ Failed to fetch user:', error);
                    
                    // Only logout on auth errors (401), not network/server errors
                    if (error.isAuthError) {
                        console.log('🔐 Auth error - clearing invalid token');
                        clearAuth();
                    } else if (error.isNetworkError || error.isServerError) {
                        // For network/server errors, keep the session but show user is offline
                        console.log('🌐 Network/Server error - keeping session, server may be temporarily unavailable');
                        // Keep existing auth state - don't logout
                        // User can still see cached data, and app will retry when connection is restored
                    } else {
                        // Unknown error - be cautious but don't auto-logout
                        console.log('⚠️ Unknown error - keeping session');
                    }
                }
            } else {
                console.log('⚠️ No auth token found, user not logged in');
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Clear auth state without calling logout API
    const clearAuth = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
    };

    const login = (userData) => {
        console.log('🔐 Logging in user:', userData.email);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User authenticated');
    };

    const logout = async () => {
        console.log('🚪 Logging out user');
        
        try {
            // Import API service dynamically
            const { authAPI } = await import('@/services/api.js');
            // Call backend logout
            await authAPI.logout();
        } catch (error) {
            console.error('❌ Logout API call failed:', error);
        }
        
        clearAuth();
        console.log('✅ User logged out successfully');
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
