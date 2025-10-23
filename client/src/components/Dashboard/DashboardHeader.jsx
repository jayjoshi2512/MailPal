import React from 'react';

/**
 * DashboardHeader Component
 * Displays welcome message and dashboard title - Compact version
 */
const DashboardHeader = ({ userName = 'User' }) => {
    return (
        <div className="mb-4">
            <h1 className="text-2xl font-bold font-maorin mb-1">
                Welcome back, {userName}!
            </h1>
            <p className="text-sm text-muted-foreground">
                Here's what's happening with your cold emails
            </p>
        </div>
    );
};

export default DashboardHeader;
