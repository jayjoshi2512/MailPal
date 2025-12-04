import React from 'react';
import { Input } from '@/components/components/ui/input';

const CampaignsSearch = ({ searchQuery, onSearchChange }) => {
    return (
        <div className="mb-6">
            <div className="relative max-w-md">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                <Input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>
    );
};

export default CampaignsSearch;
