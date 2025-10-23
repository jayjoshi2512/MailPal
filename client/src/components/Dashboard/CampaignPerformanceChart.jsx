import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * CampaignPerformanceChart Component
 * Displays top campaigns with click metrics
 */
const CampaignPerformanceChart = ({ data = [] }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="font-maorin flex items-center gap-2">
                        <i className="ri-bar-chart-box-line text-green-600"></i>
                        Top Campaigns
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <i className="ri-folder-open-line text-6xl mb-4"></i>
                            <p>No campaigns yet</p>
                            <p className="text-sm mt-2">Create your first campaign to track performance</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="font-maorin flex items-center gap-2">
                    <i className="ri-bar-chart-box-line text-green-600"></i>
                    Top Campaigns
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#6b7280"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e5e7eb', 
                                borderRadius: '8px' 
                            }}
                        />
                        <Legend />
                        <Bar 
                            dataKey="emailsSent" 
                            fill="#2563eb" 
                            name="Emails Sent" 
                            radius={[8, 8, 0, 0]} 
                        />
                        <Bar 
                            dataKey="clicks" 
                            fill="#16a34a" 
                            name="Clicks" 
                            radius={[8, 8, 0, 0]} 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default CampaignPerformanceChart;
