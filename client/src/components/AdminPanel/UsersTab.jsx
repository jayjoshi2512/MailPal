import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const UsersTab = ({ users }) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <i className="ri-user-line text-blue-500"></i>
                    All Users ({users?.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-2 font-medium">User</th>
                                <th className="text-left py-2 px-2 font-medium">Email</th>
                                <th className="text-left py-2 px-2 font-medium">Created</th>
                                <th className="text-left py-2 px-2 font-medium">Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map(user => (
                                <tr key={user.id} className="border-b hover:bg-muted/50">
                                    <td className="py-2 px-2">
                                        <div className="flex items-center gap-2">
                                            {user.picture ? (
                                                <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                                    {(user.name || user.email)?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-medium">{user.name || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-2 text-muted-foreground">{user.email}</td>
                                    <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(user.created_at)}</td>
                                    <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(user.updated_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!users || users.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default UsersTab;
