import React from 'react';
import { Badge } from '@/components/components/ui/badge';

/**
 * EmailRecipients - Component for managing email recipients with chips/badges
 * Supports autocomplete suggestions like Gmail
 */
const EmailRecipients = ({ 
    toEmails, 
    to, 
    suggestions, 
    showSuggestions, 
    onToChange, 
    onToKeyDown, 
    onAddEmail, 
    onRemoveEmail, 
    onSelectSuggestion 
}) => {
    return (
        <div className="relative">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
                To
            </label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring min-h-[42px] bg-background">
                {toEmails.map((email, index) => (
                    <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-1 px-2 py-1"
                    >
                        <span>{email}</span>
                        <button
                            type="button"
                            onClick={() => onRemoveEmail(email)}
                            className="ml-1 hover:text-destructive transition-colors"
                        >
                            <i className="ri-close-line text-sm"></i>
                        </button>
                    </Badge>
                ))}
                <input
                    type="text"
                    value={to}
                    onChange={onToChange}
                    onKeyDown={onToKeyDown}
                    onBlur={() => {
                        if (to.trim()) onAddEmail(to);
                    }}
                    placeholder={toEmails.length === 0 ? "Add recipients..." : ""}
                    className="flex-1 outline-none bg-transparent min-w-[200px] px-2"
                />
            </div>

            {/* Email Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => onSelectSuggestion(suggestion)}
                            className="px-4 py-2 hover:bg-muted cursor-pointer text-sm transition-colors"
                        >
                            <i className="ri-mail-line mr-2 text-muted-foreground"></i>
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmailRecipients;
