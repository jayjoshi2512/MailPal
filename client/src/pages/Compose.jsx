import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Input } from '@/components/components/ui/input';
import { Textarea } from '@/components/components/ui/textarea';
import { Button } from '@/components/components/ui/button';
import { Badge } from '@/components/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import EmailRecipients from '@/components/Compose/EmailRecipients';
import AttachmentsList from '@/components/Compose/AttachmentsList';
import ComposeActions from '@/components/Compose/ComposeActions';
import DiscardModal from '@/components/Compose/DiscardModal';
import ContactsSidebar from '@/components/Compose/ContactsSidebar';
import RichTextEditor from '@/components/Compose/RichTextEditor';
import SendProgressCard from '@/components/CampaignDetail/SendProgressCard';
import { useEmailRecipients, useAttachments } from '@/components/Compose/useComposeForm';
import { formatFileSize } from '@/components/Compose/emailUtils';
import { emailAPI, aiAPI } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/components/ui/dialog';

/**
 * Enhanced Compose Page - Production-ready email composition
 * Features:
 * - File upload with progress tracking
 * - Toast notifications
 * - Optimized performance
 * - Better error handling
 * - Auto-save draft (TODO)
 */
const ComposeEnhanced = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Email recipients management
    const {
        to,
        toEmails,
        suggestions,
        showSuggestions,
        handleToChange,
        addEmail,
        removeEmail,
        handleToKeyDown,
        selectSuggestion,
        clearRecipients
    } = useEmailRecipients();

    // File attachments management
    const {
        attachments,
        addAttachments,
        removeAttachment,
        clearAttachments
    } = useAttachments();

    // Form state
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    
    // AI Generation State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiTone, setAiTone] = useState('professional');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    
    // Email sending progress state (for bulk emails)
    const [sendingProgress, setSendingProgress] = useState(null);
    // { jobId, status, total, sent, failed, progress, errors }
    
    // History state
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyPagination, setHistoryPagination] = useState({ total: 0, totalPages: 0 });
    const [selectedEmail, setSelectedEmail] = useState(null);

    // AI Generation Handler
    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Please describe what you want to write');
            return;
        }

        setIsGeneratingAi(true);
        try {
            const res = await aiAPI.generateTemplate(aiPrompt, aiTone, []);
            if (res.success && res.data) {
                setSubject(res.data.subject || '');
                setBody(res.data.body || '');
                setShowAiModal(false);
                toast.success('Email generated successfully!');
            } else {
                throw new Error(res.error || 'Generation failed');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to generate email');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    // Fetch compose history
    const fetchHistory = useCallback(async (page = 1, search = '') => {
        setHistoryLoading(true);
        try {
            const result = await emailAPI.getComposeHistory({ page, limit: 10, search });
            if (result.success) {
                setHistory(result.data.emails);
                setHistoryPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    // Load history when section opens
    useEffect(() => {
        if (showHistory) {
            fetchHistory(historyPage, historySearch);
        }
    }, [showHistory, historyPage, historySearch, fetchHistory]);

    // Refresh history after sending
    const refreshHistory = useCallback(() => {
        if (showHistory) {
            fetchHistory(1, historySearch);
            setHistoryPage(1);
        }
    }, [showHistory, historySearch, fetchHistory]);

    // Check if form has content (for enabling send button)
    const hasContent = toEmails.length > 0 && subject.trim().length > 0 && body.trim().length > 0;

    // Handle logout
    const handleLogout = useCallback(() => {
        logout();
        navigate('/', { replace: true });
    }, [logout, navigate]);

    // Handle file selection - files kept in browser memory only (no server upload)
    const handleFileChange = useCallback(async (e) => {
        const files = Array.from(e.target.files || []);
        
        if (files.length === 0) return;

        // Validate file sizes
        const maxSize = 25 * 1024 * 1024; // 25MB
        const oversizedFiles = files.filter(f => f.size > maxSize);
        
        if (oversizedFiles.length > 0) {
            toast.error(`Some files exceed 25MB limit and were not added`);
            return;
        }

        // Validate total attachments count
        if (attachments.length + files.length > 10) {
            toast.error('Maximum 10 attachments allowed');
            return;
        }

        // Add files to local state (kept in browser memory, NOT uploaded to server)
        addAttachments(files);
        toast.success(`${files.length} file(s) added`);

        // Reset input
        e.target.value = '';
    }, [attachments.length, addAttachments]);

    // Trigger file input
    const handleAttachClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Remove attachment
    const handleRemoveAttachment = useCallback((index) => {
        removeAttachment(index);
        toast.info('Attachment removed');
    }, [removeAttachment, toast]);

    // Discard draft
    const handleDiscard = useCallback(() => {
        setShowDiscardModal(true);
    }, []);

    const confirmDiscard = useCallback(() => {
        clearRecipients();
        setSubject('');
        setBody('');
        clearAttachments();
        setShowDiscardModal(false);
        toast.info('Draft discarded');
    }, [clearRecipients, clearAttachments, toast]);

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Get base64 string without the data:...;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    // Send email with comprehensive error handling
    const handleSendEmail = useCallback(async () => {
        // Validation
        if (toEmails.length === 0) {
            toast.error('Please add at least one recipient');
            return;
        }

        if (!subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        if (!body.trim()) {
            toast.error('Please enter an email message');
            return;
        }

        setIsSending(true);
        setSendingProgress(null);

        try {
            // Convert attachments to base64 (files stay in browser memory only)
            const attachmentsWithBase64 = await Promise.all(
                attachments.map(async (file) => ({
                    filename: file.name,
                    mimetype: file.type,
                    size: file.size,
                    content: await fileToBase64(file)
                }))
            );

            // Prepare email data with base64 attachments
            const emailData = {
                to: toEmails,
                subject,
                body,
                attachments: attachmentsWithBase64,
            };

            // Send email via backend API
            const result = await emailAPI.send(emailData);

            // Check if it's a background job (bulk emails)
            if (result.success && result.data.jobId) {
                // Bulk email - show progress bar UI
                const jobId = result.data.jobId;
                const totalEmails = result.data.total;
                
                // Initialize progress state
                setSendingProgress({
                    jobId,
                    status: 'processing',
                    total: totalEmails,
                    sent: 0,
                    failed: 0,
                    progress: 0,
                    errors: []
                });
                
                // Poll for job status
                try {
                    const finalResult = await emailAPI.pollJobUntilComplete(jobId, (progress) => {
                        // Update progress bar UI
                        setSendingProgress({
                            jobId,
                            status: progress.status,
                            total: progress.total,
                            sent: progress.sent,
                            failed: progress.failed,
                            progress: progress.progress,
                            errors: progress.errors || []
                        });
                    });

                    // Final result
                    setSendingProgress(prev => ({
                        ...prev,
                        status: 'completed',
                        sent: finalResult.sent,
                        failed: finalResult.failed,
                        progress: 100
                    }));

                    if (finalResult.sent > 0) {
                        toast.success(`✅ ${finalResult.sent} emails sent successfully${finalResult.failed > 0 ? `, ${finalResult.failed} failed` : ''}`);
                    } else {
                        toast.error(`Failed to send emails. ${finalResult.errors?.[0]?.error || 'Unknown error'}`);
                    }

                    // Clear form after short delay to show completion
                    setTimeout(() => {
                        clearRecipients();
                        setSubject('');
                        setBody('');
                        clearAttachments();
                        setSendingProgress(null);
                        refreshHistory();
                        navigate('/dashboard');
                    }, 2000);
                    
                } catch (pollError) {
                    console.error('Poll error:', pollError);
                    setSendingProgress(prev => ({
                        ...prev,
                        status: 'error',
                        error: 'Lost connection to server. Emails may still be sending in the background.'
                    }));
                    toast.info('Emails are being sent in the background. Check your dashboard for status.');
                }
                
            } else if (result.success) {
                // Single email - immediate success
                toast.success(`Email sent to ${toEmails[0]}`);
                
                // Clear form
                clearRecipients();
                setSubject('');
                setBody('');
                clearAttachments();
                
                // Refresh history
                refreshHistory();

                // Navigate to dashboard after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to send email');
            }

        } catch (error) {
            console.error('Failed to send email:', error);
            toast.error(error.message || 'Failed to send email. Please try again.');
            setSendingProgress(null);
        } finally {
            setIsSending(false);
        }
    }, [toEmails, subject, body, attachments, clearRecipients, clearAttachments, navigate, refreshHistory]);

    // Handle contact selection from sidebar
    const handleContactSelect = useCallback((contact) => {
        // Add email to the "to" field if not already added
        if (!toEmails.includes(contact.email)) {
            addEmail(contact.email);
            toast.success(`Added ${contact.name || contact.email} to recipients`);
        } else {
            toast.info('Contact already added');
        }
    }, [toEmails, addEmail]);

    // Handle contact removal from sidebar - dynamically remove from recipients
    const handleContactRemove = useCallback((email) => {
        if (toEmails.includes(email)) {
            removeEmail(email);
            toast.info(`Removed ${email} from recipients`);
        }
    }, [toEmails, removeEmail]);

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            
            {/* Main content - centered between left sidebar (64) and right sidebar (72) */}
            <main className="ml-64 mr-72 mt-16 p-4 flex-1">
                <div className="max-w-2xl mx-auto">
                    {/* Email Sending Progress Bar - Consistent with Campaign page */}
                    {sendingProgress && (
                        <SendProgressCard sendProgress={{
                            sent: sendingProgress.sent,
                            failed: sendingProgress.failed,
                            total: sendingProgress.total
                        }} />
                    )}

                    {/* Status indicator - only show when sending single email */}
                    {isSending && !sendingProgress && (
                        <div className="flex items-center justify-end mb-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                    Sending...
                                </span>
                            </div>
                        </div>
                    )}

                    <Card className="shadow-sm border-border/60">
                        <CardContent className="p-0">
                            {/* From (Read-only) - No label, compact */}
                            <div className="px-4 pt-4">
                                <Input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    disabled
                                    className="bg-muted/30 cursor-not-allowed border-0 text-sm h-9 shadow-none"
                                    placeholder="From"
                                />
                            </div>

                            {/* Separator */}
                            <div className="border-t border-border/50 my-1"></div>

                            {/* Recipients - No label */}
                            <div className="px-4">
                                <EmailRecipients
                                    to={to}
                                    toEmails={toEmails}
                                    suggestions={suggestions}
                                    showSuggestions={showSuggestions}
                                    onToChange={handleToChange}
                                    onAddEmail={addEmail}
                                    onRemoveEmail={removeEmail}
                                    onToKeyDown={handleToKeyDown}
                                    onSelectSuggestion={selectSuggestion}
                                />
                            </div>

                            {/* Separator */}
                            <div className="border-t border-border/50 my-1"></div>

                            {/* Subject - No label, no counter */}
                            <div className="px-4 flex items-center gap-2">
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Subject"
                                    maxLength={150}
                                    className="text-sm h-9 border-0 shadow-none focus-visible:ring-0 flex-1"
                                />
                                <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <i className="ri-magic-line mr-1"></i>
                                            AI Write
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <i className="ri-magic-line text-blue-600"></i>
                                                Write with AI
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">What would you like to write?</label>
                                                <Textarea 
                                                    placeholder="E.g., Write a follow-up email for a job application..." 
                                                    value={aiPrompt}
                                                    onChange={(e) => setAiPrompt(e.target.value)}
                                                    className="min-h-[100px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Tone</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['professional', 'friendly', 'persuasive', 'casual', 'urgent'].map(tone => (
                                                        <button
                                                            key={tone}
                                                            onClick={() => setAiTone(tone)}
                                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                                                                aiTone === tone 
                                                                    ? 'bg-blue-600 text-white border-blue-600' 
                                                                    : 'bg-background hover:bg-muted border-input'
                                                            }`}
                                                        >
                                                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={handleAiGenerate} 
                                                disabled={isGeneratingAi || !aiPrompt.trim()}
                                                className="w-full"
                                            >
                                                {isGeneratingAi ? (
                                                    <><i className="ri-loader-4-line animate-spin mr-2"></i>Generating...</>
                                                ) : (
                                                    <><i className="ri-magic-line mr-2"></i>Generate Email</>
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Separator */}
                            <div className="border-t border-border/50 my-1"></div>

                            {/* Message Body - No label, no counter */}
                            <div className="px-4 pb-4">
                                <RichTextEditor
                                    value={body}
                                    onChange={setBody}
                                    placeholder="Compose your message..."
                                    className="border-0 shadow-none min-h-[300px]"
                                />
                            </div>

                            {/* Attachments - More compact */}
                            {attachments.length > 0 && (
                                <div className="px-4 py-3 border-t border-border/50">
                                    <AttachmentsList
                                        attachments={attachments}
                                        onRemoveAttachment={handleRemoveAttachment}
                                        formatFileSize={formatFileSize}
                                    />
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                            />

                            {/* Actions */}
                            <div className={attachments.length === 0 ? "border-t border-border/50" : ""}>
                                <ComposeActions
                                    onSend={handleSendEmail}
                                    onAttach={handleAttachClick}
                                    onDiscard={handleDiscard}
                                    isSending={isSending}
                                    hasContent={hasContent}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Section */}
                    <div className="mt-4">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <i className="ri-history-line text-blue-500"></i>
                                <span className="text-sm font-medium">Sent History</span>
                                {historyPagination.total > 0 && (
                                    <Badge variant="secondary" className="text-xs">{historyPagination.total}</Badge>
                                )}
                            </div>
                            <i className={`ri-arrow-${showHistory ? 'up' : 'down'}-s-line text-muted-foreground`}></i>
                        </button>

                        {showHistory && (
                            <Card className="mt-2 shadow-sm">
                                <CardContent className="p-3">
                                    {/* Search */}
                                    <div className="mb-3">
                                        <div className="relative">
                                            <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
                                            <Input
                                                placeholder="Search by subject or recipient..."
                                                value={historySearch}
                                                onChange={(e) => {
                                                    setHistorySearch(e.target.value);
                                                    setHistoryPage(1);
                                                }}
                                                className="pl-8 h-8 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Email List */}
                                    {historyLoading ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="p-3 rounded-lg bg-muted/50 animate-pulse">
                                                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : history.length > 0 ? (
                                        <>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                                                {history.map((email) => (
                                                    <div
                                                        key={email.id}
                                                        onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                            selectedEmail?.id === email.id 
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                : 'border-border/50 hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{email.subject || 'No Subject'}</p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    To: {email.recipientName ? `${email.recipientName} <${email.recipientEmail}>` : email.recipientEmail}
                                                                </p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <Badge variant="outline" className="text-[9px] bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                                                    {email.status}
                                                                </Badge>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                    {new Date(email.sentAt).toLocaleDateString('en-US', { 
                                                                        month: 'short', 
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Expanded View */}
                                                        {selectedEmail?.id === email.id && (
                                                            <div className="mt-3 pt-3 border-t border-border/50">
                                                                <div className="text-xs text-muted-foreground mb-2">Message:</div>
                                                                <div 
                                                                    className="text-xs bg-muted/30 p-2 rounded max-h-[150px] overflow-y-auto scrollbar-hide"
                                                                    dangerouslySetInnerHTML={{ __html: email.body?.replace(/\n/g, '<br>') || 'No content' }}
                                                                />
                                                                <div className="flex gap-2 mt-3">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs h-7"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            addEmail(email.recipientEmail);
                                                                            setSubject(`Re: ${email.subject}`);
                                                                            toast.success('Reply started');
                                                                            setSelectedEmail(null);
                                                                            setShowHistory(false);
                                                                        }}
                                                                    >
                                                                        <i className="ri-reply-line mr-1"></i>
                                                                        Reply
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs h-7"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSubject(`Fwd: ${email.subject}`);
                                                                            setBody(`\n\n---------- Forwarded message ----------\nFrom: ${user?.email}\nTo: ${email.recipientEmail}\nSubject: ${email.subject}\n\n${email.body || ''}`);
                                                                            toast.success('Message ready to forward');
                                                                            setSelectedEmail(null);
                                                                            setShowHistory(false);
                                                                        }}
                                                                    >
                                                                        <i className="ri-share-forward-line mr-1"></i>
                                                                        Forward
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {historyPagination.totalPages > 1 && (
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                                    <span className="text-xs text-muted-foreground">
                                                        Page {historyPage} of {historyPagination.totalPages}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 p-0"
                                                            disabled={historyPage === 1}
                                                            onClick={() => setHistoryPage(p => p - 1)}
                                                        >
                                                            <i className="ri-arrow-left-s-line"></i>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 p-0"
                                                            disabled={historyPage === historyPagination.totalPages}
                                                            onClick={() => setHistoryPage(p => p + 1)}
                                                        >
                                                            <i className="ri-arrow-right-s-line"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <i className="ri-mail-line text-3xl mb-2 opacity-50"></i>
                                            <p className="text-sm">No sent emails yet</p>
                                            <p className="text-xs">Your sent emails will appear here</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Contacts Sidebar with dynamic removal */}
            <ContactsSidebar 
                onContactSelect={handleContactSelect}
                onContactRemove={handleContactRemove}
            />

            {/* Discard Confirmation Modal */}
            <DiscardModal
                isOpen={showDiscardModal}
                onClose={() => setShowDiscardModal(false)}
                onConfirm={confirmDiscard}
            />
        </div>
    );
};

export default ComposeEnhanced;
