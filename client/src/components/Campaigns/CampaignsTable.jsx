import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Badge } from '@/components/components/ui/badge';

const getStatusBadge = (status) => {
    const variants = {
        draft: { variant: 'secondary', icon: 'ri-draft-line' },
        scheduled: { variant: 'outline', icon: 'ri-calendar-line' },
        running: { variant: 'default', icon: 'ri-play-circle-line' },
        paused: { variant: 'secondary', icon: 'ri-pause-circle-line' },
        completed: { variant: 'default', icon: 'ri-check-double-line' },
    };
    return variants[status] || variants.draft;
};

const CampaignsTable = ({ campaigns, onDelete }) => {
    const navigate = useNavigate();

    return (
        <Card>
            <CardContent className="p-0">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Campaign</th>
                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Subject</th>
                            <th className="text-center p-3 text-xs font-medium text-muted-foreground">Status</th>
                            <th className="text-center p-3 text-xs font-medium text-muted-foreground">Emails Sent</th>
                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Created</th>
                            <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign) => {
                            const statusBadge = getStatusBadge(campaign.status);
                            const campaignId = campaign.id || campaign._id;
                            return (
                                <tr 
                                    key={campaignId} 
                                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/campaigns/${campaignId}`)}
                                >
                                    <td className="p-3">
                                        <span className="font-medium text-sm">{campaign.name || 'Untitled'}</span>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">{campaign.subject || 'No subject'}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge variant={statusBadge.variant} className="text-xs">
                                            <i className={`${statusBadge.icon} mr-1`}></i>
                                            {campaign.status || 'draft'}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="text-sm font-medium">{campaign.total_sent || 0}</span>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-xs text-muted-foreground">
                                            {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/campaigns/${campaignId}`);
                                                }}
                                            >
                                                <i className="ri-eye-line text-sm"></i>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                onClick={(e) => onDelete(campaign, e)}
                                            >
                                                <i className="ri-delete-bin-line text-sm"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
};

export default CampaignsTable;
