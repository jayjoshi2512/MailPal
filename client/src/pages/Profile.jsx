import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Input } from '@/components/components/ui/input';
import { Button } from '@/components/components/ui/button';
import { Avatar } from '@/components/components/ui/avatar';
import { Badge } from '@/components/components/ui/badge';

const Profile = () => {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: '',
        jobTitle: '',
        phone: '',
    });

    const handleChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log('Saving profile:', profileData);
        // TODO: Implement API call to save profile
        setIsEditing(false);
        toast.success('Profile updated successfully!');
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar onLogout={logout} />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold font-maorin mb-6">Profile</h1>

                    {/* Profile Header */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-6">
                                <Avatar
                                    src={user?.profile_picture}
                                    name={user?.name}
                                    size="2xl"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold font-maorin">{user?.name}</h2>
                                        <Badge variant="secondary">Active</Badge>
                                    </div>
                                    <p className="text-muted-foreground mb-4">{user?.email}</p>
                                    <div className="flex gap-3">
                                        <Button 
                                            onClick={() => setIsEditing(!isEditing)}
                                            variant={isEditing ? 'outline' : 'default'}
                                        >
                                            {isEditing ? 'Cancel' : 'Edit Profile'}
                                        </Button>
                                        <Button variant="outline">
                                            Change Password
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Information */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Full Name
                                    </label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        value={profileData.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Company
                                    </label>
                                    <Input
                                        value={profileData.company}
                                        onChange={(e) => handleChange('company', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Job Title
                                    </label>
                                    <Input
                                        value={profileData.jobTitle}
                                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Your job title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Phone Number
                                    </label>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSave}>
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Stats */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Account Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-3xl font-bold text-blue-600">0</div>
                                    <div className="text-sm text-muted-foreground mt-1">Campaigns Created</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-3xl font-bold text-green-600">0</div>
                                    <div className="text-sm text-muted-foreground mt-1">Emails Sent</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-3xl font-bold text-purple-600">0%</div>
                                    <div className="text-sm text-muted-foreground mt-1">Response Rate</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connected Accounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Accounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <i className="ri-google-fill text-2xl text-red-600"></i>
                                    <div>
                                        <p className="font-medium">Google Account</p>
                                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <Badge variant="success">Connected</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Profile;
