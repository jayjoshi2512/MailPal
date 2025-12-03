import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Badge } from '@/components/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

/**
 * How To Use Page - Clean, Professional, Compact Guide
 */
const HowToUse = () => {
    const navigate = useNavigate();

    const guides = {
        'getting-started': {
            title: 'Getting Started',
            icon: 'ri-rocket-line',
            steps: [
                { title: 'Connect Gmail', desc: 'Click "Get Started" on landing page and sign in with Google. We use secure OAuth.' },
                { title: 'Add Contacts', desc: 'Go to Compose page. Add contacts manually or import CSV with name and email columns.' },
                { title: 'Compose & Send', desc: 'Write your email, select recipients from sidebar, and hit Send!' }
            ]
        },
        'campaigns': {
            title: 'Campaigns',
            icon: 'ri-megaphone-line',
            steps: [
                { title: 'Create Campaign', desc: 'Go to Campaigns → New Campaign. Upload CSV/Excel with recipient data.' },
                { title: 'Use Variables', desc: 'Use {{name}}, {{company}} etc. - they auto-replace with data from your file.' },
                { title: 'Add Attachments', desc: 'Attach files (max 5, 10MB each) to include in every email.' },
                { title: 'Launch', desc: 'Click Launch. Emails are sent with delays to avoid spam flags.' }
            ]
        },
        'templates': {
            title: 'Templates',
            icon: 'ri-file-list-3-line',
            steps: [
                { title: 'Two Types', desc: 'Campaign templates use {{variables}} from CSV. Compose templates are plain text for one-off emails.' },
                { title: 'Browse & Filter', desc: 'Use the tabs to filter by All, Campaign, or Compose. Search by name, subject, or content.' },
                { title: 'Create Manually', desc: 'Click "New Template" to build from scratch. Choose Campaign or Compose type.' },
                { title: 'AI Generation', desc: 'Click "Generate with AI" — Campaign AI uses variables, Compose AI creates plain text.' },
                { title: 'Use & Copy', desc: 'Copy templates to clipboard or use Campaign templates directly in a new campaign.' }
            ]
        },
        'compose': {
            title: 'Compose',
            icon: 'ri-edit-line',
            steps: [
                { title: 'Add Contacts', desc: 'Use the contacts sidebar to select recipients. Star ⭐ your favorites!' },
                { title: 'Write Email', desc: 'Compose subject and body. Use AI to generate professional templates.' },
                { title: 'Attach Files', desc: 'Click attachment icon to add files. Multiple files supported.' },
                { title: 'Send', desc: 'Review and click Send. Each recipient gets an individual email.' }
            ]
        },
        'variables': {
            title: 'Variables',
            icon: 'ri-braces-line',
            steps: [
                { title: '{{name}}', desc: 'Recipient\'s name → "Hi {{name}}" becomes "Hi John"' },
                { title: '{{company}}', desc: 'Company name → "I saw {{company}} is hiring"' },
                { title: '{{role}}', desc: 'Job title → "As a {{role}} at..."' },
                { title: 'Custom', desc: 'Any column from your CSV can be used as a variable!' }
            ]
        }
    };

    const faqs = [
        { q: 'Is my data safe?', a: 'Yes. We use Google OAuth - we never see your password. Emails sent via Gmail API.' },
        { q: 'Daily email limit?', a: '500/day for Gmail, 2000/day for Google Workspace accounts.' },
        { q: 'Can I attach files?', a: 'Yes! Both Compose and Campaigns support attachments (max 5 files, 10MB each).' },
        { q: 'Import from Excel?', a: 'Yes! Upload CSV or Excel files with columns like name, email, company etc.' },
        { q: 'Campaign vs Compose templates?', a: 'Campaign templates use {{variables}} replaced by CSV data. Compose templates are plain text.' },
        { q: 'What are variables?', a: 'Placeholders like {{name}}, {{company}} that are replaced with actual data from your CSV file.' }
    ];

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
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
                        <TabsList className="grid grid-cols-5 w-full h-9">
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
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/templates')}>
                                    <i className="ri-file-list-3-line mr-2 text-amber-500"></i>Templates
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate('/dashboard')}>
                                    <i className="ri-dashboard-line mr-2 text-teal-500"></i>Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pro Tips */}
                    <div className="mt-3 py-2 px-3 rounded border bg-muted/20 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                            <i className="ri-lightbulb-line text-amber-500"></i>
                            <span className="text-muted-foreground">
                                <span className="font-medium text-foreground">Variables:</span> Use {'{{name}}'}, {'{{company}}'} in Campaign templates. These are replaced with data from your CSV.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="ri-file-list-3-line text-green-500"></i>
                            <span className="text-muted-foreground">
                                <span className="font-medium text-foreground">Templates:</span> Campaign templates have variables for bulk emails. Compose templates are plain text for one-off emails.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="ri-attachment-line text-blue-500"></i>
                            <span className="text-muted-foreground">
                                <span className="font-medium text-foreground">Attachments:</span> Add up to 5 files (10MB each) in Campaigns.
                            </span>
                        </div>
                    </div>

                    {/* AI Disclaimer */}
                    <div className="mt-3 py-2.5 px-3 rounded border border-amber-500/30 bg-amber-500/5 text-xs">
                        <div className="flex items-start gap-2">
                            <i className="ri-error-warning-line text-amber-500 mt-0.5"></i>
                            <div>
                                <span className="font-medium text-amber-600 dark:text-amber-400">AI Generation Disclaimer:</span>
                                <span className="text-muted-foreground ml-1">
                                    We use a free-tier AI model to generate email templates. The generated content may not always be accurate or perfectly suited for your needs. 
                                    <strong className="text-foreground"> Always review and edit AI-generated content before sending.</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HowToUse;
