import React from 'react';

/**
 * Get file icon based on file type
 */
const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'ri-image-line';
    if (type.includes('pdf')) return 'ri-file-pdf-line';
    if (type.includes('word') || type.includes('document')) return 'ri-file-word-line';
    if (type.includes('sheet') || type.includes('excel')) return 'ri-file-excel-line';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'ri-file-ppt-line';
    if (type.includes('zip') || type.includes('compressed')) return 'ri-file-zip-line';
    if (type.startsWith('text/')) return 'ri-file-text-line';
    return 'ri-file-line';
};

/**
 * Get file extension from filename or type
 */
const getFileExtension = (file) => {
    const nameExt = file.name.split('.').pop()?.toLowerCase() || '';
    return nameExt;
};

/**
 * Group attachments by file extension with stats
 */
const groupByExtension = (attachments) => {
    const groups = {};
    attachments.forEach((file, index) => {
        const ext = getFileExtension(file);
        if (!groups[ext]) {
            groups[ext] = { files: [], totalSize: 0 };
        }
        groups[ext].files.push({ file, originalIndex: index });
        groups[ext].totalSize += file.size;
    });
    // Sort extensions alphabetically
    const sortedKeys = Object.keys(groups).sort();
    return sortedKeys.map(ext => ({ 
        ext, 
        files: groups[ext].files, 
        totalSize: groups[ext].totalSize,
        count: groups[ext].files.length 
    }));
};

/**
 * AttachmentsList - Component for displaying and managing file attachments
 * Compact layout grouped by extension with headers
 */
const AttachmentsList = ({ attachments, onRemoveAttachment, formatFileSize, uploadProgress = {} }) => {
    if (attachments.length === 0) return null;

    const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
    const groupedAttachments = groupByExtension(attachments);

    return (
        <div className="space-y-2">
            {/* Overall Header */}
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <i className="ri-attachment-2 text-blue-600 text-sm"></i>
                    Attachments
                </label>
                <span className="text-xs text-muted-foreground">
                    {attachments.length} file{attachments.length > 1 ? 's' : ''} ({formatFileSize(totalSize)})
                </span>
            </div>
            
            {/* Grouped layout for attachments */}
            <div className="space-y-2">
                {groupedAttachments.map((group) => (
                    <div key={group.ext} className="space-y-1">
                        {/* Extension Group Header */}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                .{group.ext}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {group.count} file{group.count > 1 ? 's' : ''} ({formatFileSize(group.totalSize)})
                            </span>
                        </div>
                        {/* Files in this group */}
                        <div className="flex flex-wrap gap-1.5">
                            {group.files.map(({ file, originalIndex }) => {
                                const progress = uploadProgress[originalIndex];
                                const isUploading = progress !== undefined && progress < 100;
                                const isCompleted = progress === 100;
                                
                                return (
                                    <div 
                                        key={originalIndex}
                                        className="relative group inline-flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md border border-border hover:border-blue-400 transition-all duration-150"
                                    >
                                        {/* File Icon */}
                                        <i className={`${getFileIcon(file.type)} text-sm text-blue-600`}></i>
                                        
                                        {/* File Info */}
                                        <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
                                            {file.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </span>
                                        
                                        {/* Upload Progress Indicator */}
                                        {isUploading && (
                                            <span className="text-[10px] text-blue-600 font-medium">
                                                {progress}%
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <i className="ri-check-line text-xs text-green-600"></i>
                                        )}
                                        
                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            onClick={() => onRemoveAttachment(originalIndex)}
                                            disabled={isUploading}
                                            className="w-4 h-4 rounded text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center ml-0.5"
                                            title="Remove"
                                        >
                                            <i className="ri-close-line text-sm"></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttachmentsList;
