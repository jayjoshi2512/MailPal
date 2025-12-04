import React from 'react';
import { Card, CardContent } from '@/components/components/ui/card';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value?.toLocaleString() || 0}</p>
                    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                    <i className={`${icon} text-lg`}></i>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default StatCard;
