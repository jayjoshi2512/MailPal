import React from 'react';
import { Badge } from '@/components/components/ui/badge';

/**
 * DashboardHeader - Welcome header with date badge
 */
const DashboardHeader = ({ userName = 'User' }) => {
    const firstName = userName?.split(' ')[0] || 'there';
    
    return (
        <div className="flex items-center justify-between mb-5">
            <div>
                <h1 className="text-xl font-bold">
                    Welcome back, {firstName} 👋
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Here's what's happening with your emails
                </p>
            </div>
            <DateBadge />
        </div>
    );
};

const DateBadge = () => (
    <Badge variant="outline" className="text-xs px-3 py-1.5">
        <i className="ri-calendar-line mr-1.5"></i>
        {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        })}
    </Badge>
);

export default DashboardHeader;
