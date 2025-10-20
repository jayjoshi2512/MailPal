import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Input } from '@/components/components/ui/input';
import { Button } from '@/components/components/ui/button';
import { Separator } from '@/components/components/ui/separator';

const Settings = () => {
    const { logout } = useAuth();
    const [settings, setSettings] = useState({
        emailsPerDay: 50,
        delayBetweenEmails: 60,
        enableTracking: true,
        enableAutoFollowUp: false,
        followUpDelay: 3,
    });

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log('Saving settings:', settings);
        // TODO: Implement API call to save settings
        toast.success('Settings saved successfully!');
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar onLogout={logout} />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold font-maorin mb-6">Settings</h1>

                    {/* Email Settings */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Emails per day
                                </label>
                                <Input
                                    type="number"
                                    value={settings.emailsPerDay}
                                    onChange={(e) => handleChange('emailsPerDay', parseInt(e.target.value))}
                                    min="1"
                                    max="500"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Maximum number of emails to send per day (1-500)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Delay between emails (seconds)
                                </label>
                                <Input
                                    type="number"
                                    value={settings.delayBetweenEmails}
                                    onChange={(e) => handleChange('delayBetweenEmails', parseInt(e.target.value))}
                                    min="30"
                                    max="300"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Wait time between sending each email (30-300 seconds)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tracking Settings */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Tracking & Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Enable email tracking</p>
                                    <p className="text-sm text-muted-foreground">
                                        Track opens and clicks in your emails
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.enableTracking}
                                    onChange={(e) => handleChange('enableTracking', e.target.checked)}
                                    className="w-4 h-4"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Follow-up Settings */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Automatic Follow-ups</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Enable auto follow-up</p>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically send follow-up emails to non-responders
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.enableAutoFollowUp}
                                    onChange={(e) => handleChange('enableAutoFollowUp', e.target.checked)}
                                    className="w-4 h-4"
                                />
                            </div>

                            {settings.enableAutoFollowUp && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Follow-up delay (days)
                                    </label>
                                    <Input
                                        type="number"
                                        value={settings.followUpDelay}
                                        onChange={(e) => handleChange('followUpDelay', parseInt(e.target.value))}
                                        min="1"
                                        max="14"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Days to wait before sending follow-up (1-14 days)
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-500">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <Button 
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm('Are you sure? This action cannot be undone.')) {
                                            toast.error('Account deletion not implemented yet');
                                        }
                                    }}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="my-6" />

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button onClick={handleSave} size="lg">
                            Save Settings
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
