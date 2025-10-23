import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Separator } from '@/components/components/ui/separator';
import { Checkbox } from '@/components/components/ui/checkbox';
import { ModeToggle } from '@/components/mode-toggle';

const ConnectGoogle = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Auto-redirect to dashboard if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleGoogleConnect = async () => {
        setIsConnecting(true);
        
        try {
            // Store remember me preference
            localStorage.setItem('remember_me', rememberMe.toString());
            
            // Import the API service
            const { authAPI } = await import('@/services/api.js');
            
            // Get OAuth URL from backend (SECURE - client secret stays on server)
            const response = await authAPI.getGoogleAuthUrl();
            
            if (response.success && response.data.authUrl) {
                // Redirect to Google OAuth via backend URL
                console.log('✅ Redirecting to Google OAuth...');
                window.location.href = response.data.authUrl;
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('❌ Error connecting to Google:', error);
            toast.error('Failed to connect to Google. Please check if the server is running and try again.');
            setIsConnecting(false);
        }
    };

    // Don't show anything while checking authentication (instant redirect)
    if (isLoading) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
            {/* Main Card */}
            <Card className="w-full max-w-md relative border-border/50">
                {/* Header with Back and Theme Toggle */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <i className="ri-arrow-left-line text-lg"></i>
                        <span>Back</span>
                    </button>
                    <ModeToggle />
                </div>

                <CardHeader className="space-y-3 text-center pb-8 pt-16">
                    {/* Logo/Icon */}
                    <div className="mx-auto w-16 h-16 flex items-center justify-center">
                        <i className="ri-send-plane-fill text-5xl text-foreground"></i>
                    </div>
                    
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold font-maorin">
                            Welcome to MailKar
                        </CardTitle>
                        <CardDescription className="text-base">
                            Connect your Google account to start sending personalized cold emails
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Google Connect Button */}
                    <Button
                        onClick={handleGoogleConnect}
                        disabled={isConnecting}
                        className="w-full h-12 text-base font-semibold bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-white dark:hover:bg-gray-100"
                    >
                        {isConnecting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                                <span>Connecting...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </div>
                        )}
                    </Button>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="remember" 
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                        />
                        <label
                            htmlFor="remember"
                            className="text-sm text-muted-foreground cursor-pointer select-none"
                        >
                            Remember me on this device
                        </label>
                    </div>

                    <div className="relative">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                            Why connect?
                        </span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 pt-2">
                        {[
                            { icon: 'ri-shield-check-line', text: 'Secure OAuth 2.0 authentication' },
                            { icon: 'ri-mail-line', text: 'Send emails directly from your Gmail' },
                            { icon: 'ri-user-line', text: 'No traditional signup required' },
                            { icon: 'ri-lock-line', text: 'Your data stays private & secure' }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <i className={`${feature.icon} text-blue-600`}></i>
                                </div>
                                <span className="text-muted-foreground">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div className="pt-4">
                        <p className="text-xs text-center text-muted-foreground leading-relaxed">
                            By connecting, you agree to allow MailKar to send emails on your behalf. 
                            You can revoke access anytime from your Google account settings.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConnectGoogle;
