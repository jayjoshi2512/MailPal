import React from 'react';
import { Button } from '@/components/components/ui/button';

const CampaignsHeader = ({ onNewCampaign }) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Create and manage your cold email campaigns with AI-powered templates
                </p>
            </div>
            <Button onClick={onNewCampaign} className="gap-2">
                <i className="ri-add-line text-lg"></i>
                New Campaign
            </Button>
        </div>
    );
};

export default CampaignsHeader;
