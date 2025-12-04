import React from 'react';
import { Card, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';

const EmptyCampaigns = ({ searchQuery, onNewCampaign }) => {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <i className="ri-mail-send-line text-3xl text-muted-foreground"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'No campaigns found' : 'No campaigns yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                    {searchQuery 
                        ? 'Try a different search term'
                        : 'Create your first campaign to start sending personalized cold emails with AI-generated templates'
                    }
                </p>
                {!searchQuery && (
                    <Button onClick={onNewCampaign} className="gap-2">
                        <i className="ri-add-line"></i>
                        Create Campaign
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default EmptyCampaigns;
