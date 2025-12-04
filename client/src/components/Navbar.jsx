import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModeToggle } from '../components/mode-toggle';

/**
 * Navbar - Unified navigation component
 * Used across Landing and Dashboard with consistent alignment
 */
const Navbar = ({ showSidebar = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we're on the landing page or connect page (no sidebar)
    const isPublicPage = location.pathname === '/' || location.pathname === '/connect' || location.pathname === '/auth/callback';
    const hasSidebar = showSidebar || !isPublicPage;

    return (
        <header className="h-16 w-full z-50 bg-background border-b border-border/50 fixed top-0 left-0">
            <div className={`h-full flex justify-between items-center ${hasSidebar ? 'px-6' : 'px-[4%] md:px-[8%]'}`}>
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <i className="ri-send-plane-fill text-xl md:text-2xl text-foreground"></i>
                    <span className="font-bold font-maorin text-xl md:text-2xl">MailPal</span>
                </div>

                <div className="flex items-center gap-2">
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
