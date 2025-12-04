import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <Card>
            <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <i className="ri-flashlight-line"></i>
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/compose')}>
                    <i className="ri-edit-line mr-2 text-blue-500"></i>Compose Email
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/campaigns/new')}>
                    <i className="ri-add-line mr-2 text-green-500"></i>New Campaign
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/templates')}>
                    <i className="ri-file-list-3-line mr-2 text-amber-500"></i>Templates
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/dashboard')}>
                    <i className="ri-dashboard-line mr-2 text-teal-500"></i>Dashboard
                </Button>
            </CardContent>
        </Card>
    );
};

export default QuickActions;
