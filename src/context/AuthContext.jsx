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
        const checkAuth = () => {
            console.log('🔍 Checking auth on mount...');
            
            // Check localStorage first (persistent), then sessionStorage
            const authCode = localStorage.getItem('google_auth_code') || sessionStorage.getItem('google_auth_code');
            const userInfo = localStorage.getItem('user_info') || sessionStorage.getItem('user_info');

            console.log('📦 AuthCode:', authCode ? 'Found' : 'Not found');
            console.log('👤 UserInfo:', userInfo ? 'Found' : 'Not found');

            if (authCode && userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    console.log('✅ Restoring user session:', parsedUser.email);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('❌ Failed to parse user info:', error);
                }
            } else {
                console.log('⚠️ No auth data found, user not logged in');
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (userData, rememberMe = true) => {
        console.log('🔐 Logging in user:', userData.email, '| Remember:', rememberMe);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store in localStorage if remember me is true, otherwise sessionStorage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('user_info', JSON.stringify(userData));
        console.log('💾 Stored user info in:', rememberMe ? 'localStorage' : 'sessionStorage');
    };

    const logout = () => {
        console.log('🚪 Logging out user');
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear both storages
        localStorage.removeItem('google_auth_code');
        localStorage.removeItem('user_info');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        sessionStorage.removeItem('google_auth_code');
        sessionStorage.removeItem('user_info');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
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
