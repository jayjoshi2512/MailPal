import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Badge } from '@/components/components/ui/badge';
import { Progress } from '@/components/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { campaignsAPI, emailAPI } from '@/services/api';

// Gmail API actual limit: 500/day for regular Gmail, 2000/day for Google Workspace
const DAILY_LIMIT = 500;

const CampaignDetail = () => {
    const { id } = useParams();
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    const [campaign, setCampaign] = useState(null);
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sendProgress, setSendProgress] = useState({ sent: 0, failed: 0, total: 0 });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showAddRecipient, setShowAddRecipient] = useState(false);
    const [newRecipient, setNewRecipient] = useState({ email: '' });
    const [variables, setVariables] = useState([]);
    const [sentEmails, setSentEmails] = useState([]); // For completed campaigns

    const handleLogout = useCallback(() => {
        logout();
        navigate('/', { replace: true });
    }, [logout, navigate]);

    const extractVariables = (text) => {
        const matches = text.match(/\{\{(\w+)\}\}/g) || [];
        return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Fetching campaign:', id);
                const res = await campaignsAPI.getById(id);
                console.log('Campaign response:', res);
                
                if (res.success) {
                    setCampaign(res.data.campaign);
                    const vars = extractVariables((res.data.campaign.subject || '') + ' ' + (res.data.campaign.body || ''));
                    setVariables(vars);
                    const initRecipient = { email: '' };
                    vars.forEach(v => initRecipient[v] = '');
                    setNewRecipient(initRecipient);
                    
                    // Always set sent emails from response
                    console.log('API Response sentEmails:', res.data.sentEmails);
                    setSentEmails(res.data.sentEmails || []);
                    
                    // For draft campaigns, also load from sessionStorage
                    if (res.data.campaign.status !== 'completed') {
                        const stored = sessionStorage.getItem(`campaign_${id}_recipients`);
                        if (stored) setRecipients(JSON.parse(stored));
                    }
                } else {
                    toast.error('Campaign not found');
                }
            } catch (error) {
                console.error('Failed to load campaign:', error);
                toast.error('Failed to load campaign');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (recipients.length > 0) {
            sessionStorage.setItem(`campaign_${id}_recipients`, JSON.stringify(recipients));
        }
    }, [recipients, id]);

    const filteredRecipients = recipients.filter(r =>
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(r.variables).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const replaceVariables = (text, vars) => text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);

    const handleAddRecipient = () => {
        if (!newRecipient.email || !newRecipient.email.includes('@')) {
            toast.error('Enter a valid email');
            return;
        }
        if (recipients.some(r => r.email === newRecipient.email)) {
            toast.error('Email already exists');
            return;
        }
        
        const { email, ...vars } = newRecipient;
        setRecipients(prev => [...prev, { email, variables: vars }]);
        const resetRecipient = { email: '' };
        variables.forEach(v => resetRecipient[v] = '');
        setNewRecipient(resetRecipient);
        setShowAddRecipient(false);
        toast.success('Recipient added');
    };

    const handleRemoveRecipient = (email) => {
        setRecipients(prev => prev.filter(r => r.email !== email));
    };

    const handleSendCampaign = async () => {
        setShowConfirmDialog(false);
        if (recipients.length === 0) return toast.error('No recipients');

        const todaySent = parseInt(localStorage.getItem('emails_sent_today') || '0');
        const remaining = DAILY_LIMIT - todaySent;
        if (remaining <= 0) return toast.error(`Daily limit (${DAILY_LIMIT}) reached`);
        
        const toSend = Math.min(recipients.length, remaining);
        if (toSend < recipients.length) toast.warning(`Sending ${toSend}/${recipients.length} (daily limit)`);
        
        setSending(true);
        setSendProgress({ sent: 0, failed: 0, total: toSend });
        
        try {
            await campaignsAPI.update(id, { status: 'running' });
            
            for (let i = 0; i < toSend; i++) {
                const { email, variables: vars = {} } = recipients[i];
                try {
                    await emailAPI.send({ 
                        to: [email], 
                        subject: replaceVariables(campaign.subject, vars), 
                        body: replaceVariables(campaign.body, vars),
                        campaignId: parseInt(id),
                        recipientName: vars.name || null
                    });
                    setSendProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
                    localStorage.setItem('emails_sent_today', String(parseInt(localStorage.getItem('emails_sent_today') || '0') + 1));
                } catch {
                    setSendProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
                }
                if (i < toSend - 1) await new Promise(r => setTimeout(r, 1500));
            }
            
            await campaignsAPI.update(id, { status: 'completed' });
            
            // Reload campaign data to get sent emails from database
            const res = await campaignsAPI.getById(id);
            if (res.success) {
                setCampaign(res.data.campaign);
                setSentEmails(res.data.sentEmails || []);
            }
            
            sessionStorage.removeItem(`campaign_${id}_recipients`);
            setRecipients([]);
            toast.success('Campaign completed!');
        } catch {
            toast.error('Campaign failed');
        } finally {
            setSending(false);
        }
    };

    const progressPercent = sendProgress.total > 0 ? Math.round(((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100) : 0;

    if (loading) return (
        <div className="min-h-screen bg-background flex">
            <Navbar onLogout={handleLogout} /><Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3"></div><div className="h-64 bg-muted rounded"></div></div>
            </main>
        </div>
    );

    if (!campaign) return (
        <div className="min-h-screen bg-background flex">
            <Navbar onLogout={handleLogout} /><Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1 flex items-center justify-center">
                <div className="text-center">
                    <i className="ri-error-warning-line text-4xl text-muted-foreground mb-2"></i>
                    <p className="text-muted-foreground mb-4">Campaign not found</p>
                    <Button onClick={() => navigate('/campaigns')}>Back</Button>
                </div>
            </main>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar onLogout={handleLogout} />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}><i className="ri-arrow-left-line"></i></Button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-semibold">{campaign.name}</h1>
                                    <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>{campaign.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {campaign.status === 'completed' 
                                        ? `${sentEmails.length} emails sent` 
                                        : `${recipients.length} recipients`
                                    } • {new Date(campaign.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        {campaign.status === 'draft' && recipients.length > 0 && !sending && (
                            <Button onClick={() => setShowConfirmDialog(true)}><i className="ri-send-plane-line mr-2"></i>Send Campaign</Button>
                        )}
                    </div>

                    {sending && (
                        <Card className="mb-4">
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Sending...</span>
                                    <span className="text-sm font-bold">{progressPercent}%</span>
                                </div>
                                <Progress value={progressPercent} className="h-3" />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span className="text-green-600"><i className="ri-check-line mr-1"></i>{sendProgress.sent} sent</span>
                                    <span className="text-red-600"><i className="ri-close-line mr-1"></i>{sendProgress.failed} failed</span>
                                    <span>{sendProgress.total - sendProgress.sent - sendProgress.failed} remaining</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-5 gap-4">
                        <Card className="col-span-3">
                            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><i className="ri-mail-line text-blue-600"></i>Email Template</CardTitle></CardHeader>
                            <CardContent>
                                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                                    <div><span className="text-xs text-muted-foreground">Subject</span><p className="font-medium text-sm">{campaign.subject}</p></div>
                                    <div className="border-t pt-3"><span className="text-xs text-muted-foreground">Body</span><div className="text-sm whitespace-pre-wrap mt-1 max-h-[250px] overflow-y-auto">{campaign.body}</div></div>
                                </div>
                                {variables.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        <span className="text-xs text-muted-foreground">Variables:</span>
                                        {variables.map(v => <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    <span className="flex items-center gap-2"><i className="ri-group-line text-green-600"></i>Recipients</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{campaign.status === 'completed' ? sentEmails.length : recipients.length}</Badge>
                                        {campaign.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => setShowAddRecipient(true)}><i className="ri-user-add-line"></i></Button>}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {campaign.status === 'completed' ? (
                                    // Show sent emails for completed campaigns
                                    sentEmails.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <i className="ri-mail-check-line text-3xl mb-2"></i>
                                            <p className="text-sm">No sent emails recorded</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 text-xs" />
                                            <div className="max-h-[280px] overflow-y-auto space-y-1">
                                                {sentEmails.filter(e => e.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase())).map((email, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-xs">
                                                        <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                                                            <i className="ri-check-line"></i>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium">{email.recipient_email}</p>
                                                            <p className="text-muted-foreground truncate">
                                                                {email.recipient_name || 'No name'} • {new Date(email.sent_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] text-green-600">Sent</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ) : recipients.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <i className="ri-user-add-line text-3xl mb-2"></i>
                                        <p className="text-sm">No recipients</p>
                                        <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowAddRecipient(true)}>Add Recipient</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 text-xs" />
                                        <div className="max-h-[280px] overflow-y-auto space-y-1">
                                            {filteredRecipients.map((r, i) => (
                                                <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-xs group">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-medium shrink-0">{r.email[0].toUpperCase()}</div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium">{r.email}</p>
                                                        {r.variables && Object.values(r.variables).some(v => v) && (
                                                            <p className="text-muted-foreground truncate">{Object.entries(r.variables).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`).join(', ')}</p>
                                                        )}
                                                    </div>
                                                    {campaign.status === 'draft' && <button onClick={() => handleRemoveRecipient(r.email)} className="opacity-0 group-hover:opacity-100 text-red-500"><i className="ri-close-line"></i></button>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><i className="ri-send-plane-line text-blue-600"></i>Send Campaign</DialogTitle>
                        <DialogDescription>Send <strong>{recipients.length}</strong> emails for "<strong>{campaign?.name}</strong>"</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Recipients</span><span className="font-medium">{recipients.length}</span></div>
                        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Daily Limit</span><span className="font-medium">{DAILY_LIMIT}</span></div>
                        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Sent Today</span><span className="font-medium">{localStorage.getItem('emails_sent_today') || 0}</span></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                        <Button onClick={handleSendCampaign}><i className="ri-send-plane-line mr-2"></i>Send Now</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showAddRecipient} onOpenChange={setShowAddRecipient}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><i className="ri-user-add-line text-green-600"></i>Add Recipient</DialogTitle>
                        <DialogDescription>Add recipient with required variables</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div><label className="text-xs font-medium mb-1 block">Email *</label><Input type="email" placeholder="email@example.com" value={newRecipient.email} onChange={e => setNewRecipient(prev => ({ ...prev, email: e.target.value }))} /></div>
                        {variables.map(v => (
                            <div key={v}><label className="text-xs font-medium mb-1 block">{v}</label><Input placeholder={`Enter ${v}...`} value={newRecipient[v] || ''} onChange={e => setNewRecipient(prev => ({ ...prev, [v]: e.target.value }))} /></div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddRecipient(false)}>Cancel</Button>
                        <Button onClick={handleAddRecipient}><i className="ri-check-line mr-2"></i>Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CampaignDetail;
