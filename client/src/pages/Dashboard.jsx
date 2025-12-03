import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI } from '@/services/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';

// Simple Area Chart - Smooth visual representation
const AreaChart = ({ data, color = '#3b82f6', height = 80 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-end gap-1.5" style={{ height }}>
                {[...Array(14)].map((_, i) => (
                    <div key={i} className="flex-1 bg-muted/20 rounded-t" style={{ height: '20%' }}></div>
                ))}
            </div>
        );
    }
    
    const values = data.map(d => d.count || 0);
    const maxValue = Math.max(...values, 1);
    const width = 200;
    const chartHeight = height;
    const padding = 5;
    
    // Create smooth path points
    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = chartHeight - padding - (v / maxValue) * (chartHeight - padding * 2);
        return { x, y, value: v };
    });
    
    // Create line path
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Create area path (closed)
    const areaPath = `${linePath} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;
    
    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full" style={{ height }} preserveAspectRatio="none">
                {/* Area fill */}
                <path
                    d={areaPath}
                    fill={color}
                    fillOpacity="0.1"
                />
                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Data points */}
                {points.map((p, i) => (
                    <g key={i} className="group cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                        <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="3" 
                            fill="white" 
                            stroke={color} 
                            strokeWidth="2"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <rect 
                                x={p.x - 15} 
                                y={p.y - 22} 
                                width="30" 
                                height="16" 
                                rx="3" 
                                fill="currentColor" 
                                className="text-popover"
                            />
                            <text 
                                x={p.x} 
                                y={p.y - 11} 
                                textAnchor="middle" 
                                fontSize="8" 
                                fill="currentColor"
                                className="text-popover-foreground"
                            >
                                {p.value}
                            </text>
                        </g>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// Animated Donut Chart - Shows percentage in center
const DonutChart = ({ value, max, size = 100, color = '#3b82f6' }) => {
    const percent = Math.min((value / max) * 100, 100);
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;
    
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/10"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{Math.round(percent)}%</span>
            </div>
        </div>
    );
};

// Activity Heatmap (like GitHub contributions)
const ActivityHeatmap = ({ data, color = '#3b82f6' }) => {
    // Fill in last 14 days
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = data?.find(d => d.date?.split('T')[0] === dateStr);
        days.push({
            date: dateStr,
            count: dayData?.count || 0,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
        });
    }
    
    const maxCount = Math.max(...days.map(d => d.count), 1);
    
    const getOpacity = (count) => {
        if (count === 0) return 0.1;
        return 0.2 + (count / maxCount) * 0.8;
    };
    
    return (
        <div className="flex gap-1">
            {days.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full aspect-square rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer relative group"
                        style={{ 
                            backgroundColor: color,
                            opacity: getOpacity(day.count)
                        }}
                        title={`${day.count} emails on ${new Date(day.date).toLocaleDateString()}`}
                    >
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[9px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border">
                            {day.count} sent
                        </div>
                    </div>
                    <span className="text-[8px] text-muted-foreground">{day.dayName}</span>
                </div>
            ))}
        </div>
    );
};

// Animated Counter - Animates on page load/reload, but not on navigation
const AnimatedNumber = ({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [shouldAnimate, setShouldAnimate] = useState(true);
    
    useEffect(() => {
        // Check navigation type - animate on reload or direct access, not on navigation
        const navigationType = performance.getEntriesByType('navigation')[0]?.type;
        const isReloadOrDirect = navigationType === 'reload' || navigationType === 'navigate';
        
        // Also check if coming from same origin navigation (SPA navigation)
        const lastPath = sessionStorage.getItem('dashboard_last_path');
        const currentPath = window.location.pathname;
        const isSPANavigation = lastPath && lastPath !== currentPath;
        
        // Update the last path
        sessionStorage.setItem('dashboard_last_path', currentPath);
        
        // Skip animation if it's SPA navigation to dashboard
        if (isSPANavigation && currentPath === '/dashboard') {
            setDisplayValue(value);
            setShouldAnimate(false);
            return;
        }
        
        // Animate on reload or first visit
        if (!shouldAnimate) {
            setDisplayValue(value);
            return;
        }
        
        let startTime;
        const startValue = 0;
        const endValue = value;
        
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            setDisplayValue(Math.round(startValue + (endValue - startValue) * easeOutQuad));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setShouldAnimate(false);
            }
        };
        
        requestAnimationFrame(animate);
    }, [value, duration, shouldAnimate]);
    
    return <span>{displayValue}</span>;
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    const DAILY_LIMIT = 500;
    const emailStats = stats?.emailStats || {};
    const campaignStats = stats?.campaignStats || {};
    const recentActivity = stats?.recentActivity || [];
    const emailTrends = stats?.emailTrends || [];
    const campaignTrends = stats?.campaignTrends || [];
    const campaignPerformance = stats?.campaignPerformance || [];
    const emailsSentToday = emailStats.sentToday || 0;
    const dailyUsagePercent = Math.round((emailsSentToday / DAILY_LIMIT) * 100);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex">
                <Navbar />
                <Sidebar />
                <main className="ml-64 mt-16 p-6 flex-1">
                    <div className="max-w-6xl mx-auto animate-pulse space-y-4">
                        <div className="h-6 w-48 bg-muted rounded"></div>
                        <div className="grid grid-cols-4 gap-3">
                            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-lg"></div>)}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-48 bg-muted rounded-lg"></div>
                            <div className="h-48 bg-muted rounded-lg"></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold">
                                Welcome back, {user?.name?.split(' ')[0]} 👋
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1">Here's what's happening with your emails</p>
                        </div>
                        <Badge variant="outline" className="text-xs px-3 py-1.5">
                            <i className="ri-calendar-line mr-1.5"></i>
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Badge>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-5">
                        {/* Daily Usage */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Daily Usage</p>
                                    <p className="text-2xl font-bold">
                                        <AnimatedNumber value={emailsSentToday} />
                                        <span className="text-sm font-normal text-muted-foreground">/{DAILY_LIMIT}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">emails sent today</p>
                                </div>
                                <DonutChart 
                                    value={emailsSentToday} 
                                    max={DAILY_LIMIT} 
                                    size={70} 
                                    color={dailyUsagePercent >= 80 ? '#ef4444' : '#3b82f6'}
                                />
                            </div>
                        </Card>

                        {/* Remaining */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        <AnimatedNumber value={DAILY_LIMIT - emailsSentToday} />
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">emails left today</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <i className="ri-inbox-unarchive-line text-xl text-green-500"></i>
                                </div>
                            </div>
                        </Card>

                        {/* Total Sent */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Total Sent</p>
                                    <p className="text-2xl font-bold">
                                        <AnimatedNumber value={emailStats.totalSent || 0} />
                                    </p>
                                    <p className="text-xs text-green-500 mt-1">
                                        <i className="ri-arrow-up-line"></i> +{emailStats.sentThisWeek || 0} this week
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                    <i className="ri-mail-check-line text-xl text-cyan-500"></i>
                                </div>
                            </div>
                        </Card>

                        {/* Campaigns */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Campaigns</p>
                                    <p className="text-2xl font-bold">
                                        <AnimatedNumber value={campaignStats.totalCampaigns || 0} />
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {campaignStats.activeCampaigns || 0} active, {campaignStats.completedCampaigns || 0} completed
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <i className="ri-megaphone-line text-xl text-orange-500"></i>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        {/* Email Activity */}
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <i className="ri-mail-line text-blue-500"></i>
                                        </div>
                                        Email Activity
                                    </CardTitle>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{emailTrends.reduce((sum, d) => sum + (d.count || 0), 0)}</p>
                                        <p className="text-[10px] text-muted-foreground">last 14 days</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-2">
                                <div className="rounded-lg p-3">
                                    <AreaChart data={emailTrends.slice(-14)} color="#3b82f6" height={80} />
                                </div>
                                <div className="flex justify-between text-[9px] text-muted-foreground px-1 mt-2">
                                    <span>14 days ago</span>
                                    <span>Today</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Heatmap */}
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                            <i className="ri-fire-line text-teal-500"></i>
                                        </div>
                                        Activity Heatmap
                                    </CardTitle>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{campaignTrends.reduce((sum, d) => sum + (d.count || 0), 0)}</p>
                                        <p className="text-[10px] text-muted-foreground">campaigns</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-2">
                                <div className="rounded-lg p-4">
                                    <ActivityHeatmap data={emailTrends} color="#14b8a6" />
                                </div>
                                <div className="flex items-center justify-center gap-3 mt-3 text-[9px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-sm bg-teal-500/20"></span> Less
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-sm bg-teal-500/50"></span> Medium
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-sm bg-teal-500"></span> More
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Top Campaigns */}
                        <Card>
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                        <i className="ri-trophy-line text-yellow-500"></i>
                                    </div>
                                    Top Campaigns
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0">
                                {campaignPerformance && campaignPerformance.length > 0 ? (
                                    <div className="space-y-2">
                                        {campaignPerformance.slice(0, 3).map((camp, idx) => (
                                            <div key={camp.id || idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                    idx === 0 ? 'bg-yellow-500/10 text-yellow-600' :
                                                    idx === 1 ? 'bg-gray-500/10 text-gray-500' :
                                                    'bg-orange-500/10 text-orange-600'
                                                }`}>
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-blue-500 transition-colors">{camp.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{camp.emails_sent || 0} emails sent</p>
                                                </div>
                                                <Badge variant={camp.status === 'completed' ? 'default' : camp.status === 'active' ? 'secondary' : 'outline'} className="text-[9px]">
                                                    {camp.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-28 text-muted-foreground">
                                        <i className="ri-trophy-line text-3xl mb-2 opacity-30"></i>
                                        <p className="text-xs">No campaigns yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <i className="ri-time-line text-green-500"></i>
                                    </div>
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0">
                                {recentActivity && recentActivity.length > 0 ? (
                                    <div className="space-y-2">
                                        {recentActivity.slice(0, 3).map((activity, idx) => (
                                            <div key={activity.id || idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <i className="ri-mail-check-line text-green-500 text-sm"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{activity.subject || 'No Subject'}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">To: {activity.recipient_email || activity.emailTo || 'Unknown'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/30">sent</Badge>
                                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                                        {activity.sent_at || activity.sentAt ? new Date(activity.sent_at || activity.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-28 text-muted-foreground">
                                        <i className="ri-mail-line text-3xl mb-2 opacity-30"></i>
                                        <p className="text-xs">No recent activity</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <button 
                            onClick={() => navigate('/compose')} 
                            className="p-3 rounded-xl border bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm font-medium group"
                        >
                            <i className="ri-edit-line text-blue-500 group-hover:scale-110 transition-transform"></i>
                            Compose Email
                        </button>
                        <button 
                            onClick={() => navigate('/campaigns/new')} 
                            className="p-3 rounded-xl border bg-green-500/5 hover:bg-green-500/10 border-green-500/20 transition-all flex items-center justify-center gap-2 text-sm font-medium group"
                        >
                            <i className="ri-add-line text-green-500 group-hover:scale-110 transition-transform"></i>
                            New Campaign
                        </button>
                        <button 
                            onClick={() => navigate('/campaigns')} 
                            className="p-3 rounded-xl border bg-teal-500/5 hover:bg-teal-500/10 border-teal-500/20 transition-all flex items-center justify-center gap-2 text-sm font-medium group"
                        >
                            <i className="ri-folder-line text-teal-500 group-hover:scale-110 transition-transform"></i>
                            View Campaigns
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
