import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const TemplatesSkeleton = () => {
    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-6xl mx-auto animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-muted rounded-lg"></div>)}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TemplatesSkeleton;
