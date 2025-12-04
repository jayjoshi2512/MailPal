import React from 'react';
import { Button } from '@/components/components/ui/button';

const AttachmentsSection = ({ 
    attachments, 
    attachmentInputRef, 
    isUploading, 
    handleAttachmentUpload, 
    removeAttachment, 
    formatFileSize 
}) => {
    return (
        <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Attachments ({attachments.length}/5)</span>
                <input
                    ref={attachmentInputRef}
                    type="file"
                    multiple
                    onChange={handleAttachmentUpload}
                    className="hidden"
                />
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => attachmentInputRef.current?.click()}
                    disabled={isUploading || attachments.length >= 5}
                >
                    {isUploading ? (
                        <><i className="ri-loader-4-line animate-spin mr-1"></i>Uploading...</>
                    ) : (
                        <><i className="ri-attachment-2 mr-1"></i>Add Files</>
                    )}
                </Button>
            </div>
            {attachments.length > 0 && (
                <div className="space-y-1">
                    {attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded text-xs">
                            <i className="ri-file-line text-muted-foreground"></i>
                            <span className="truncate flex-1">{att.originalName}</span>
                            <span className="text-muted-foreground">{formatFileSize(att.size)}</span>
                            <button onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-600">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentsSection;
