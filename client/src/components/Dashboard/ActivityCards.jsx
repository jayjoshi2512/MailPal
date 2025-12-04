import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';

/**
 * TopCampaigns - List of top performing campaigns
 */
export const TopCampaigns = ({ campaigns = [] }) => (
    <Card>
        <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <i className="ri-trophy-line text-yellow-500"></i>
                </div>
                Top Campaigns
            </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
            {campaigns && campaigns.length > 0 ? (
                <div className="space-y-2">
                    {campaigns.slice(0, 3).map((camp, idx) => (
                        <CampaignItem key={camp.id || idx} campaign={camp} rank={idx + 1} />
                    ))}
                </div>
            ) : (
                <EmptyState icon="ri-trophy-line" message="No campaigns yet" />
            )}
        </CardContent>
    </Card>
);

const CampaignItem = ({ campaign, rank }) => {
    const rankStyles = {
        1: 'bg-yellow-500/10 text-yellow-600',
        2: 'bg-gray-500/10 text-gray-500',
        3: 'bg-orange-500/10 text-orange-600'
    };

    return (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${rankStyles[rank]}`}>
                #{rank}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-blue-500 transition-colors">
                    {campaign.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                    {campaign.emails_sent || 0} emails sent
                </p>
            </div>
            <Badge 
                variant={campaign.status === 'completed' ? 'default' : campaign.status === 'active' ? 'secondary' : 'outline'} 
                className="text-[9px]"
            >
                {campaign.status}
            </Badge>
        </div>
    );
};

/**
 * RecentActivity - List of recent email activity
 */
export const RecentActivity = ({ activities = [] }) => (
    <Card>
        <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <i className="ri-time-line text-green-500"></i>
                </div>
                Recent Activity
            </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
            {activities && activities.length > 0 ? (
                <div className="space-y-2">
                    {activities.slice(0, 3).map((activity, idx) => (
                        <ActivityItem key={activity.id || idx} activity={activity} />
                    ))}
                </div>
            ) : (
                <EmptyState icon="ri-mail-line" message="No recent activity" />
            )}
        </CardContent>
    </Card>
);

const ActivityItem = ({ activity }) => (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <i className="ri-mail-check-line text-green-500 text-sm"></i>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{activity.subject || 'No Subject'}</p>
            <p className="text-[10px] text-muted-foreground truncate">
                To: {activity.recipient_email || activity.emailTo || 'Unknown'}
            </p>
        </div>
        <div className="text-right">
            <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/30">
                sent
            </Badge>
            <p className="text-[9px] text-muted-foreground mt-0.5">
                {activity.sent_at || activity.sentAt 
                    ? new Date(activity.sent_at || activity.sentAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }) 
                    : ''
                }
            </p>
        </div>
    </div>
);

const EmptyState = ({ icon, message }) => (
    <div className="flex flex-col items-center justify-center h-28 text-muted-foreground">
        <i className={`${icon} text-3xl mb-2 opacity-30`}></i>
        <p className="text-xs">{message}</p>
    </div>
);

export default { TopCampaigns, RecentActivity };
