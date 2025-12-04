import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/components/ui/card';
import { Separator } from '@/components/components/ui/separator';
import { ModeToggle } from '@/components/mode-toggle';
import { GoogleConnectButton, FeaturesSection, RememberMeCheckbox } from '@/components/ConnectGoogle';

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
                            Welcome to MailPal
                        </CardTitle>
                        <CardDescription className="text-base">
                            Connect your Google account to start sending personalized cold emails
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Google Connect Button */}
                    <GoogleConnectButton 
                        isConnecting={isConnecting} 
                        onClick={handleGoogleConnect} 
                    />

                    {/* Remember Me Checkbox */}
                    <RememberMeCheckbox 
                        checked={rememberMe} 
                        onCheckedChange={setRememberMe} 
                    />

                    <div className="relative">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                            Why connect?
                        </span>
                    </div>

                    {/* Features List */}
                    <FeaturesSection />

                    {/* Footer Note */}
                    <div className="pt-4">
                        <p className="text-xs text-center text-muted-foreground leading-relaxed">
                            By connecting, you agree to allow MailPal to send emails on your behalf. 
                            You can revoke access anytime from your Google account settings.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConnectGoogle;
