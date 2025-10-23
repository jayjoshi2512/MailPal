import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * EmailTrendsChart Component
 * Displays 30-day email activity trend
 */
const EmailTrendsChart = ({ data = [] }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="font-maorin flex items-center gap-2">
                        <i className="ri-line-chart-line text-blue-600"></i>
                        Email Activity (Last 30 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <i className="ri-inbox-line text-6xl mb-4"></i>
                            <p>No email activity yet</p>
                            <p className="text-sm mt-2">Start sending emails to see trends</p>
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
                    <i className="ri-line-chart-line text-blue-600"></i>
                    Email Activity (Last 30 Days)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#6b7280"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(date) => {
                                try {
                                    return new Date(date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    });
                                } catch {
                                    return date;
                                }
                            }}
                        />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e5e7eb', 
                                borderRadius: '8px' 
                            }}
                            labelFormatter={(date) => {
                                try {
                                    return new Date(date).toLocaleDateString('en-US', { 
                                        month: 'long', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    });
                                } catch {
                                    return date;
                                }
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="emails" 
                            stroke="#2563eb" 
                            strokeWidth={3}
                            dot={{ fill: '#2563eb', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default EmailTrendsChart;
