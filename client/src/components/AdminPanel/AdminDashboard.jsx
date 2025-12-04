import React, { useState, useEffect } from 'react';
import { Button } from '@/components/components/ui/button';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/mode-toggle';
import { StatCard, OverviewTab, UsersTab, CampaignsTab, EmailsTab } from '@/components/AdminPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminAPI = {
    getDashboard: async (token) => {
        const res = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },
};

const AdminDashboard = ({ token, onLogout }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const result = await adminAPI.getDashboard(token);
            if (result.success) {
                setData(result.data);
            } else {
                toast.error(result.error || 'Failed to load dashboard');
                if (result.error?.includes('expired') || result.error?.includes('authentication')) {
                    onLogout();
                }
            }
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        onLogout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-4xl text-primary"></i>
                    <p className="text-sm text-muted-foreground mt-2">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
        { id: 'users', label: 'Users', icon: 'ri-user-line' },
        { id: 'campaigns', label: 'Campaigns', icon: 'ri-megaphone-line' },
        { id: 'emails', label: 'Recent Emails', icon: 'ri-mail-line' },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="ri-shield-keyhole-line text-primary"></i>
                        </div>
                        <div>
                            <h1 className="font-semibold">MailPal Admin</h1>
                            <p className="text-xs text-muted-foreground">System Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <Button variant="outline" size="sm" onClick={fetchDashboard}>
                            <i className="ri-refresh-line mr-1"></i>Refresh
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleLogout}>
                            <i className="ri-logout-box-line mr-1"></i>Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatCard 
                        title="Total Users" 
                        value={data?.stats?.total_users} 
                        icon="ri-user-line" 
                        color="bg-blue-500/10 text-blue-500"
                    />
                    <StatCard 
                        title="Total Campaigns" 
                        value={data?.stats?.total_campaigns} 
                        icon="ri-megaphone-line" 
                        color="bg-green-500/10 text-green-500"
                    />
                    <StatCard 
                        title="Emails Sent" 
                        value={data?.stats?.total_emails_sent} 
                        icon="ri-mail-send-line" 
                        color="bg-teal-500/10 text-teal-500"
                    />
                    <StatCard 
                        title="Templates" 
                        value={data?.stats?.total_templates} 
                        icon="ri-file-list-3-line" 
                        color="bg-amber-500/10 text-amber-500"
                    />
                    <StatCard 
                        title="Contacts" 
                        value={data?.stats?.total_contacts} 
                        icon="ri-contacts-line" 
                        color="bg-pink-500/10 text-pink-500"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-muted/50 p-1 rounded-lg w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-background shadow text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <i className={tab.icon}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && <OverviewTab data={data} />}
                {activeTab === 'users' && <UsersTab users={data?.users} />}
                {activeTab === 'campaigns' && <CampaignsTab campaigns={data?.campaigns} />}
                {activeTab === 'emails' && <EmailsTab emails={data?.recentEmails} />}
            </main>
        </div>
    );
};

export default AdminDashboard;
