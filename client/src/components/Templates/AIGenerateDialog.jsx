import React from 'react';
import { Button } from '@/components/components/ui/button';
import { Textarea } from '@/components/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';

const AIGenerateDialog = ({ 
    open, 
    onOpenChange, 
    aiPrompt, 
    setAiPrompt, 
    aiTone, 
    setAiTone, 
    aiCategory, 
    setAiCategory, 
    onGenerate, 
    isGenerating 
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <i className="ri-magic-line"></i>
                        Generate with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe what kind of email template you need
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-xs font-medium mb-1.5 block">Template Type</label>
                        <select
                            value={aiCategory}
                            onChange={(e) => setAiCategory(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                        >
                            <option value="campaign">Campaign (with variables for bulk sending)</option>
                            <option value="compose">Compose (simple text for one-off emails)</option>
                        </select>
                    </div>
                    
                    {/* Type-specific information */}
                    {aiCategory === 'campaign' ? (
                        <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-3">
                            <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-1.5">
                                <i className="ri-braces-line"></i>
                                Campaign Template Variables
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                                AI will automatically include <code className="bg-muted px-1 rounded">{"{{variable}}"}</code> placeholders 
                                that will be replaced with values from your CSV file when sending emails.
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-[10px] text-muted-foreground">Common variables:</span>
                                {['name', 'company', 'position', 'first_name'].map(v => (
                                    <span key={v} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                                        {`{{${v}}}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                                <i className="ri-mail-line"></i>
                                Compose Template (Simple)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                AI will generate a complete email with placeholder text like [RECIPIENT NAME] that you can 
                                manually replace. No variables — ready for one-off emails.
                            </p>
                        </div>
                    )}
                    
                    <div>
                        <label className="text-xs font-medium mb-1.5 block">Tone</label>
                        <select
                            value={aiTone}
                            onChange={(e) => setAiTone(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                        >
                            <option value="professional">Professional</option>
                            <option value="friendly">Friendly</option>
                            <option value="formal">Formal</option>
                            <option value="casual">Casual</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block">Describe your email *</label>
                        <Textarea
                            placeholder={aiCategory === 'campaign' 
                                ? "e.g., A cold outreach email to hiring managers about our recruitment services"
                                : "e.g., A job application email for a software developer position, highlighting my React and Node.js experience"
                            }
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={4}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                            💡 Be specific about the purpose, target audience, and any details you want included.
                        </p>
                    </div>
                    
                    {/* AI Disclaimer */}
                    <div className="bg-muted/50 border rounded-lg p-3">
                        <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                            <i className="ri-error-warning-line"></i>
                            AI Disclaimer
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            We use a free-tier AI model to generate emails. The generated content may not always be accurate or perfectly suited for your needs. 
                            <strong className="text-foreground"> Please review and edit the content before sending.</strong>
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <><i className="ri-loader-4-line animate-spin mr-2"></i>Generating...</>
                        ) : (
                            <><i className="ri-magic-line mr-2"></i>Generate</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AIGenerateDialog;
