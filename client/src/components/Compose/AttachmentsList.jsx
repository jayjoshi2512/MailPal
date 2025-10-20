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
 * AttachmentsList - Component for displaying and managing file attachments
 * Production-ready grid layout with polish
 */
const AttachmentsList = ({ attachments, onRemoveAttachment, formatFileSize, uploadProgress = {} }) => {
    if (attachments.length === 0) return null;

    const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);

    return (
        <div className="space-y-3">
            {/* Header with stats */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <i className="ri-attachment-2 text-blue-600"></i>
                    Attachments
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                        {attachments.length}
                    </span>
                </label>
                <span className="text-xs text-muted-foreground font-medium">
                    {formatFileSize(totalSize)} total
                </span>
            </div>
            
            {/* Grid layout for attachments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((file, index) => {
                    const progress = uploadProgress[index];
                    const isUploading = progress !== undefined && progress < 100;
                    const isCompleted = progress === 100;
                    
                    return (
                        <div 
                            key={index}
                            className="relative group flex items-start gap-3 p-3 bg-background rounded-lg border border-border hover:border-blue-400 hover:shadow-md transition-all duration-200"
                        >
                            {/* File Icon */}
                            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <i className={`${getFileIcon(file.type)} text-2xl text-white`}></i>
                            </div>
                            
                            {/* File Info */}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate text-foreground pr-8">
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatFileSize(file.size)}
                                    {file.type && (
                                        <span className="ml-1.5 px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium uppercase">
                                            {file.type.split('/')[1]?.slice(0, 4)}
                                        </span>
                                    )}
                                </p>
                                
                                {/* Upload Progress */}
                                {(isUploading || isCompleted) && (
                                    <div className="mt-2">
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full transition-all duration-300 ease-out ${
                                                    isCompleted 
                                                        ? 'bg-green-600' 
                                                        : 'bg-blue-600'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className={`text-[11px] font-semibold mt-1.5 ${
                                            isCompleted ? 'text-green-600 dark:text-green-500' : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                            {isCompleted ? '✓ Uploaded' : `Uploading... ${progress}%`}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={() => onRemoveAttachment(index)}
                                disabled={isUploading}
                                className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                                title="Remove attachment"
                            >
                                <i className="ri-close-line text-base"></i>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttachmentsList;
