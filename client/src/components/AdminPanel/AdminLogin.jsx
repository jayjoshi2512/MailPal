import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/mode-toggle';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminAPI = {
    sendCode: async () => {
        const res = await fetch(`${API_URL}/admin/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        return res.json();
    },
    verifyCode: async (code) => {
        const res = await fetch(`${API_URL}/admin/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        return res.json();
    },
};

const AdminLogin = ({ onAuthenticated }) => {
    const [step, setStep] = useState('initial');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [expiresIn, setExpiresIn] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    useEffect(() => {
        if (expiresIn > 0) {
            const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [expiresIn]);

    const handleSendCode = async () => {
        setLoading(true);
        try {
            const result = await adminAPI.sendCode();
            if (result.success) {
                setStep('codeSent');
                setExpiresIn(result.data.expiresIn);
                setCooldown(120);
                toast.success('Verification code sent to admin email');
            } else {
                toast.error(result.error || 'Failed to send code');
                if (result.error?.includes('wait')) {
                    const seconds = parseInt(result.error.match(/\d+/)?.[0] || '60');
                    setCooldown(seconds);
                }
            }
        } catch (error) {
            toast.error('Failed to send code. Check server connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code.trim()) {
            toast.warning('Please enter the verification code');
            return;
        }

        setLoading(true);
        try {
            const result = await adminAPI.verifyCode(code);
            if (result.success) {
                localStorage.setItem('admin_token', result.data.token);
                toast.success('Admin authenticated successfully');
                onAuthenticated(result.data.token);
            } else {
                toast.error(result.error || 'Invalid code');
                if (result.error?.includes('expired') || result.error?.includes('attempts')) {
                    setStep('initial');
                    setCode('');
                }
            }
        } catch (error) {
            toast.error('Verification failed. Check server connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="ri-shield-keyhole-line text-3xl text-primary"></i>
                        </div>
                    </div>
                    <CardTitle className="text-xl">Admin Access</CardTitle>
                    <CardDescription>
                        {step === 'initial' 
                            ? 'Click below to receive an authentication code via email'
                            : 'Enter the verification code sent to your email'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 'initial' ? (
                        <>
                            <Button 
                                className="w-full" 
                                onClick={handleSendCode}
                                disabled={loading || cooldown > 0}
                            >
                                {loading ? (
                                    <><i className="ri-loader-4-line animate-spin mr-2"></i>Sending...</>
                                ) : cooldown > 0 ? (
                                    <><i className="ri-time-line mr-2"></i>Wait {cooldown}s</>
                                ) : (
                                    <><i className="ri-mail-send-line mr-2"></i>Send Code</>
                                )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                A 15-character code will be sent to the admin email address
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Enter 15-character code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.trim())}
                                    className="text-center font-mono text-lg tracking-wider"
                                    maxLength={15}
                                    autoFocus
                                />
                                {expiresIn > 0 && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        Code expires in {Math.floor(expiresIn / 60)}:{(expiresIn % 60).toString().padStart(2, '0')}
                                    </p>
                                )}
                            </div>
                            <Button 
                                className="w-full" 
                                onClick={handleVerifyCode}
                                disabled={loading || code.length !== 15}
                            >
                                {loading ? (
                                    <><i className="ri-loader-4-line animate-spin mr-2"></i>Verifying...</>
                                ) : (
                                    <><i className="ri-shield-check-line mr-2"></i>Verify</>
                                )}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleSendCode}
                                disabled={loading || cooldown > 0}
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
