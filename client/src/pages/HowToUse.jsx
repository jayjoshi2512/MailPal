import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Badge } from '@/components/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

/**
 * How To Use Page - Clean, Professional, Compact Guide
 */
const HowToUse = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/', { replace: true });
    }, [logout, navigate]);

    const guides = {
        'getting-started': {
            title: 'Getting Started',
            icon: 'ri-rocket-line',
            steps: [
                { title: 'Connect Gmail', desc: 'Click "Connect Google" and sign in. We use secure OAuth - your password stays with Google.' },
                { title: 'Add Contacts', desc: 'Go to Contacts → Add manually or import CSV file with name and email columns.' },
                { title: 'Compose & Send', desc: 'Click Compose, select recipients, write your email, and hit Send!' }
            ]
        },
        'campaigns': {
            title: 'Campaigns',
            icon: 'ri-megaphone-line',
            steps: [
                { title: 'Create Campaign', desc: 'Go to Campaigns → New Campaign. Give it a name and write your email template.' },
                { title: 'Use Variables', desc: 'Use {{name}}, {{company}} in your email - they get replaced with real data.' },
                { title: 'Add Recipients', desc: 'Add recipients with their details. Each person receives a personalized email.' },
                { title: 'Send', desc: 'Click Send Campaign. Emails are sent with delay to avoid spam flags.' }
            ]
        },
        'ai-templates': {
            title: 'AI Templates',
            icon: 'ri-magic-line',
            steps: [
                { title: 'Open AI', desc: 'In Compose page, click the AI button (sparkle icon).' },
                { title: 'Describe', desc: 'Tell AI what you need: "Write a job inquiry for software developer role"' },
                { title: 'Generate', desc: 'AI creates a professional template. Edit as needed and send!' }
            ]
        },
        'variables': {
            title: 'Variables',
            icon: 'ri-braces-line',
            steps: [
                { title: '{{name}}', desc: 'Recipient\'s name → "Hi {{name}}" becomes "Hi John"' },
                { title: '{{company}}', desc: 'Company name → "I saw {{company}} is hiring"' },
                { title: '{{role}}', desc: 'Job title → "As a {{role}} at..."' },
                { title: '{{email}}', desc: 'Recipient\'s email address' }
            ]
        }
    };

    const faqs = [
        { q: 'Is my password safe?', a: 'Yes. We use Google OAuth - we never see your password.' },
        { q: 'Daily email limit?', a: '500/day for Gmail, 2000/day for Google Workspace.' },
        { q: 'Can I attach files?', a: 'Yes, use the attachment button in Compose.' },
        { q: 'Import from Excel?', a: 'Save as CSV with "name" and "email" columns, then import.' }
    ];

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar onLogout={handleLogout} />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-5xl mx-auto">
                    {/* Header - Compact */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-semibold">How to Use</h1>
                            <p className="text-xs text-muted-foreground">Quick guide to get you started</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs"><i className="ri-time-line mr-1"></i>5 min</Badge>
                            <Badge variant="secondary" className="text-xs"><i className="ri-mail-line mr-1"></i>500/day</Badge>
                        </div>
                    </div>

                    {/* Main Content - Tabs */}
                    <Tabs defaultValue="getting-started" className="space-y-3">
                        <TabsList className="grid grid-cols-4 w-full h-9">
                            {Object.entries(guides).map(([key, { title, icon }]) => (
                                <TabsTrigger key={key} value={key} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <i className={`${icon} text-sm`}></i>
                                    <span className="hidden sm:inline">{title}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.entries(guides).map(([key, { steps }]) => (
                            <TabsContent key={key} value={key} className="mt-3">
                                <Card>
                                    <CardContent className="p-3">
                                        <div className="space-y-2">
                                            {steps.map((step, idx) => (
                                                <div key={idx} className="flex gap-3 items-start p-2.5 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                                    <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-sm leading-tight">{step.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Bottom Section - 3 Column Grid */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {/* FAQ */}
                        <Card className="col-span-2">
                            <CardHeader className="pb-2 pt-3 px-3">
                                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                    <i className="ri-question-answer-line"></i>
                                    FAQ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3 pt-0">
                                <div className="grid grid-cols-2 gap-2">
                                    {faqs.map((faq, idx) => (
                                        <div key={idx} className="p-2 rounded border bg-muted/30">
                                            <p className="text-xs font-medium leading-tight">{faq.q}</p>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="pb-2 pt-3 px-3">
                                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                    <i className="ri-flashlight-line"></i>
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/compose')}>
                                    <i className="ri-edit-line mr-2 text-blue-500"></i>Compose Email
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/campaigns/new')}>
                                    <i className="ri-add-line mr-2 text-green-500"></i>New Campaign
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/dashboard')}>
                                    <i className="ri-dashboard-line mr-2 text-purple-500"></i>Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pro Tip - Minimal */}
                    <div className="mt-3 py-2 px-3 rounded border bg-muted/20 flex items-center gap-2 text-xs">
                        <i className="ri-lightbulb-line text-amber-500"></i>
                        <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Tip:</span> Use {'{{name}}'} to personalize emails. Gmail allows 500 emails/day.
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HowToUse;
