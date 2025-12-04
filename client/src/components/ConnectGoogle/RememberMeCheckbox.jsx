import React from 'react';
import { Checkbox } from '@/components/components/ui/checkbox';

const RememberMeCheckbox = ({ checked, onCheckedChange }) => {
    return (
        <div className="flex items-center space-x-2">
            <Checkbox 
                id="remember" 
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
            <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer select-none"
            >
                Remember me on this device
            </label>
        </div>
    );
};

export default RememberMeCheckbox;
