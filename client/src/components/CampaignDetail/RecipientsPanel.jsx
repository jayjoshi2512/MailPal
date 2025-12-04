import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Badge } from '@/components/components/ui/badge';

const RecipientsPanel = ({ 
    campaign, 
    recipients = [], 
    sentEmails = [], 
    onAddClick,
    onRemoveRecipient 
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipients = recipients.filter(r =>
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(r.variables).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSentEmails = sentEmails.filter(e => 
        e.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <i className="ri-group-line text-green-600"></i>Recipients
                    </span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            {campaign?.status === 'completed' ? sentEmails.length : recipients.length}
                        </Badge>
                        {campaign?.status === 'draft' && (
                            <Button size="sm" variant="ghost" onClick={onAddClick}>
                                <i className="ri-user-add-line"></i>
                            </Button>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {campaign?.status === 'completed' ? (
                    // Show sent emails for completed campaigns
                    sentEmails.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <i className="ri-mail-check-line text-3xl mb-2"></i>
                            <p className="text-sm">No sent emails recorded</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Input 
                                placeholder="Search..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                className="h-8 text-xs" 
                            />
                            <div className="max-h-[280px] overflow-y-auto scrollbar-hide space-y-1">
                                {filteredSentEmails.map((email, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-xs">
                                        <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{email.recipient_email}</p>
                                            <p className="text-muted-foreground truncate">
                                                {email.recipient_name || 'No name'} • {new Date(email.sent_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] text-green-600">Sent</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ) : recipients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <i className="ri-user-add-line text-3xl mb-2"></i>
                        <p className="text-sm">No recipients</p>
                        <Button size="sm" variant="outline" className="mt-2" onClick={onAddClick}>
                            Add Recipient
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Input 
                            placeholder="Search..." 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            className="h-8 text-xs" 
                        />
                        <div className="max-h-[280px] overflow-y-auto scrollbar-hide space-y-1">
                            {filteredRecipients.map((r, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-xs group">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                                        {r.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{r.email}</p>
                                        {r.variables && Object.values(r.variables).some(v => v) && (
                                            <p className="text-muted-foreground truncate">
                                                {Object.entries(r.variables)
                                                    .filter(([,v]) => v)
                                                    .map(([k,v]) => `${k}: ${v}`)
                                                    .join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    {campaign?.status === 'draft' && (
                                        <button 
                                            onClick={() => onRemoveRecipient(r.email)} 
                                            className="opacity-0 group-hover:opacity-100 text-red-500"
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RecipientsPanel;
