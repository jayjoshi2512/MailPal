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
            // Get authorization code from URL
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            // Handle error from Google
            if (errorParam) {
                setStatus('error');
                setError('Authentication was cancelled or failed');
                setTimeout(() => navigate('/connect'), 3000);
                return;
            }

            // No code received
            if (!code) {
                setStatus('error');
                setError('No authorization code received');
                setTimeout(() => navigate('/connect'), 3000);
                return;
            }

            try {
                // Exchange code for tokens
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        code: code,
                        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
                        redirect_uri: import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/auth/callback',
                        grant_type: 'authorization_code'
                    })
                });

                if (!tokenResponse.ok) {
                    throw new Error('Failed to exchange code for tokens');
                }

                const tokenData = await tokenResponse.json();
                const accessToken = tokenData.access_token;
                const refreshToken = tokenData.refresh_token;

                // Get actual user info from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                if (!userInfoResponse.ok) {
                    throw new Error('Failed to get user info');
                }

                const userInfo = await userInfoResponse.json();

                // For now, simulate success
                setStatus('success');
                
                // Get remember me preference
                const rememberMe = localStorage.getItem('remember_me') === 'true';
                
                // Store tokens based on remember me preference
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('google_auth_code', code);
                storage.setItem('access_token', accessToken);
                if (refreshToken) {
                    storage.setItem('refresh_token', refreshToken);
                }
                
                // Clean up preference
                localStorage.removeItem('remember_me');
                
                // Create user object with REAL data from Google
                const userData = {
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    id: userInfo.id,
                    authCode: code,
                    accessToken: accessToken
                };
                
                // Update auth context with remember me preference
                login(userData, rememberMe);

                // Redirect to dashboard after successful authentication
                setTimeout(() => navigate('/dashboard'), 1500);
            } catch (error) {
                console.error('Error during authentication:', error);
                setStatus('error');
                setError('Failed to complete authentication');
                setTimeout(() => navigate('/connect'), 3000);
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
