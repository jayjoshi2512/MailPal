import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Textarea } from '@/components/components/ui/textarea';
import { Badge } from '@/components/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { campaignsAPI, contactsAPI, aiAPI } from '@/services/api';
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

const AI_TONES = [
    { id: 'professional', label: 'Professional', icon: 'ri-briefcase-line' },
    { id: 'friendly', label: 'Friendly', icon: 'ri-emotion-happy-line' },
    { id: 'persuasive', label: 'Persuasive', icon: 'ri-megaphone-line' },
    { id: 'casual', label: 'Casual', icon: 'ri-chat-smile-line' },
    { id: 'urgent', label: 'Urgent', icon: 'ri-alarm-warning-line' },
];

const NewCampaign = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [step, setStep] = useState(1);
    const [campaignName, setCampaignName] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileData, setFileData] = useState({ headers: [], records: [] });
    const [emailColumn, setEmailColumn] = useState('');
    const [variables, setVariables] = useState([]);
    
    const [templateMode, setTemplateMode] = useState('ai');
    const [selectedTone, setSelectedTone] = useState('professional');
    const [aiPrompt, setAiPrompt] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleLogout = useCallback(() => {
        logout();
        navigate('/', { replace: true });
    }, [logout, navigate]);

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

    const insertVariable = (v) => setBody(prev => prev + `{{${v}}}`);

    const handleCreate = async () => {
        if (!campaignName.trim() || !emailColumn || !subject.trim() || !body.trim()) {
            toast.error('Please complete all fields');
            return;
        }
        
        setIsCreating(true);
        try {
            // Create campaign in DB (just metadata)
            const res = await campaignsAPI.create({ 
                name: campaignName, 
                subject, 
                body,
            });
            
            if (!res.success) throw new Error('Failed to create campaign');
            
            // Store recipients in sessionStorage for the campaign detail page
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
            <Navbar onLogout={handleLogout} />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className={step === 3 ? '' : 'max-w-3xl mx-auto'}>
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

                    {/* Steps */}
                    <div className={`flex items-center gap-1 mb-6 text-sm ${step === 3 ? 'max-w-3xl' : ''}`}>
                        {['Upload', 'Configure', 'Template'].map((s, i) => (
                            <React.Fragment key={s}>
                                <button
                                    onClick={() => i + 1 < step && setStep(i + 1)}
                                    disabled={i + 1 > step}
                                    className={`px-3 py-1 rounded-full font-medium transition-colors ${
                                        i + 1 === step ? 'bg-blue-600 text-white' :
                                        i + 1 < step ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 cursor-pointer' :
                                        'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {i + 1 < step ? <i className="ri-check-line"></i> : i + 1}. {s}
                                </button>
                                {i < 2 && <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-blue-600' : 'bg-muted'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Upload Contacts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Campaign Name *</label>
                                    <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g., Q4 Outreach" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Contact File *</label>
                                    <div 
                                        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${uploadedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'hover:border-blue-400'}`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                                        {uploadedFile ? (
                                            <>
                                                <i className="ri-file-excel-2-line text-xl text-green-600"></i>
                                                <p className="font-medium text-green-600 text-sm">{uploadedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{fileData.records.length} contacts</p>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-upload-cloud-2-line text-xl text-muted-foreground"></i>
                                                <p className="text-sm font-medium">Click to upload</p>
                                                <p className="text-xs text-muted-foreground">CSV, XLSX</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {fileData.headers.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden max-h-32 overflow-auto text-xs">
                                        <table className="w-full">
                                            <thead className="bg-muted sticky top-0">
                                                <tr>{fileData.headers.map((h, i) => <th key={i} className="px-2 py-1 text-left">{h}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {fileData.records.slice(0, 2).map((r, i) => (
                                                    <tr key={i} className="border-t">{fileData.headers.map((h, j) => <td key={j} className="px-2 py-1 truncate max-w-24">{r[h]}</td>)}</tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <Button onClick={() => setStep(2)} disabled={!uploadedFile || !campaignName.trim()}>
                                        Next <i className="ri-arrow-right-line ml-1"></i>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Configure</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email Column *</label>
                                    <select
                                        value={emailColumn}
                                        onChange={e => { setEmailColumn(e.target.value); setVariables(fileData.headers.filter(h => h !== e.target.value)); }}
                                        className="w-full h-9 px-3 border rounded-md bg-background text-sm"
                                    >
                                        <option value="">Select</option>
                                        {fileData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Variables</label>
                                    <div className="flex flex-wrap gap-1">
                                        {variables.map(v => <Badge key={v} variant="secondary" className="text-xs">{`{{${v}}}`}</Badge>)}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(1)}><i className="ri-arrow-left-line mr-1"></i> Back</Button>
                                    <Button onClick={() => setStep(3)} disabled={!emailColumn}>Next <i className="ri-arrow-right-line ml-1"></i></Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3 - Side by side layout */}
                    {step === 3 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Left: Editor */}
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
                                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedTone === t.id ? 'bg-blue-600 text-white' : 'bg-muted hover:bg-muted/80'}`}
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
                                                    <Button size="sm" onClick={handleGenerate} disabled={isGenerating || !aiPrompt.trim()} className="h-9 px-4 shrink-0">
                                                        {isGenerating ? <i className="ri-loader-4-line animate-spin"></i> : <><i className="ri-magic-line mr-1"></i>Generate</>}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1 items-center text-xs">
                                                <span className="text-muted-foreground">Variables:</span>
                                                {variables.map(v => (
                                                    <button key={v} onClick={() => insertVariable(v)} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                                                        {`{{${v}}}`}
                                                    </button>
                                                ))}
                                            </div>
                                            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line" className="text-sm h-9" />
                                            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Email body..." className="min-h-[220px] text-sm resize-none" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Right: Preview */}
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                                            <i className="ri-eye-line text-muted-foreground"></i>Preview
                                            <Badge variant="outline" className="text-[10px] font-normal ml-auto">Using first contact</Badge>
                                        </div>
                                        {(subject || body) ? (
                                            <div className="bg-muted/40 rounded-lg p-4 min-h-[300px]">
                                                <p className="font-semibold text-sm border-b pb-2 mb-3">{preview(subject) || 'No subject'}</p>
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">{preview(body) || 'No body'}</div>
                                            </div>
                                        ) : (
                                            <div className="bg-muted/40 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                                                <p className="text-sm text-muted-foreground">Preview appears here</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-between pt-1">
                                <Button variant="ghost" size="sm" onClick={() => setStep(2)}><i className="ri-arrow-left-line mr-1"></i>Back</Button>
                                <Button size="sm" onClick={handleCreate} disabled={isCreating || !subject.trim() || !body.trim()}>
                                    {isCreating ? <><i className="ri-loader-4-line animate-spin mr-1"></i>Creating...</> : <><i className="ri-rocket-line mr-1"></i>Launch Campaign</>}
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
