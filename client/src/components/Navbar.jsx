import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModeToggle } from '../components/mode-toggle';
import { Button } from '../components/components/ui/button';

/**
 * Navbar - Unified navigation component
 * Used across Landing and Dashboard with different actions
 */
const Navbar = ({ showConnectButton = false, onLogout = null }) => {
    const navigate = useNavigate();

    return (
        <div className="h-max w-full py-4 z-50 bg-background border-b border-border/50 fixed top-0 left-0 px-[4%] md:px-[8%]">
            <div className='flex justify-between items-center'>
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <i className="ri-send-plane-fill text-2xl md:text-3xl text-foreground"></i>
                    <span className="font-bold font-maorin text-2xl md:text-3xl">MailKar</span>
                </div>

                <div className="flex items-center gap-3">
                    <ModeToggle />
                    
                    {showConnectButton && (
                        <Button 
                            onClick={() => navigate('/connect')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Get Started
                        </Button>
                    )}
                    
                    {onLogout && (
                        <Button 
                            variant="outline" 
                            onClick={onLogout}
                            className="hidden md:flex"
                        >
                            <i className="ri-logout-box-line mr-2"></i>
                            Logout
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
