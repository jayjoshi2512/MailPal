import React from 'react';
import { Card, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Textarea } from '@/components/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/components/ui/tabs';
import AttachmentsSection from './AttachmentsSection';

const AI_TONES = [
    { id: 'professional', label: 'Professional', icon: 'ri-briefcase-line' },
    { id: 'friendly', label: 'Friendly', icon: 'ri-emotion-happy-line' },
    { id: 'persuasive', label: 'Persuasive', icon: 'ri-megaphone-line' },
    { id: 'casual', label: 'Casual', icon: 'ri-chat-smile-line' },
    { id: 'urgent', label: 'Urgent', icon: 'ri-alarm-warning-line' },
];

const TemplateEditor = ({ 
    templateMode,
    setTemplateMode,
    selectedTone,
    setSelectedTone,
    aiPrompt,
    setAiPrompt,
    isGenerating,
    handleGenerate,
    variables,
    subject,
    setSubject,
    body,
    setBody,
    attachments,
    attachmentInputRef,
    isUploading,
    handleAttachmentUpload,
    removeAttachment,
    formatFileSize
}) => {
    const insertVariable = (v) => setBody(prev => prev + `{{${v}}}`);

    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
                <Tabs value={templateMode} onValueChange={setTemplateMode} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-9 mb-3">
                        <TabsTrigger value="ai"><i className="ri-magic-line mr-1.5"></i>AI</TabsTrigger>
                        <TabsTrigger value="manual"><i className="ri-edit-line mr-1.5"></i>Manual</TabsTrigger>
                    </TabsList>
                </Tabs>

                {templateMode === 'ai' && (
                    <div className="space-y-3 mb-3 pb-3 border-b">
                        <div className="flex flex-wrap gap-1.5">
                            {AI_TONES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTone(t.id)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                                        selectedTone === t.id ? 'bg-blue-600 text-white' : 'bg-muted hover:bg-muted/80'
                                    }`}
                                >
                                    <i className={`${t.icon} mr-1`}></i>{t.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="Describe your email purpose..."
                                className="text-sm h-9"
                            />
                            <Button 
                                size="sm" 
                                onClick={handleGenerate} 
                                disabled={isGenerating || !aiPrompt.trim()} 
                                className="h-9 px-4 shrink-0"
                            >
                                {isGenerating ? (
                                    <i className="ri-loader-4-line animate-spin"></i>
                                ) : (
                                    <><i className="ri-magic-line mr-1"></i>Generate</>
                                )}
                            </Button>
                        </div>
                        {/* AI Disclaimer */}
                        <div className="bg-muted/50 border rounded-lg p-2.5">
                            <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                                <i className="ri-error-warning-line text-xs mt-0.5 shrink-0"></i>
                                <span>
                                    <strong className="text-foreground">AI Disclaimer:</strong> We use a free-tier AI model. Generated content may not always be accurate. Please review and edit before sending.
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 items-center text-xs">
                        <span className="text-muted-foreground">Variables:</span>
                        {variables.map(v => (
                            <button 
                                key={v} 
                                onClick={() => insertVariable(v)} 
                                className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                            >
                                {`{{${v}}}`}
                            </button>
                        ))}
                    </div>
                    <Input 
                        value={subject} 
                        onChange={e => setSubject(e.target.value)} 
                        placeholder="Subject line" 
                        className="text-sm h-9" 
                    />
                    <Textarea 
                        value={body} 
                        onChange={e => setBody(e.target.value)} 
                        placeholder="Email body..." 
                        className="min-h-[180px] text-sm resize-none" 
                    />
                    
                    <AttachmentsSection
                        attachments={attachments}
                        attachmentInputRef={attachmentInputRef}
                        isUploading={isUploading}
                        handleAttachmentUpload={handleAttachmentUpload}
                        removeAttachment={removeAttachment}
                        formatFileSize={formatFileSize}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default TemplateEditor;
