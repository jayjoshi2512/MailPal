import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';

/**
 * StatCard Component
 * Reusable metric card with icon and value display - Compact version
 */
const StatCard = ({ title, value, subtitle, icon, iconColor = 'text-blue-600' }) => {
    return (
        <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">
                    {title}
                </CardTitle>
                <i className={`${icon} text-xl ${iconColor}`}></i>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold font-maorin">
                    {value?.toLocaleString() || 0}
                </div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
