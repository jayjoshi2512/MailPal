import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/components/ui/card';
import { Skeleton } from '@/components/components/ui/skeleton';

/**
 * Professional Compose Page Skeleton Loader
 * Mimics the compose form structure with shimmer animations
 */
const ComposeSkeleton = () => {
    return (
        <div className="max-w-3xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Skeleton className="h-7 w-48 mb-0.5" />
                    <Skeleton className="h-3 w-72" />
                </div>
            </div>

            {/* Compose Form Card Skeleton */}
            <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/50 bg-muted/10 py-3 px-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    {/* From Field Skeleton */}
                    <div>
                        <Skeleton className="h-3 w-12 mb-1" />
                        <Skeleton className="h-8 w-full" />
                    </div>

                    {/* To Field Skeleton */}
                    <div>
                        <Skeleton className="h-3 w-8 mb-1" />
                        <Skeleton className="h-9 w-full" />
                    </div>

                    {/* Subject Field Skeleton */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-8 w-full" />
                    </div>

                    {/* Message Body Skeleton */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        {/* Rich Text Editor Skeleton */}
                        <div className="border border-border/60 rounded-lg overflow-hidden">
                            {/* Toolbar Skeleton */}
                            <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/20">
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className="h-7 w-20" />
                                <div className="w-px h-6 bg-border mx-1"></div>
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <Skeleton key={i} className="h-8 w-8 rounded" />
                                ))}
                            </div>
                            {/* Editor Content Skeleton */}
                            <div className="p-2.5 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/6" />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                            <Skeleton className="h-9 w-28" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComposeSkeleton;
