import React, { useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Input } from '@/components/components/ui/input';
import { Textarea } from '@/components/components/ui/textarea';
import { Button } from '@/components/components/ui/button';
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
import { useEmailRecipients, useAttachments } from '@/components/Compose/useComposeForm';
import { formatFileSize } from '@/components/Compose/emailUtils';
import { uploadAPI, emailAPI } from '@/services/api';

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
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]); // Store uploaded file metadata with server paths
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    // Check if form has content (for enabling send button)
    const hasContent = toEmails.length > 0 && subject.trim().length > 0 && body.trim().length > 0;

    // Handle logout
    const handleLogout = useCallback(() => {
        logout();
        navigate('/', { replace: true });
    }, [logout, navigate]);

    // Handle file selection with immediate upload (like Gmail)
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

        // Add files to local state for immediate UI feedback
        const startIndex = attachments.length;
        addAttachments(files);

        // Initialize progress for each file
        const initialProgress = {};
        files.forEach((_, idx) => {
            initialProgress[startIndex + idx] = 0;
        });
        setUploadProgress(initialProgress);

        // Upload files immediately (like Gmail)
        setIsUploading(true);
        
        try {
            // Upload files one by one with individual progress tracking
            const uploadedFilesList = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const progressIndex = startIndex + i;
                
                try {
                    const uploadResult = await uploadAPI.uploadSingle(file, (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(prev => ({
                            ...prev,
                            [progressIndex]: percentCompleted
                        }));
                    });
                    
                    if (uploadResult.success && uploadResult.data.file) {
                        uploadedFilesList.push(uploadResult.data.file);
                        // Mark as complete
                        setUploadProgress(prev => ({
                            ...prev,
                            [progressIndex]: 100
                        }));
                    }
                } catch (fileError) {
                    console.error(`Failed to upload ${file.name}:`, fileError);
                    toast.error(`Failed to upload ${file.name}`);
                    // Remove failed file
                    removeAttachment(progressIndex);
                }
            }
            
            if (uploadedFilesList.length > 0) {
                // Store uploaded file metadata
                setUploadedFiles(prev => [...prev, ...uploadedFilesList]);
                toast.success(`${uploadedFilesList.length} file(s) uploaded successfully`);
                
                // Clear progress after a short delay
                setTimeout(() => {
                    setUploadProgress({});
                }, 1000);
            }
        } catch (uploadError) {
            console.error('Failed to upload files:', uploadError);
            toast.error('Failed to upload files. Please try again.');
        } finally {
            setIsUploading(false);
        }

        // Reset input
        e.target.value = '';
    }, [attachments.length, addAttachments, removeAttachment, toast]);

    // Trigger file input
    const handleAttachClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Remove attachment
    const handleRemoveAttachment = useCallback((index) => {
        removeAttachment(index);
        // Also remove from uploadedFiles
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
        setUploadedFiles([]);
        setShowDiscardModal(false);
        toast.info('Draft discarded');
    }, [clearRecipients, clearAttachments, toast]);

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

        // Check if files are still uploading
        if (isUploading) {
            toast.error('Please wait for file uploads to complete');
            return;
        }

        setIsSending(true);

        try {
            // Prepare email data with already uploaded files
            const emailData = {
                to: toEmails,
                subject,
                body,
                attachments: uploadedFiles.map(file => ({
                    filename: file.name,
                    path: file.path,
                    size: file.size,
                })),
            };

            // Send email via backend API
            const result = await emailAPI.send(emailData);

            // Success
            if (result.success) {
                // Smart toast message based on recipient count
                let successMessage;
                if (toEmails.length === 1) {
                    successMessage = `Email sent to ${toEmails[0]}`;
                } else {
                    successMessage = `Email sent to ${result.data.sent} recipients`;
                }
                toast.success(successMessage);
                
                // Clear form
                clearRecipients();
                setSubject('');
                setBody('');
                clearAttachments();
                setUploadedFiles([]);

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
        } finally {
            setIsSending(false);
        }
    }, [toEmails, subject, body, uploadedFiles, isUploading, clearRecipients, clearAttachments, navigate]);

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
            <Navbar onLogout={handleLogout} />
            <Sidebar />
            
            {/* Main content with proper spacing for fixed sidebar */}
            <main className="ml-64 mt-16 p-4 flex-1 mr-80">
                <div className="max-w-3xl mx-auto">
                    {/* Status indicator - only show when needed */}
                    {(isSending || isUploading) && (
                        <div className="flex items-center justify-end mb-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                    {isUploading ? 'Uploading...' : 'Sending...'}
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
                            <div className="px-4">
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Subject"
                                    maxLength={150}
                                    className="text-sm h-9 border-0 shadow-none focus-visible:ring-0"
                                />
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
                                <div className="px-4 pb-4 border-t border-border/50">
                                    <div className="text-xs font-semibold text-muted-foreground mb-2 mt-3">
                                        Attachments ({attachments.length})
                                    </div>
                                    <AttachmentsList
                                        attachments={attachments}
                                        onRemoveAttachment={handleRemoveAttachment}
                                        formatFileSize={formatFileSize}
                                        uploadProgress={uploadProgress}
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
                                    isUploading={isUploading}
                                    hasContent={hasContent}
                                />
                            </div>
                        </CardContent>
                    </Card>
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
