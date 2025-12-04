import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Badge } from '@/components/components/ui/badge';

const extractVariables = (text) => {
    const matches = (text || '').match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
};

const TemplateCard = ({ 
    template, 
    isFeatured = false, 
    onCopy, 
    onEdit, 
    onDelete, 
    onToggleFavorite 
}) => {
    const variables = extractVariables(template.subject + ' ' + template.body);
    const isOwned = template.user_id !== null;

    return (
        <Card className="group hover:shadow-md flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                            {(template.is_favorite || isFeatured) && (
                                <i className="ri-star-fill text-yellow-500 text-xs"></i>
                            )}
                            {template.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge 
                                variant={(template.category || 'campaign') === 'campaign' ? 'default' : 'secondary'}
                                className="text-[10px]"
                            >
                                {template.category || 'campaign'}
                            </Badge>
                            {isFeatured && template.featured_category && (
                                <Badge variant="outline" className="text-[10px]">
                                    {template.featured_category}
                                </Badge>
                            )}
                            {template.is_public && !isOwned && (
                                <Badge variant="outline" className="text-[10px]">
                                    <i className="ri-global-line mr-1"></i>Public
                                </Badge>
                            )}
                        </div>
                    </div>
                    {!isFeatured && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onToggleFavorite && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => onToggleFavorite(template)}
                                    title={template.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <i className={`ri-star-${template.is_favorite ? 'fill text-yellow-500' : 'line'} text-sm`}></i>
                                </Button>
                            )}
                            {isOwned && onEdit && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => onEdit(template)}
                                >
                                    <i className="ri-pencil-line text-sm"></i>
                                </Button>
                            )}
                            {isOwned && onDelete && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                    onClick={() => onDelete(template)}
                                >
                                    <i className="ri-delete-bin-line text-sm"></i>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
                <div className="bg-muted/40 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                    <p className="text-sm truncate">{template.subject}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                    {template.body}
                </p>
                {template.category === 'campaign' && variables.length > 0 && (
                    <div className="mb-3">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <i className="ri-braces-line"></i>
                            {isFeatured ? 'Variables' : 'Required CSV Columns'} ({variables.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {variables.slice(0, 4).map(v => (
                                <Badge key={v} variant="outline" className="text-[9px] font-mono">
                                    {`{{${v}}}`}
                                </Badge>
                            ))}
                            {variables.length > 4 && (
                                <Badge variant="secondary" className="text-[9px]">
                                    +{variables.length - 4} more
                                </Badge>
                            )}
                        </div>
                        {!isFeatured && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                These variables will be replaced with values from your CSV
                            </p>
                        )}
                    </div>
                )}
                <div className="mt-auto pt-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-8 text-xs"
                        onClick={() => onCopy(template)}
                    >
                        <i className="ri-file-copy-line mr-1"></i>Copy to Clipboard
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TemplateCard;
