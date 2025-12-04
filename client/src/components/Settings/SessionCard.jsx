import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';

const SessionCard = ({ onLogout }) => {
    return (
        <Card className="mb-4">
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <i className="ri-logout-box-line text-blue-500"></i>
                    Session
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                <p className="text-xs text-muted-foreground mb-3">Sign out of your account on this device.</p>
                <Button variant="outline" size="sm" onClick={onLogout} className="text-xs">
                    <i className="ri-logout-box-line mr-2"></i>
                    Logout
                </Button>
            </CardContent>
        </Card>
    );
};

export default SessionCard;
