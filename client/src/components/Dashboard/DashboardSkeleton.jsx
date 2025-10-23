import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/components/ui/card';
import { Skeleton } from '@/components/components/ui/skeleton';

/**
 * Professional Dashboard Skeleton Loader
 * Mimics the actual dashboard structure with shimmer animations
 */
const DashboardSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-4">
            {/* Header Skeleton */}
            <div className="mb-4">
                <Skeleton className="h-8 w-64 mb-1" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Table Skeleton */}
            <Card className="border-border/50">
                <CardHeader className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <div className="overflow-x-auto">
                        {/* Table Header Skeleton */}
                        <div className="flex items-center gap-3 border-b border-border pb-2 mb-2">
                            <Skeleton className="h-3 w-24 flex-1" />
                            <Skeleton className="h-3 w-24 flex-1" />
                            <Skeleton className="h-3 w-24 flex-1" />
                            <Skeleton className="h-3 w-24 flex-1" />
                            <Skeleton className="h-3 w-16 flex-1" />
                        </div>
                        
                        {/* Table Rows Skeleton */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 border-b border-border/50 py-2">
                                <Skeleton className="h-4 w-32 flex-1" />
                                <Skeleton className="h-3 w-24 flex-1" />
                                <Skeleton className="h-3 w-28 flex-1" />
                                <Skeleton className="h-3 w-32 flex-1" />
                                <Skeleton className="h-5 w-12 rounded-full flex-1" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardSkeleton;
