import React from 'react';
import { Avatar } from '@/components/components/ui/avatar';
import { Badge } from '@/components/components/ui/badge';
import { Card, CardContent } from '@/components/components/ui/card';

const ProfileHeader = ({ user }) => {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar src={user?.profile_picture} name={user?.name} size="lg" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="font-semibold text-lg">{user?.name}</h2>
                            <Badge variant="outline" className="text-[10px]">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileHeader;
