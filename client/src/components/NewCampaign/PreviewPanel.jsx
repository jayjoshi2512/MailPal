import React from 'react';
import { Card, CardContent } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';

const PreviewPanel = ({ subject, body, fileData, preview }) => {
    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                    <i className="ri-eye-line text-muted-foreground"></i>Preview
                    <Badge variant="outline" className="text-[10px] font-normal ml-auto">
                        Using first contact
                    </Badge>
                </div>
                {(subject || body) ? (
                    <div className="bg-muted/40 rounded-lg p-4 min-h-[300px]">
                        <p className="font-semibold text-sm border-b pb-2 mb-3">
                            {preview(subject) || 'No subject'}
                        </p>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {preview(body) || 'No body'}
                        </div>
                    </div>
                ) : (
                    <div className="bg-muted/40 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Preview appears here</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PreviewPanel;
