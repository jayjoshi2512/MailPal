import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI } from '@/services/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

// Dashboard Components
import {
    DashboardHeader,
    DashboardSkeleton,
    StatsRow,
    QuickActions,
    TopCampaigns,
    RecentActivity,
    EmailActivityChart,
    ActivityHeatmapChart
} from '@/components/Dashboard';

/**
 * Dashboard Page - Main analytics and overview page
 * 
 * Features:
 * - Stats overview (daily usage, remaining, total sent, campaigns)
 * - Email activity chart
 * - Activity heatmap
 * - Top campaigns
 * - Recent activity
 * - Quick action buttons
 */
const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsResponse = await dashboardAPI.getStats();
            if (statsResponse?.success) {
                setStats(statsResponse.data);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Show loading skeleton
    if (loading) {
        return <DashboardSkeleton />;
    }

    // Extract stats data
    const emailStats = stats?.emailStats || {};
    const campaignStats = stats?.campaignStats || {};
    const recentActivity = stats?.recentActivity || [];
    const emailTrends = stats?.emailTrends || [];
    const campaignTrends = stats?.campaignTrends || [];
    const campaignPerformance = stats?.campaignPerformance || [];

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <DashboardHeader userName={user?.name} />

                    {/* Stats Row */}
                    <StatsRow 
                        emailStats={emailStats} 
                        campaignStats={campaignStats} 
                    />

                    {/* Charts Row */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <EmailActivityChart data={emailTrends} />
                        <ActivityHeatmapChart 
                            emailTrends={emailTrends} 
                            campaignTrends={campaignTrends} 
                        />
                    </div>

                    {/* Bottom Row - Campaigns & Activity */}
                    <div className="grid grid-cols-2 gap-4">
                        <TopCampaigns campaigns={campaignPerformance} />
                        <RecentActivity activities={recentActivity} />
                    </div>

                    {/* Quick Actions */}
                    <QuickActions />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
