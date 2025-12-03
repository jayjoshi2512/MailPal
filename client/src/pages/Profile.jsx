import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Avatar } from '@/components/components/ui/avatar';
import { Badge } from '@/components/components/ui/badge';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-4">
                        <h1 className="text-xl font-semibold">Profile</h1>
                        <p className="text-xs text-muted-foreground">Your account information</p>
                    </div>
                    <Card className="mb-4">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <Avatar src={user?.profile_picture} name={user?.name} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h2 className="font-semibold text-lg">{user?.name}</h2>
                                        <Badge variant="outline" className="text-[10px]">Active</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mb-4">
                        <CardHeader className="pb-2 pt-3 px-4">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <i className="ri-user-line text-blue-500"></i>
                                Account Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Full Name</span>
                                    <span className="text-sm font-medium">{user?.name}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Email Address</span>
                                    <span className="text-sm font-medium">{user?.email}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground">Account Type</span>
                                    <Badge variant="secondary" className="text-xs">Google OAuth</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 pt-3 px-4">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <i className="ri-link text-green-500"></i>
                                Connected Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border">
                                        <i className="ri-google-fill text-lg text-[#4285F4]"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Google Account</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                                    <i className="ri-check-line mr-1"></i>Connected
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Your Gmail account is connected for sending emails.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Profile;
