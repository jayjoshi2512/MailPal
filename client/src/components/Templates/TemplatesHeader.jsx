import React from 'react';
import { Button } from '@/components/components/ui/button';

const TemplatesHeader = ({ onNewTemplate, onAIGenerate }) => {
    return (
        <div className="flex items-center justify-between mb-5">
            <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                    <i className="ri-file-list-3-line text-blue-500"></i>
                    Email Templates
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Ready-to-use templates for campaigns and compose
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onAIGenerate}>
                    <i className="ri-magic-line mr-2"></i>
                    Generate with AI
                </Button>
                <Button size="sm" onClick={onNewTemplate}>
                    <i className="ri-add-line mr-2"></i>
                    New Template
                </Button>
            </div>
        </div>
    );
};

export default TemplatesHeader;
