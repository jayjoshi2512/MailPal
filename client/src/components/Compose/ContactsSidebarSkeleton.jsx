import React from 'react';
import { Skeleton } from '@/components/components/ui/skeleton';

/**
 * ContactsSidebar Skeleton Loader
 * Professional loading state for contacts sidebar
 */
const ContactsSidebarSkeleton = () => {
    return (
        <div className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] border-l border-border bg-background overflow-y-auto">
            <div className="p-4 space-y-4">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>

                {/* Search Bar Skeleton */}
                <Skeleton className="h-9 w-full rounded-md" />

                {/* Sort/Filter Row Skeleton */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-20" />
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                </div>

                {/* Separator */}
                <Skeleton className="h-px w-full" />

                {/* Contact Grid Skeleton */}
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <Skeleton className="w-14 h-14 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-2 w-10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactsSidebarSkeleton;
