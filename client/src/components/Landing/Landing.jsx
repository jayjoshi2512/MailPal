import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import RotatingText from './RotatingText';
import CardSwap, { Card as SwapCard } from './CardSwap'

const Landing = () => {
    const navigate = useNavigate();

    // Sync interval for both animations
    const ANIMATION_INTERVAL = 4000;

    const stats = [
        { value: '500+', label: 'Emails/Day', icon: 'ri-mail-send-line' },
        { value: '25MB', label: 'Attachment Limit', icon: 'ri-attachment-2' },
        { value: '100%', label: 'Free to Use', icon: 'ri-gift-line' },
    ];

    const features = [
        {
            icon: 'ri-google-fill',
            title: 'Gmail Integration',
            desc: 'Secure OAuth authentication. Send emails directly through your Gmail account without sharing passwords.',
        },
        {
            icon: 'ri-megaphone-line',
            title: 'Campaign Management',
            desc: 'Create bulk email campaigns with CSV imports, variable personalization, and progress tracking.',
        },
        {
            icon: 'ri-file-list-3-line',
            title: 'Template Library',
            desc: 'Pre-built templates with {{variables}} support. Create custom templates or generate with AI.',
        },
        {
            icon: 'ri-quill-pen-line',
            title: 'Rich Text Editor',
            desc: 'Full-featured editor with formatting options, inline images, and professional styling.',
        },
        {
            icon: 'ri-contacts-book-line',
            title: 'Contact Management',
            desc: 'Import contacts via CSV, organize with favorites, and manage recipient lists efficiently.',
        },
        {
            icon: 'ri-bar-chart-2-line',
            title: 'Analytics Dashboard',
            desc: 'Track sent emails, campaign performance, and activity with visual charts and statistics.',
        },
    ];

    const workflow = [
        { step: '01', title: 'Connect', desc: 'Sign in with Google', icon: 'ri-link' },
        { step: '02', title: 'Import', desc: 'Add your contacts', icon: 'ri-upload-2-line' },
        { step: '03', title: 'Compose', desc: 'Write your email', icon: 'ri-edit-2-line' },
        { step: '04', title: 'Send', desc: 'Launch campaign', icon: 'ri-send-plane-fill' },
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="min-h-[calc(100vh-4rem)] flex flex-col-reverse md:flex-row md:items-center md:justify-between py-8 md:py-0 overflow-hidden">
                {/* Left - Content (60%) */}
                <div className="md:w-[55%] lg:w-[60%] space-y-5">
                    {/* Headline - Black text only */}
                    <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold font-maorin leading-[1.05] tracking-tight">
                        Make Every<br />Mail Count.
                    </h1>

                    {/* Subheadline with Rotating Text - Black/White theme */}
                    <div className="flex items-center flex-wrap gap-2 text-base sm:text-lg text-muted-foreground">
                        <span>We exist because every mail</span>
                        <RotatingText
                            texts={['Counts', 'Matters', 'Connects', 'Important']}
                            mainClassName="px-3 py-1 bg-foreground text-background rounded text-base sm:text-lg font-semibold"
                            staggerFrom="first"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-120%" }}
                            staggerDuration={0.025}
                            splitLevelClassName="overflow-hidden"
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            rotationInterval={ANIMATION_INTERVAL}
                        />
                    </div>

                    {/* Description - Compact */}
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                        Professional cold email platform for sending personalized campaigns at scale. 
                        Connect Gmail, import contacts, and start reaching people efficiently.
                    </p>

                    {/* CTA Button - Black/White */}
                    <div>
                        <Button
                        onClick={() => navigate('/connect')}
                        size="lg"
                        className="bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 px-8"
                    >
                        <i className="ri-google-fill mr-2"></i>
                        Get Started Free
                    </Button>
                    </div>
                </div>

                {/* Right - Card Animation (40%) - Centered with proper height for cardDistance 60 */}
                <div className="md:w-[45%] lg:w-[40%] flex justify-center items-center mb-8 md:mb-0">
                    <div className="relative w-full max-w-[420px] h-[460px] sm:max-w-[440px] sm:h-[480px] flex items-center justify-center">
                        <CardSwap
                            cardDistance={60}
                            verticalDistance={60}
                            delay={ANIMATION_INTERVAL}
                            pauseOnHover={false}
                        >
                            {/* Job Application Card - Blue header */}
                            <SwapCard className="flex flex-col p-0 overflow-hidden">
                                <div className="bg-blue-100 dark:bg-blue-950/50 px-5 py-3 border-b flex items-center gap-2">
                                    <i className="ri-briefcase-line text-blue-600"></i>
                                    <span className="font-semibold text-sm">Job Application</span>
                                </div>
                                <div className="p-5 space-y-3 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">From:</span>
                                        <span>john.dev@gmail.com</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">To:</span>
                                        <span>hr@techstartup.com</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
                                        <span className="font-medium">Application for Senior Developer Role</span>
                                    </div>
                                    <div className="border-t pt-4 mt-3 text-muted-foreground leading-relaxed">
                                        <p>Dear Hiring Manager,</p>
                                        <p className="mt-2">I'm excited to apply for the Senior Developer position. With 5 years of experience in React and Node.js, I believe I'd be a great fit...</p>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                            <i className="ri-attachment-2"></i>
                                            <span>2 attachments</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <i className="ri-file-text-line"></i>
                                                Resume.pdf
                                            </span>
                                            <span className="text-blue-600 underline cursor-pointer">Portfolio</span>
                                        </div>
                                    </div>
                                </div>
                            </SwapCard>
                            {/* Marketing Outreach Card - Green header */}
                            <SwapCard className="flex flex-col p-0 overflow-hidden">
                                <div className="bg-green-100 dark:bg-green-950/50 px-5 py-3 border-b flex items-center gap-2">
                                    <i className="ri-line-chart-line text-green-600"></i>
                                    <span className="font-semibold text-sm">Marketing Outreach</span>
                                </div>
                                <div className="p-5 space-y-3 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">From:</span>
                                        <span>sales@growthco.io</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">To:</span>
                                        <span>{'{{email}}'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
                                        <span className="font-medium">Hi {'{{name}}'}, let's talk growth</span>
                                    </div>
                                    <div className="border-t pt-4 mt-3 text-muted-foreground leading-relaxed">
                                        <p>Hi {'{{name}}'},</p>
                                        <p className="mt-2">I noticed {'{{company}}'} is scaling fast. We helped similar companies increase their outreach by 3x...</p>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                            <i className="ri-attachment-2"></i>
                                            <span>1 attachment</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <i className="ri-file-text-line"></i>
                                                CaseStudy.pdf
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwapCard>
                            {/* Partnership Card - Purple header */}
                            <SwapCard className="flex flex-col p-0 overflow-hidden">
                                <div className="bg-purple-100 dark:bg-purple-950/50 px-5 py-3 border-b flex items-center gap-2">
                                    <i className="ri-handshake-line text-purple-600"></i>
                                    <span className="font-semibold text-sm">Partnership Proposal</span>
                                </div>
                                <div className="p-5 space-y-3 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">From:</span>
                                        <span>partner@saasapp.com</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">To:</span>
                                        <span>founder@innovate.io</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
                                        <span className="font-medium">Partnership Opportunity</span>
                                    </div>
                                    <div className="border-t pt-4 mt-3 text-muted-foreground leading-relaxed">
                                        <p>Hey Alex,</p>
                                        <p className="mt-2">Love what you're building! I think our tools could work great together. Would love to explore a partnership...</p>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                            <i className="ri-attachment-2"></i>
                                            <span>1 attachment</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <i className="ri-file-text-line"></i>
                                                Proposal.pptx
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwapCard>
                        </CardSwap>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-6 border-y">
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <i className={`${stat.icon} text-lg`}></i>
                            </div>
                            <div>
                                <div className="font-bold text-lg">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="mb-10">
                    <Badge variant="outline" className="mb-3 text-xs">
                        <i className="ri-stack-line mr-1"></i>
                        Features
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold font-maorin">
                        Everything you need for cold emailing
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm max-w-lg">
                        Built for professionals who want to reach more people without the complexity.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {features.map((feature, idx) => (
                        <Card key={idx} className="p-4 hover:border-foreground/20 transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
                                    <i className={`${feature.icon} text-base`}></i>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 border-t">
                <div className="mb-10">
                    <Badge variant="outline" className="mb-3 text-xs">
                        <i className="ri-route-line mr-1"></i>
                        Workflow
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold font-maorin">
                        Simple 4-step process
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm max-w-lg">
                        From sign up to sending your first campaign in minutes.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {workflow.map((item, idx) => (
                        <Card key={idx} className="p-4 text-center relative overflow-hidden">
                            <div className="absolute top-2 left-2 text-[10px] font-bold text-muted-foreground/50">
                                {item.step}
                            </div>
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                <i className={`${item.icon} text-xl`}></i>
                            </div>
                            <h3 className="font-semibold text-sm">{item.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-16 border-t">
                <div className="mb-10">
                    <Badge variant="outline" className="mb-3 text-xs">
                        <i className="ri-user-star-line mr-1"></i>
                        Use Cases
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold font-maorin">
                        Built for professionals
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { icon: 'ri-briefcase-line', title: 'Job Seekers', desc: 'Send personalized applications to multiple companies' },
                        { icon: 'ri-line-chart-line', title: 'Sales Teams', desc: 'Reach prospects with personalized outreach at scale' },
                        { icon: 'ri-building-line', title: 'Recruiters', desc: 'Contact candidates efficiently with bulk emails' },
                        { icon: 'ri-rocket-line', title: 'Startups', desc: 'Build partnerships and grow your network' },
                    ].map((item, idx) => (
                        <Card key={idx} className="p-4">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center mb-3">
                                <i className={`${item.icon} text-sm`}></i>
                            </div>
                            <h3 className="font-semibold text-sm">{item.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 border-t">
                <Card className="p-8 md:p-12 text-center bg-muted/30">
                    <Badge variant="secondary" className="mb-4 text-xs">
                        <i className="ri-gift-line mr-1 text-green-500"></i>
                        Free to use
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold font-maorin mb-3">
                        Ready to start sending?
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                        Connect your Gmail account and send your first campaign today. No credit card required.
                    </p>
                    <Button
                        onClick={() => navigate('/connect')}
                        size="lg"
                        className="bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 px-8"
                    >
                        <i className="ri-google-fill mr-2"></i>
                        Get Started Free
                    </Button>
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                        <span>✓ No credit card</span>
                        <span>✓ 500 emails/day</span>
                        <span>✓ Cancel anytime</span>
                    </div>
                </Card>
            </section>

            {/* Footer */}
            <footer className="py-6 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <i className="ri-send-plane-fill text-lg"></i>
                        <span className="font-bold font-maorin">MailKar</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} MailKar. Built for cold emailers.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                        <a href="https://github.com/jayjoshi2512/Cold-Mailer" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                            <i className="ri-github-fill text-base"></i>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;