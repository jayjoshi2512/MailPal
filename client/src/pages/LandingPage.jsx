import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Landing from '@/components/Landing/Landing';
import Navbar from '@/components/Navbar';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();

    // Auto-redirect to dashboard if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Don't show anything while checking authentication (instant redirect)
    if (isLoading) {
        return null;
    }

    return (
        <div className='h-screen w-full px-[4%] md:px-[8%]'>
            <Navbar showConnectButton={true} />
            <Landing />
        </div>
    );
};

export default LandingPage;