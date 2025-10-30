import React from 'react';
import { Button } from '@/components/components/ui/button';

/**
 * ComposeActions - Bottom action bar with Send, Attach, and Discard buttons
 * Fixed to bottom right for better UX
 */
const ComposeActions = ({ 
    isSending,
    isUploading = false,
    onSend, 
    onAttach, 
    onDiscard,
    hasContent = true  // Default to true so button is enabled by default
}) => {
    return (
        <div className="px-4 py-3 bg-background">
            <div className="flex items-center justify-between">
                {/* Left side - Secondary actions */}
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onAttach}
                        disabled={isSending || isUploading}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <i className="ri-attachment-2 mr-2"></i>
                                Attach
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onDiscard}
                        disabled={isSending || isUploading}
                        className="text-muted-foreground hover:text-red-600"
                    >
                        <i className="ri-delete-bin-line mr-2"></i>
                        Discard
                    </Button>
                </div>

                {/* Right side - Primary action */}
                <Button
                    onClick={onSend}
                    disabled={isSending || isUploading || !hasContent}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    size="default"
                >
                    {isSending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Sending...
                        </>
                    ) : isUploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Uploading files...
                        </>
                    ) : (
                        <>
                            <i className="ri-send-plane-fill mr-2"></i>
                            Send Email
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default ComposeActions;
