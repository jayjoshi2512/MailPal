import React from 'react';
import { Button } from '@/components/components/ui/button';
import { Badge } from '@/components/components/ui/badge';

const CampaignHeader = ({ 
    campaign, 
    recipients = [], 
    sentEmails = [], 
    sending, 
    onBack, 
    onSend 
}) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <i className="ri-arrow-left-line"></i>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">{campaign?.name}</h1>
                        <Badge variant={campaign?.status === 'completed' ? 'default' : 'secondary'}>
                            {campaign?.status}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {campaign?.status === 'completed' 
                            ? `${sentEmails.length} emails sent` 
                            : `${recipients.length} recipients`
                        } • {campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString() : ''}
                    </p>
                </div>
            </div>
            {campaign?.status === 'draft' && recipients.length > 0 && !sending && (
                <Button onClick={onSend}>
                    <i className="ri-send-plane-line mr-2"></i>Send Campaign
                </Button>
            )}
        </div>
    );
};

export default CampaignHeader;
