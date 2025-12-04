import React from 'react';
import { Button } from '@/components/components/ui/button';

const EmptyTemplates = ({ onCreateNew }) => {
    return (
        <div className="text-center py-16">
            <i className="ri-file-list-3-line text-5xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground mb-4">No templates found</p>
            <Button onClick={onCreateNew}>
                <i className="ri-add-line mr-2"></i>Create Your First Template
            </Button>
        </div>
    );
};

export default EmptyTemplates;
