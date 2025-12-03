import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';

/**
 * RecentActivityTable Component
 * Displays recent email sending activity
 */
const RecentActivityTable = ({ data = [] }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-border/50">
                <CardHeader className="px-4 py-3">
                    <CardTitle className="text-base font-maorin flex items-center gap-2">
                        <i className="ri-history-line text-cyan-600 text-lg"></i>
                        Recent Email Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <div className="py-8 text-center text-muted-foreground">
                        <i className="ri-mail-line text-4xl mb-2"></i>
                        <p className="text-sm">No recent email activity</p>
                        <p className="text-xs mt-1">Your sent emails will appear here</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader className="px-4 py-3">
                <CardTitle className="text-base font-maorin flex items-center gap-2">
                    <i className="ri-history-line text-cyan-600 text-lg"></i>
                    Recent Email Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">
                                    Subject
                                </th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">
                                    Recipient
                                </th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">
                                    Sent At
                                </th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((activity, index) => (
                                <tr 
                                    key={activity.id || index} 
                                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                >
                                    <td className="py-2 px-3 text-sm font-medium max-w-xs truncate">
                                        {activity.subject || 'No Subject'}
                                    </td>
                                    <td className="py-2 px-3 text-xs">
                                        {activity.emailTo || activity.recipient || 'Unknown'}
                                    </td>
                                    <td className="py-2 px-3 text-xs text-muted-foreground">
                                        {activity.sentAt 
                                            ? new Date(activity.sentAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'Unknown'
                                        }
                                    </td>
                                    <td className="py-2 px-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {activity.status || 'sent'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentActivityTable;
