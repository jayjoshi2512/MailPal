import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { useAuth } from '@/context/AuthContext';

/**
 * AuthCallback - Handles OAuth redirect from Google
 * This page receives the authorization code and exchanges it for tokens
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const handleCallback = async () => {
            // Backend handles OAuth and redirects here with JWT token
            const token = searchParams.get('token');
            const errorParam = searchParams.get('error');

            // Handle error from backend/Google
            if (errorParam) {
                setStatus('error');
                setError('Authentication was cancelled or failed');
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            // No token received from backend
            if (!token) {
                setStatus('error');
                setError('No authentication token received');
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            try {
                // Get remember me preference
                const rememberMe = localStorage.getItem('remember_me') === 'true';
                
                // Store JWT token based on remember me preference
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('auth_token', token);
                
                // Clean up preference
                localStorage.removeItem('remember_me');
                
                // Import API service
                const { authAPI } = await import('@/services/api.js');
                
                // Fetch user data from backend using the JWT token
                const userData = await authAPI.getCurrentUser();

                if (!userData.success) {
                    throw new Error(userData.error || 'Failed to get user data');
                }

                // Create user object with REAL data from backend
                const user = {
                    email: userData.data.user.email,
                    name: userData.data.user.name,
                    id: userData.data.user.id,
                    profile_picture: userData.data.user.profile_picture
                };

                // Login the user (update auth context)
                login(user);
                
                setStatus('success');

                // Redirect to dashboard after successful authentication
                setTimeout(() => navigate('/dashboard'), 1500);
            } catch (error) {
                console.error('Error during authentication:', error);
                setStatus('error');
                setError('Failed to complete authentication');
                setTimeout(() => navigate('/'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-border/50">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        {status === 'processing' && (
                            <div className="w-12 h-12 border-4 border-muted border-t-foreground rounded-full animate-spin"></div>
                        )}
                        {status === 'success' && (
                            <i className="ri-check-line text-6xl text-green-600"></i>
                        )}
                        {status === 'error' && (
                            <i className="ri-close-line text-6xl text-red-600"></i>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold font-maorin">
                        {status === 'processing' && 'Connecting to Google...'}
                        {status === 'success' && 'Successfully Connected!'}
                        {status === 'error' && 'Connection Failed'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-center">
                    {status === 'processing' && (
                        <p className="text-muted-foreground">
                            Please wait while we complete the authentication process
                        </p>
                    )}
                    {status === 'success' && (
                        <p className="text-muted-foreground">
                            Redirecting you to the dashboard...
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="text-muted-foreground">
                            {error || 'An error occurred. Redirecting back...'}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthCallback;
