import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Badge } from '@/components/components/ui/badge';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/mode-toggle';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API functions for admin
const adminAPI = {
    sendCode: async () => {
        const res = await fetch(`${API_URL}/admin/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        return res.json();
    },
    verifyCode: async (code) => {
        const res = await fetch(`${API_URL}/admin/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        return res.json();
    },
    verify: async (token) => {
        const res = await fetch(`${API_URL}/admin/verify`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },
    getDashboard: async (token) => {
        const res = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },
};

// Format date helper
const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Admin Login Component
const AdminLogin = ({ onAuthenticated }) => {
    const [step, setStep] = useState('initial'); // initial, codeSent, verifying
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [expiresIn, setExpiresIn] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    useEffect(() => {
        if (expiresIn > 0) {
            const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [expiresIn]);

    const handleSendCode = async () => {
        setLoading(true);
        try {
            const result = await adminAPI.sendCode();
            if (result.success) {
                setStep('codeSent');
                setExpiresIn(result.data.expiresIn);
                setCooldown(120); // 2 minutes cooldown
                toast.success('Verification code sent to admin email');
            } else {
                toast.error(result.error || 'Failed to send code');
                if (result.error?.includes('wait')) {
                    const seconds = parseInt(result.error.match(/\d+/)?.[0] || '60');
                    setCooldown(seconds);
                }
            }
        } catch (error) {
            toast.error('Failed to send code. Check server connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code.trim()) {
            toast.warning('Please enter the verification code');
            return;
        }

        setLoading(true);
        try {
            const result = await adminAPI.verifyCode(code);
            if (result.success) {
                localStorage.setItem('admin_token', result.data.token);
                toast.success('Admin authenticated successfully');
                onAuthenticated(result.data.token);
            } else {
                toast.error(result.error || 'Invalid code');
                if (result.error?.includes('expired') || result.error?.includes('attempts')) {
                    setStep('initial');
                    setCode('');
                }
            }
        } catch (error) {
            toast.error('Verification failed. Check server connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="ri-shield-keyhole-line text-3xl text-primary"></i>
                        </div>
                    </div>
                    <CardTitle className="text-xl">Admin Access</CardTitle>
                    <CardDescription>
                        {step === 'initial' 
                            ? 'Click below to receive an authentication code via email'
                            : 'Enter the verification code sent to your email'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 'initial' ? (
                        <>
                            <Button 
                                className="w-full" 
                                onClick={handleSendCode}
                                disabled={loading || cooldown > 0}
                            >
                                {loading ? (
                                    <><i className="ri-loader-4-line animate-spin mr-2"></i>Sending...</>
                                ) : cooldown > 0 ? (
                                    <><i className="ri-time-line mr-2"></i>Wait {cooldown}s</>
                                ) : (
                                    <><i className="ri-mail-send-line mr-2"></i>Send Code</>
                                )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                A 15-character code will be sent to the admin email address
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Enter 15-character code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.trim())}
                                    className="text-center font-mono text-lg tracking-wider"
                                    maxLength={15}
                                    autoFocus
                                />
                                {expiresIn > 0 && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        Code expires in {Math.floor(expiresIn / 60)}:{(expiresIn % 60).toString().padStart(2, '0')}
                                    </p>
                                )}
                            </div>
                            <Button 
                                className="w-full" 
                                onClick={handleVerifyCode}
                                disabled={loading || code.length !== 15}
                            >
                                {loading ? (
                                    <><i className="ri-loader-4-line animate-spin mr-2"></i>Verifying...</>
                                ) : (
                                    <><i className="ri-shield-check-line mr-2"></i>Verify</>
                                )}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleSendCode}
                                disabled={loading || cooldown > 0}
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// Stats Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value?.toLocaleString() || 0}</p>
                    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                    <i className={`${icon} text-lg`}></i>
                </div>
            </div>
        </CardContent>
    </Card>
);

// Admin Dashboard Component
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
                            <h1 className="font-semibold">MailKar Admin</h1>
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

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Top Users */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <i className="ri-trophy-line text-amber-500"></i>
                                    Top Users by Emails Sent
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {data?.topUsers?.slice(0, 5).map((user, i) => (
                                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                                {i + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {user.emails_sent} emails
                                            </Badge>
                                        </div>
                                    ))}
                                    {(!data?.topUsers || data.topUsers.length === 0) && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Emails by Day Chart (Simple) */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <i className="ri-line-chart-line text-blue-500"></i>
                                    Emails Sent (Last 30 Days)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {data?.emailsByDay?.slice(0, 7).map(day => (
                                        <div key={day.date} className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-20">
                                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ 
                                                        width: `${Math.min(100, (day.count / Math.max(...data.emailsByDay.map(d => d.count))) * 100)}%` 
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium w-8 text-right">{day.count}</span>
                                        </div>
                                    ))}
                                    {(!data?.emailsByDay || data.emailsByDay.length === 0) && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No emails sent yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* New Users by Day */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <i className="ri-user-add-line text-green-500"></i>
                                    New User Registrations (Last 30 Days)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-1 items-end h-32">
                                    {data?.usersByDay?.slice(0, 30).reverse().map((day, i) => (
                                        <div 
                                            key={day.date}
                                            className="flex-1 bg-green-500/80 rounded-t hover:bg-green-500 transition-colors cursor-pointer group relative"
                                            style={{ 
                                                height: `${Math.max(8, (day.count / Math.max(...data.usersByDay.map(d => d.count))) * 100)}%` 
                                            }}
                                            title={`${new Date(day.date).toLocaleDateString()}: ${day.count} users`}
                                        />
                                    ))}
                                    {(!data?.usersByDay || data.usersByDay.length === 0) && (
                                        <div className="flex-1 flex items-center justify-center">
                                            <p className="text-sm text-muted-foreground">No new users yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <i className="ri-user-line text-blue-500"></i>
                                All Users ({data?.users?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-medium">User</th>
                                            <th className="text-left py-2 px-2 font-medium">Email</th>
                                            <th className="text-left py-2 px-2 font-medium">Created</th>
                                            <th className="text-left py-2 px-2 font-medium">Last Active</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.users?.map(user => (
                                            <tr key={user.id} className="border-b hover:bg-muted/50">
                                                <td className="py-2 px-2">
                                                    <div className="flex items-center gap-2">
                                                        {user.picture ? (
                                                            <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                                                {(user.name || user.email)?.[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="font-medium">{user.name || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2 text-muted-foreground">{user.email}</td>
                                                <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(user.created_at)}</td>
                                                <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(user.updated_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!data?.users || data.users.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <i className="ri-megaphone-line text-green-500"></i>
                                Recent Campaigns ({data?.campaigns?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-medium">Campaign</th>
                                            <th className="text-left py-2 px-2 font-medium">User</th>
                                            <th className="text-left py-2 px-2 font-medium">Status</th>
                                            <th className="text-left py-2 px-2 font-medium">Emails</th>
                                            <th className="text-left py-2 px-2 font-medium">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.campaigns?.map(campaign => (
                                            <tr key={campaign.id} className="border-b hover:bg-muted/50">
                                                <td className="py-2 px-2">
                                                    <div>
                                                        <p className="font-medium">{campaign.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{campaign.subject}</p>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2 text-muted-foreground">{campaign.user_email}</td>
                                                <td className="py-2 px-2">
                                                    <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'} className="text-xs">
                                                        {campaign.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 px-2">{campaign.emails_sent}</td>
                                                <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(campaign.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!data?.campaigns || data.campaigns.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No campaigns found</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Emails Tab */}
                {activeTab === 'emails' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <i className="ri-mail-line text-teal-500"></i>
                                Recent Emails (Last 100)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-medium">Recipient</th>
                                            <th className="text-left py-2 px-2 font-medium">Subject</th>
                                            <th className="text-left py-2 px-2 font-medium">Campaign</th>
                                            <th className="text-left py-2 px-2 font-medium">Sender</th>
                                            <th className="text-left py-2 px-2 font-medium">Sent At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.recentEmails?.map(email => (
                                            <tr key={email.id} className="border-b hover:bg-muted/50">
                                                <td className="py-2 px-2 text-muted-foreground">{email.recipient_email}</td>
                                                <td className="py-2 px-2">
                                                    <span className="truncate max-w-[200px] block">{email.subject}</span>
                                                </td>
                                                <td className="py-2 px-2 text-muted-foreground">{email.campaign_name || 'Compose'}</td>
                                                <td className="py-2 px-2 text-muted-foreground text-xs">{email.user_email}</td>
                                                <td className="py-2 px-2 text-muted-foreground text-xs">{formatDate(email.sent_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!data?.recentEmails || data.recentEmails.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No emails sent yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

// Main Admin Panel Component
const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        const storedToken = localStorage.getItem('admin_token');
        if (storedToken) {
            try {
                const result = await adminAPI.verify(storedToken);
                if (result.success) {
                    setToken(storedToken);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('admin_token');
                }
            } catch (error) {
                localStorage.removeItem('admin_token');
            }
        }
        setChecking(false);
    };

    const handleAuthenticated = (newToken) => {
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setToken(null);
        setIsAuthenticated(false);
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin text-4xl text-primary"></i>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onAuthenticated={handleAuthenticated} />;
    }

    return <AdminDashboard token={token} onLogout={handleLogout} />;
};

export default AdminPanel;
