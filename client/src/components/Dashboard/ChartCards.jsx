import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { AreaChart, ActivityHeatmap } from './Charts';

/**
 * EmailActivityChart - Area chart showing email trends
 */
export const EmailActivityChart = ({ data = [] }) => (
    <Card className="overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <i className="ri-mail-line text-blue-500"></i>
                    </div>
                    Email Activity
                </CardTitle>
                <div className="text-right">
                    <p className="text-lg font-bold">
                        {data.reduce((sum, d) => sum + (d.count || 0), 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">last 14 days</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
            <div className="rounded-lg p-3">
                <AreaChart data={data.slice(-14)} color="#3b82f6" height={80} />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground px-1 mt-2">
                <span>14 days ago</span>
                <span>Today</span>
            </div>
        </CardContent>
    </Card>
);

/**
 * ActivityHeatmapChart - Heatmap showing daily activity
 */
export const ActivityHeatmapChart = ({ emailTrends = [], campaignTrends = [] }) => (
    <Card className="overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <i className="ri-fire-line text-teal-500"></i>
                    </div>
                    Activity Heatmap
                </CardTitle>
                <div className="text-right">
                    <p className="text-lg font-bold">
                        {campaignTrends.reduce((sum, d) => sum + (d.count || 0), 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">campaigns</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
            <div className="rounded-lg p-4">
                <ActivityHeatmap data={emailTrends} color="#14b8a6" />
            </div>
            <HeatmapLegend />
        </CardContent>
    </Card>
);

const HeatmapLegend = () => (
    <div className="flex items-center justify-center gap-3 mt-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-teal-500/20"></span> Less
        </span>
        <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-teal-500/50"></span> Medium
        </span>
        <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-teal-500"></span> More
        </span>
    </div>
);

export default { EmailActivityChart, ActivityHeatmapChart };
