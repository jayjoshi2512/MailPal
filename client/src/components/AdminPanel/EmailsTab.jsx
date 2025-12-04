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

const EmailsTab = ({ emails }) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <i className="ri-mail-line text-teal-500"></i>
                    Recent Emails (Last 100)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-2 font-medium">Recipient</th>
                                <th className="text-left py-2 px-2 font-medium">Subject</th>
                                <th className="text-left py-2 px-2 font-medium">Campaign</th>
                                <th className="text-left py-2 px-2 font-medium">Sender</th>
                                <th className="text-left py-2 px-2 font-medium">Sent At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emails?.map(email => (
                                <tr key={email.id} className="border-b hover:bg-muted/50">
                                    <td className="py-2 px-2 text-muted-foreground">{email.recipient_email}</td>
                                    <td className="py-2 px-2">
                                        <span className="truncate max-w-[200px] block">{email.subject}</span>
                                    </td>
                                    <td className="py-2 px-2 text-muted-foreground">{email.campaign_name || 'Compose'}</td>
                                    <td className="py-2 px-2 text-muted-foreground text-xs">{email.user_email}</td>
                                    <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(email.sent_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!emails || emails.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-8">No emails sent yet</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EmailsTab;
