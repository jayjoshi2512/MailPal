import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

/**
 * DashboardSkeleton - Loading state for dashboard
 */
const DashboardSkeleton = () => (
    <div className="min-h-screen bg-background flex">
        <Navbar />
        <Sidebar />
        <main className="ml-64 mt-16 p-6 flex-1">
            <div className="max-w-6xl mx-auto animate-pulse space-y-4">
                <div className="h-6 w-48 bg-muted rounded"></div>
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-muted rounded-lg"></div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-48 bg-muted rounded-lg"></div>
                    <div className="h-48 bg-muted rounded-lg"></div>
                </div>
            </div>
        </main>
    </div>
);

export default DashboardSkeleton;
