import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';

const EmailTemplate = ({ campaign, variables }) => {
    return (
        <Card className="col-span-3 flex flex-col h-full">
            <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-sm flex items-center gap-2">
                    <i className="ri-mail-line text-blue-600"></i>Email Template
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="bg-muted/40 rounded-lg p-4 space-y-3 flex-1 flex flex-col min-h-0">
                    <div className="shrink-0">
                        <span className="text-xs text-muted-foreground">Subject</span>
                        <p className="font-medium text-sm">{campaign.subject}</p>
                    </div>
                    <div className="border-t pt-3 flex-1 flex flex-col min-h-0">
                        <span className="text-xs text-muted-foreground shrink-0">Body</span>
                        <div className="text-sm whitespace-pre-wrap mt-1 overflow-y-auto scrollbar-hide flex-1">
                            {campaign.body}
                        </div>
                    </div>
                </div>
                {variables.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground">Variables:</span>
                        {variables.map(v => (
                            <Badge key={v} variant="outline" className="text-xs">
                                {`{{${v}}}`}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EmailTemplate;
