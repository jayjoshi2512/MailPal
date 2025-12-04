import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { campaignsAPI, aiAPI, uploadAPI } from '@/services/api';
import { 
    StepIndicator, 
    FileUploadStep, 
    ConfigureStep, 
    TemplateEditor, 
    PreviewPanel 
} from '@/components/NewCampaign';
import * as XLSX from 'xlsx';

// Parse CSV/Excel file
const parseFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = file.name.endsWith('.csv') 
                    ? XLSX.read(data, { type: 'string' })
                    : XLSX.read(data, { type: 'array' });
                
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                if (jsonData.length < 2) {
                    reject(new Error('File must have headers and at least one data row'));
                    return;
                }
                
                const headers = jsonData[0].map(h => String(h).trim());
                const records = jsonData.slice(1)
                    .filter(row => row.some(cell => cell !== undefined && cell !== ''))
                    .map(row => {
                        const record = {};
                        headers.forEach((h, i) => record[h] = row[i] !== undefined ? String(row[i]).trim() : '');
                        return record;
                    });
                
                resolve({ headers, records });
            } catch (err) {
                reject(new Error('Failed to parse file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        file.name.endsWith('.csv') ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    });
};

const NewCampaign = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const attachmentInputRef = useRef(null);
    
    // Step state
    const [step, setStep] = useState(1);
    
    // Step 1 state
    const [campaignName, setCampaignName] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileData, setFileData] = useState({ headers: [], records: [] });
    
    // Step 2 state
    const [emailColumn, setEmailColumn] = useState('');
    const [variables, setVariables] = useState([]);
    
    // Step 3 state
    const [templateMode, setTemplateMode] = useState('ai');
    const [selectedTone, setSelectedTone] = useState('professional');
    const [aiPrompt, setAiPrompt] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!['.csv', '.xlsx', '.xls'].some(ext => file.name.toLowerCase().endsWith(ext))) {
            toast.error('Please upload a CSV or Excel file');
            return;
        }
        
        try {
            toast.loading('Parsing...', { id: 'parse' });
            const { headers, records } = await parseFile(file);
            
            if (records.length === 0) {
                toast.error('No data found', { id: 'parse' });
                return;
            }
            
            const emailCol = headers.find(h => h.toLowerCase().includes('email'));
            setUploadedFile(file);
            setFileData({ headers, records });
            setEmailColumn(emailCol || '');
            setVariables(headers.filter(h => h !== emailCol));
            toast.success(`${records.length} contacts loaded`, { id: 'parse' });
        } catch (err) {
            toast.error(err.message, { id: 'parse' });
        }
        e.target.value = '';
    };

    const handleGenerate = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Describe your email purpose');
            return;
        }
        
        setIsGenerating(true);
        try {
            const res = await aiAPI.generateTemplate(aiPrompt, selectedTone, variables);
            if (res.success && res.data) {
                setSubject(res.data.subject || '');
                setBody(res.data.body || '');
                toast.success('Template generated!');
            } else {
                throw new Error(res.error || 'Generation failed');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to generate. Try again or write manually.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAttachmentUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        
        if (attachments.length + files.length > 5) {
            toast.error('Maximum 5 attachments allowed');
            return;
        }
        
        setIsUploading(true);
        try {
            for (const file of files) {
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} is too large (max 10MB)`);
                    continue;
                }
                
                const result = await uploadAPI.uploadSingle(file);
                if (result.success) {
                    setAttachments(prev => [...prev, {
                        filename: result.data.filename,
                        originalName: file.name,
                        size: file.size,
                        path: result.data.path
                    }]);
                }
            }
            toast.success('Attachments uploaded');
        } catch (err) {
            toast.error('Failed to upload attachments');
        } finally {
            setIsUploading(false);
            if (attachmentInputRef.current) attachmentInputRef.current.value = '';
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleCreate = async () => {
        if (!campaignName.trim() || !emailColumn || !subject.trim() || !body.trim()) {
            toast.error('Please complete all fields');
            return;
        }
        
        setIsCreating(true);
        try {
            const res = await campaignsAPI.create({ 
                name: campaignName, 
                subject, 
                body,
                attachments: attachments.length > 0 ? attachments : null,
            });
            
            if (!res.success) throw new Error('Failed to create campaign');
            
            const recipients = fileData.records.map(r => ({
                email: r[emailColumn],
                variables: r,
            }));
            sessionStorage.setItem(`campaign_${res.data.campaign.id}_recipients`, JSON.stringify(recipients));
            
            toast.success(`Campaign created with ${recipients.length} recipients!`);
            navigate(`/campaigns/${res.data.campaign.id}`);
        } catch (err) {
            toast.error(err.message || 'Failed to create campaign');
        } finally {
            setIsCreating(false);
        }
    };

    const preview = (text) => {
        if (!text || !fileData.records[0]) return text;
        return text.replace(/\{\{(\w+)\}\}/g, (_, k) => fileData.records[0][k] ?? `{{${k}}}`);
    };

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
                            <i className="ri-arrow-left-line text-lg"></i>
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">New Campaign</h1>
                            <p className="text-xs text-muted-foreground">Create personalized cold emails</p>
                        </div>
                    </div>

                    <StepIndicator currentStep={step} onStepClick={setStep} />

                    {step === 1 && (
                        <FileUploadStep 
                            campaignName={campaignName}
                            setCampaignName={setCampaignName}
                            uploadedFile={uploadedFile}
                            fileData={fileData}
                            fileInputRef={fileInputRef}
                            handleFileUpload={handleFileUpload}
                            onNext={() => setStep(2)}
                        />
                    )}

                    {step === 2 && (
                        <ConfigureStep 
                            emailColumn={emailColumn}
                            setEmailColumn={setEmailColumn}
                            variables={variables}
                            setVariables={setVariables}
                            fileData={fileData}
                            onBack={() => setStep(1)}
                            onNext={() => setStep(3)}
                        />
                    )}

                    {step === 3 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <TemplateEditor 
                                    templateMode={templateMode}
                                    setTemplateMode={setTemplateMode}
                                    selectedTone={selectedTone}
                                    setSelectedTone={setSelectedTone}
                                    aiPrompt={aiPrompt}
                                    setAiPrompt={setAiPrompt}
                                    isGenerating={isGenerating}
                                    handleGenerate={handleGenerate}
                                    variables={variables}
                                    subject={subject}
                                    setSubject={setSubject}
                                    body={body}
                                    setBody={setBody}
                                    attachments={attachments}
                                    attachmentInputRef={attachmentInputRef}
                                    isUploading={isUploading}
                                    handleAttachmentUpload={handleAttachmentUpload}
                                    removeAttachment={removeAttachment}
                                    formatFileSize={formatFileSize}
                                />
                                <PreviewPanel 
                                    subject={subject}
                                    body={body}
                                    fileData={fileData}
                                    preview={preview}
                                />
                            </div>
                            <div className="flex justify-between pt-1">
                                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                                    <i className="ri-arrow-left-line mr-1"></i>Back
                                </Button>
                                <Button size="sm" onClick={handleCreate} disabled={isCreating || !subject.trim() || !body.trim()}>
                                    {isCreating ? (
                                        <><i className="ri-loader-4-line animate-spin mr-1"></i>Creating...</>
                                    ) : (
                                        <><i className="ri-rocket-line mr-1"></i>Launch Campaign</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NewCampaign;
