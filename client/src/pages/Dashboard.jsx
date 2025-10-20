import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar onLogout={handleLogout} />
            <Sidebar />

            <main className="ml-64 pt-24 px-8 py-8">
                <div className="max-w-5xl">
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold font-maorin mb-2">
                            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                        </h2>
                        <p className="text-muted-foreground">
                            Your Google account ({user?.email}) is connected. Start creating email campaigns!
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        {/* Stats Cards */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Campaigns
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Create your first campaign
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Emails Sent
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Start reaching out
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Response Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">0%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    No data yet
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" size="lg">
                                <i className="ri-add-line mr-2 text-lg"></i>
                                Create New Campaign
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="lg">
                                <i className="ri-contacts-line mr-2 text-lg"></i>
                                Manage Contacts
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="lg">
                                <i className="ri-mail-line mr-2 text-lg"></i>
                                Email Templates
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
