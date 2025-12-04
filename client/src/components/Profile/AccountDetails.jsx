import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';

const AccountDetails = ({ user }) => {
    return (
        <Card className="mb-4">
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <i className="ri-user-line text-blue-500"></i>
                    Account Details
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Full Name</span>
                        <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Email Address</span>
                        <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Account Type</span>
                        <Badge variant="secondary" className="text-xs">Google OAuth</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountDetails;
