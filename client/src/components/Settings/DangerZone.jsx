import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';

const DangerZone = ({ onDeleteClick }) => {
    return (
        <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
                    <i className="ri-error-warning-line"></i>
                    Danger Zone
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm" onClick={onDeleteClick} className="text-xs">
                    <i className="ri-delete-bin-line mr-2"></i>
                    Delete Account
                </Button>
            </CardContent>
        </Card>
    );
};

export default DangerZone;
