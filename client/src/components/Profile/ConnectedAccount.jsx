import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';

const ConnectedAccount = ({ user }) => {
    return (
        <Card>
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <i className="ri-link text-green-500"></i>
                    Connected Account
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border">
                            <i className="ri-google-fill text-lg text-[#4285F4]"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Google Account</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                        <i className="ri-check-line mr-1"></i>Connected
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Your Gmail account is connected for sending emails.
                </p>
            </CardContent>
        </Card>
    );
};

export default ConnectedAccount;
