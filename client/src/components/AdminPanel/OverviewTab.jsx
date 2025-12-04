import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Badge } from '@/components/components/ui/badge';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg shadow-lg p-2 text-xs">
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground">{payload[0].value} {payload[0].name}</p>
            </div>
        );
    }
    return null;
};

const OverviewTab = ({ data }) => {
    // Prepare chart data
    const emailChartData = data?.emailsByDay?.slice(0, 14).reverse().map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        emails: day.count
    })) || [];

    const userChartData = data?.usersByDay?.slice(0, 14).reverse().map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: day.count
    })) || [];

    // Prepare pie chart data for top users
    const topUsersPieData = data?.topUsers?.slice(0, 6).map(user => ({
        name: user.name || user.email.split('@')[0],
        value: parseInt(user.emails_sent) || 0
    })) || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Emails Sent - Area Chart */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <i className="ri-mail-send-line text-blue-500"></i>
                        Emails Sent (Last 14 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {emailChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={emailChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888' }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="emails" 
                                    name="Emails"
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    fill="url(#emailGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-16">No emails sent yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Top Users - Donut Chart */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <i className="ri-trophy-line text-amber-500"></i>
                        Top Senders Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {topUsersPieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={topUsersPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {topUsersPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => [`${value} emails`, name]}
                                    contentStyle={{ 
                                        backgroundColor: 'var(--background)', 
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend 
                                    layout="vertical" 
                                    align="right" 
                                    verticalAlign="middle"
                                    formatter={(value) => <span className="text-xs">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-16">No data yet</p>
                    )}
                </CardContent>
            </Card>

            {/* New Users - Area Chart with gradient */}
            <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <i className="ri-user-add-line text-green-500"></i>
                        New User Registrations (Last 14 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {userChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={userChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888' }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="users" 
                                    name="Users"
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fill="url(#userGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No new users yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Top Users List */}
            <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <i className="ri-star-line text-yellow-500"></i>
                        Top Users Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data?.topUsers?.slice(0, 6).map((user, i) => (
                            <div 
                                key={user.id} 
                                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                            >
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                >
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <Badge 
                                    className="text-xs"
                                    style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}
                                >
                                    {user.emails_sent}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    {(!data?.topUsers || data.topUsers.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OverviewTab;
