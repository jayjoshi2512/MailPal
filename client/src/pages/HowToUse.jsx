import React from 'react';
import { Badge } from '@/components/components/ui/badge';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { GuidesTabs, FAQSection, QuickActions, ProTips } from '@/components/HowToUse';

/**
 * How To Use Page - Clean, Professional, Compact Guide
 */
const HowToUse = () => {
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
                    <GuidesTabs guides={guides} />

                    {/* Bottom Section - 3 Column Grid */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <FAQSection faqs={faqs} />
                        <QuickActions />
                    </div>

                    {/* Pro Tips & AI Disclaimer */}
                    <ProTips />
                </div>
            </main>
        </div>
    );
};

export default HowToUse;
