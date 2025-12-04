import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const CampaignsTab = ({ campaigns }) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <i className="ri-megaphone-line text-green-500"></i>
                    Recent Campaigns ({campaigns?.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-2 font-medium">Campaign</th>
                                <th className="text-left py-2 px-2 font-medium">User</th>
                                <th className="text-left py-2 px-2 font-medium">Status</th>
                                <th className="text-left py-2 px-2 font-medium">Emails</th>
                                <th className="text-left py-2 px-2 font-medium">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns?.map(campaign => (
                                <tr key={campaign.id} className="border-b hover:bg-muted/50">
                                    <td className="py-2 px-2">
                                        <div>
                                            <p className="font-medium">{campaign.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{campaign.subject}</p>
                                        </div>
                                    </td>
                                    <td className="py-2 px-2 text-muted-foreground">{campaign.user_email}</td>
                                    <td className="py-2 px-2">
                                        <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'} className="text-xs">
                                            {campaign.status}
                                        </Badge>
                                    </td>
                                    <td className="py-2 px-2">{campaign.emails_sent}</td>
                                    <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(campaign.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!campaigns || campaigns.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-8">No campaigns found</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CampaignsTab;
