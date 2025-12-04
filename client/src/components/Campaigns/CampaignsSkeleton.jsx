import React from 'react';
import { Card, CardContent } from '@/components/components/ui/card';

const CampaignsSkeleton = () => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default CampaignsSkeleton;
