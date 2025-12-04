import React from 'react';

const ProTips = () => {
    return (
        <>
            {/* Pro Tips */}
            <div className="mt-3 py-2 px-3 rounded border bg-muted/20 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                    <i className="ri-lightbulb-line text-amber-500"></i>
                    <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Variables:</span> Use {'{{name}}'}, {'{{company}}'} in Campaign templates. These are replaced with data from your CSV.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <i className="ri-file-list-3-line text-green-500"></i>
                    <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Templates:</span> Campaign templates have variables for bulk emails. Compose templates are plain text for one-off emails.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <i className="ri-attachment-line text-blue-500"></i>
                    <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Attachments:</span> Add up to 5 files (10MB each) in Campaigns.
                    </span>
                </div>
            </div>

            {/* AI Disclaimer */}
            <div className="mt-3 py-2.5 px-3 rounded border border-amber-500/30 bg-amber-500/5 text-xs">
                <div className="flex items-start gap-2">
                    <i className="ri-error-warning-line text-amber-500 mt-0.5"></i>
                    <div>
                        <span className="font-medium text-amber-600 dark:text-amber-400">AI Generation Disclaimer:</span>
                        <span className="text-muted-foreground ml-1">
                            We use a free-tier AI model to generate email templates. The generated content may not always be accurate or perfectly suited for your needs. 
                            <strong className="text-foreground"> Always review and edit AI-generated content before sending.</strong>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProTips;
