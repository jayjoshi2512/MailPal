import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI } from '@/services/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import StatCard from '@/components/Dashboard/StatCard';
import RecentActivityTable from '@/components/Dashboard/RecentActivityTable';
import DashboardSkeleton from '@/components/Dashboard/DashboardSkeleton';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [responseRate, setResponseRate] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
                setError(null);
            }
            const [statsResponse, rateResponse] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getResponseRate()
            ]);
            if (statsResponse?.success) {
                setStats(statsResponse.data);
            } else {
                throw new Error('Failed to fetch dashboard statistics');
            }
            if (rateResponse?.success) {
                setResponseRate(rateResponse.data);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            if (!silent) {
                setError(error.message || 'Failed to load dashboard data');
                toast.error('Failed to load dashboard data');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    if (loading) {
        return (
            <div className="h-screen overflow-hidden bg-background">
                <Navbar onLogout={handleLogout} />
                <Sidebar />
                <main className="ml-64 mt-16 h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="p-4">
                        <DashboardSkeleton />
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen overflow-hidden bg-background">
                <Navbar onLogout={handleLogout} />
                <Sidebar />
                <main className="ml-64 mt-16 h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <i className="ri-error-warning-line text-5xl text-red-500 mb-3"></i>
                                <p className="text-base font-semibold mb-1">Failed to load dashboard</p>
                                <p className="text-sm text-muted-foreground mb-3">{error}</p>
                                <button onClick={fetchDashboardData} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Retry</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const emailStats = stats?.emailStats || {};
    const recentActivity = stats?.recentActivity || [];
    
    // Gmail API actual limit: 500/day for regular Gmail, 2000/day for Google Workspace
    const DAILY_LIMIT = 500;
    const emailsSentToday = emailStats.sentToday || parseInt(localStorage.getItem('emails_sent_today') || '0');
    const dailyUsagePercent = Math.round((emailsSentToday / DAILY_LIMIT) * 100);

    return (
        <div className="h-screen overflow-hidden bg-background">
            <Navbar onLogout={handleLogout} />
            <Sidebar />
            <main className="ml-64 mt-16 h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="p-4">
                    <div className="max-w-6xl mx-auto space-y-4">
                        {/* Header */}
                        <DashboardHeader userName={user?.name} />

                        {/* Usage Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard 
                                title="Daily Usage" 
                                value={`${emailsSentToday}/${DAILY_LIMIT}`} 
                                subtitle={<span className={dailyUsagePercent >= 80 ? 'text-red-600' : 'text-green-600'}>{dailyUsagePercent}% used</span>} 
                                icon="ri-24-hours-line" 
                                iconColor="text-blue-600" 
                            />
                            <StatCard 
                                title="Remaining Today" 
                                value={DAILY_LIMIT - emailsSentToday} 
                                subtitle="emails available" 
                                icon="ri-inbox-line" 
                                iconColor="text-green-600" 
                            />
                            <StatCard 
                                title="Total Sent" 
                                value={emailStats.totalSent || 0} 
                                subtitle={<span><span className="text-green-600 font-semibold">+{emailStats.sentThisWeek || 0}</span> this week</span>} 
                                icon="ri-mail-send-line" 
                                iconColor="text-purple-600" 
                            />
                            <StatCard 
                                title="Response Rate" 
                                value={`${responseRate?.responseRate || 0}%`} 
                                subtitle={`${responseRate?.totalClicks || 0} clicks`} 
                                icon="ri-bar-chart-line" 
                                iconColor="text-orange-600" 
                            />
                        </div>
                        <RecentActivityTable data={recentActivity} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
