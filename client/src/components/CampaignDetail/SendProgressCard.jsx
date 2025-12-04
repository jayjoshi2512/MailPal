import React from 'react';
import { Card, CardContent } from '@/components/components/ui/card';
import { Progress } from '@/components/components/ui/progress';

const SendProgressCard = ({ sendProgress }) => {
    const progressPercent = sendProgress.total > 0 
        ? Math.round(((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100) 
        : 0;

    return (
        <Card className="mb-4">
            <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Sending...</span>
                    <span className="text-sm font-bold">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span className="text-green-600">
                        <i className="ri-check-line mr-1"></i>{sendProgress.sent} sent
                    </span>
                    <span className="text-red-600">
                        <i className="ri-close-line mr-1"></i>{sendProgress.failed} failed
                    </span>
                    <span>{sendProgress.total - sendProgress.sent - sendProgress.failed} remaining</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default SendProgressCard;
