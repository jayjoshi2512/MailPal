import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { campaignsAPI, emailAPI } from '@/services/api';
import {
    CampaignHeader,
    EmailTemplate,
    RecipientsPanel,
    SendProgressCard,
    AddRecipientDialog,
    ConfirmSendDialog
} from '@/components/CampaignDetail';

const DAILY_LIMIT = 500;

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [campaign, setCampaign] = useState(null);
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sendProgress, setSendProgress] = useState({ sent: 0, failed: 0, total: 0 });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showAddRecipient, setShowAddRecipient] = useState(false);
    const [newRecipient, setNewRecipient] = useState({ email: '' });
    const [variables, setVariables] = useState([]);
    const [sentEmails, setSentEmails] = useState([]);

    const extractVariables = (text) => {
        const matches = text.match(/\{\{(\w+)\}\}/g) || [];
        return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await campaignsAPI.getById(id);
                
                if (res.success) {
                    setCampaign(res.data.campaign);
                    const vars = extractVariables((res.data.campaign.subject || '') + ' ' + (res.data.campaign.body || ''));
                    setVariables(vars);
                    const initRecipient = { email: '' };
                    vars.forEach(v => initRecipient[v] = '');
                    setNewRecipient(initRecipient);
                    setSentEmails(res.data.sentEmails || []);
                    
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
                        campaignId: id,
                        recipientName: vars.name || null
                    });
                    setSendProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
                    localStorage.setItem('emails_sent_today', String(parseInt(localStorage.getItem('emails_sent_today') || '0') + 1));
                } catch (error) {
                    console.error('Failed to send email to', email, error);
                    setSendProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
                }
                if (i < toSend - 1) await new Promise(r => setTimeout(r, 1500));
            }
            
            await campaignsAPI.update(id, { status: 'completed' });
            
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

    if (loading) return (
        <div className="min-h-screen bg-background flex">
            <Navbar /><Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3"></div><div className="h-64 bg-muted rounded"></div></div>
            </main>
        </div>
    );

    if (!campaign) return (
        <div className="min-h-screen bg-background flex">
            <Navbar /><Sidebar />
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
            <Navbar />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-5xl mx-auto">
                    <CampaignHeader 
                        campaign={campaign}
                        recipients={recipients}
                        sentEmails={sentEmails}
                        sending={sending}
                        onBack={() => navigate('/campaigns')}
                        onSend={() => setShowConfirmDialog(true)}
                    />

                    {sending && (
                        <SendProgressCard sendProgress={sendProgress} />
                    )}

                    <div className="grid grid-cols-5 gap-4">
                        <EmailTemplate campaign={campaign} variables={variables} />
                        <RecipientsPanel 
                            campaign={campaign}
                            recipients={recipients}
                            sentEmails={sentEmails}
                            onAddClick={() => setShowAddRecipient(true)}
                            onRemoveRecipient={handleRemoveRecipient}
                        />
                    </div>
                </div>
            </main>

            <ConfirmSendDialog 
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                campaign={campaign}
                recipients={recipients}
                dailyLimit={DAILY_LIMIT}
                onSend={handleSendCampaign}
            />

            <AddRecipientDialog 
                open={showAddRecipient}
                onOpenChange={setShowAddRecipient}
                newRecipient={newRecipient}
                setNewRecipient={setNewRecipient}
                variables={variables}
                onAdd={handleAddRecipient}
            />
        </div>
    );
};

export default CampaignDetail;
