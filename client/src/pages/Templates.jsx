import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Textarea } from '@/components/components/ui/textarea';
import { Badge } from '@/components/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { templatesAPI, aiAPI } from '@/services/api';

const Templates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [activeSection, setActiveSection] = useState('featured'); // 'featured' or 'my-templates'
    const [featuredCategory, setFeaturedCategory] = useState('all'); // for filtering featured templates
    
    // Create/Edit dialog
    const [showDialog, setShowDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'campaign',
        subject: '',
        body: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    
    // AI generation
    const [showAIDialog, setShowAIDialog] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiTone, setAiTone] = useState('professional');
    const [aiCategory, setAiCategory] = useState('campaign');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Delete confirmation
    const [deleteDialog, setDeleteDialog] = useState({ open: false, template: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Featured/Default Templates Data
    const featuredTemplates = {
        campaign: {
            'Job Application': [
                {
                    id: 'ft-job-1',
                    name: 'Software Developer Application',
                    subject: 'Application for {{position}} Role at {{company}}',
                    body: `Dear {{name}},

I am writing to express my strong interest in the {{position}} position at {{company}}. With my background in software development and passion for creating impactful solutions, I believe I would be a valuable addition to your team.

I have experience in building scalable applications and working with modern technologies. I am particularly drawn to {{company}}'s innovative approach to solving complex problems.

I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Please find my resume attached for your review.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
[Your Name]`,
                    category: 'campaign',
                    featured_category: 'Job Application',
                    is_featured: true
                },
                {
                    id: 'ft-job-2',
                    name: 'Internship Application',
                    subject: 'Internship Application - {{position}} at {{company}}',
                    body: `Dear {{name}},

I am a motivated student seeking an internship opportunity at {{company}} for the {{position}} role. I am eager to apply my academic knowledge in a practical setting and contribute to your team.

I am impressed by {{company}}'s work and would love the chance to learn from your experienced professionals. I am a quick learner with strong analytical and problem-solving skills.

I have attached my resume for your consideration. I am available for an interview at your convenience.

Thank you for your time and consideration.

Sincerely,
[Your Name]`,
                    category: 'campaign',
                    featured_category: 'Job Application',
                    is_featured: true
                }
            ],
            'Cold Outreach': [
                {
                    id: 'ft-cold-1',
                    name: 'B2B Sales Introduction',
                    subject: 'Quick Question for {{company}}',
                    body: `Hi {{name}},

I noticed that {{company}} is doing impressive work in your industry. I wanted to reach out because I believe we could help you achieve even better results.

We specialize in helping companies like yours streamline their operations and increase efficiency. Many of our clients have seen significant improvements in their processes.

Would you be open to a brief 15-minute call this week to explore if there's a fit? I promise to be respectful of your time.

Looking forward to connecting,
[Your Name]`,
                    category: 'campaign',
                    featured_category: 'Cold Outreach',
                    is_featured: true
                },
                {
                    id: 'ft-cold-2',
                    name: 'Partnership Proposal',
                    subject: 'Partnership Opportunity with {{company}}',
                    body: `Dear {{name}},

I've been following {{company}}'s growth and achievements, and I'm impressed by what you've accomplished in the market.

I believe there's a strong potential for collaboration between our organizations. We have complementary strengths that could create significant value for both parties.

I'd love to schedule a call to discuss how we might work together. Are you available for a brief conversation this week?

Best regards,
[Your Name]`,
                    category: 'campaign',
                    featured_category: 'Cold Outreach',
                    is_featured: true
                }
            ],
            'Follow Up': [
                {
                    id: 'ft-follow-1',
                    name: 'Interview Follow Up',
                    subject: 'Thank You - {{position}} Interview at {{company}}',
                    body: `Dear {{name}},

Thank you for taking the time to meet with me regarding the {{position}} position at {{company}}. I truly enjoyed learning more about the role and your team.

Our conversation reinforced my enthusiasm for this opportunity. I am confident that my skills and experience would enable me to make meaningful contributions to your team.

Please don't hesitate to reach out if you need any additional information from me. I look forward to hearing about the next steps.

Best regards,
[Your Name]`,
                    category: 'campaign',
                    featured_category: 'Follow Up',
                    is_featured: true
                },
                {
                    id: 'ft-follow-2',
                    name: 'Sales Follow Up',
                    subject: 'Following Up - {{company}}',
                    body: `Hi {{name}},

I wanted to follow up on my previous email regarding how we might help {{company}}. I understand you're busy, so I'll keep this brief.

If now isn't the right time, I completely understand. However, if you're still interested in exploring ways to improve your operations, I'd be happy to share some quick insights.

Would a brief call work for you this week?

Best,
[Your Name]`,
                    category: 'campaign',
                    featured_category: 'Follow Up',
                    is_featured: true
                }
            ],
            'Newsletter': [
                {
                    id: 'ft-news-1',
                    name: 'Monthly Newsletter',
                    subject: '{{company}} Monthly Update - {{month}}',
                    body: `Hi {{name}},

Welcome to our monthly newsletter! Here's what's new:

📢 **Company Updates**
[Share your latest news and achievements]

💡 **Tips & Insights**
[Share valuable content for your audience]

🎉 **Upcoming Events**
[List any upcoming events or webinars]

Thank you for being part of our community, {{name}}. We appreciate your continued support!

Best regards,
The {{company}} Team`,
                    category: 'campaign',
                    featured_category: 'Newsletter',
                    is_featured: true
                }
            ],
            'Event Invitation': [
                {
                    id: 'ft-event-1',
                    name: 'Webinar Invitation',
                    subject: 'You\'re Invited: {{event_name}} - {{company}}',
                    body: `Hi {{name}},

We're excited to invite you to our upcoming webinar!

📅 **Event:** {{event_name}}
🕐 **Date & Time:** [Date and Time]
📍 **Location:** Online (Link will be shared upon registration)

This session will cover valuable insights that can help you and {{company}} achieve your goals.

Don't miss this opportunity! Register now to secure your spot.

[Registration Link]

See you there!
Best regards,
[Your Name]`,
                    category: 'campaign',
                    featured_category: 'Event Invitation',
                    is_featured: true
                }
            ]
        },
        compose: {
            'Professional': [
                {
                    id: 'ft-comp-pro-1',
                    name: 'Meeting Request',
                    subject: 'Meeting Request - [Topic]',
                    body: `Dear [Recipient Name],

I hope this email finds you well. I am writing to request a meeting to discuss [topic/purpose].

I believe this conversation would be valuable for [reason]. I am flexible with timing and can adjust to your schedule.

Would you be available for a [duration]-minute call sometime this week? Please let me know your preferred time, and I'll send a calendar invite.

Thank you for your time and consideration.

Best regards,
[Your Name]`,
                    category: 'compose',
                    featured_category: 'Professional',
                    is_featured: true
                },
                {
                    id: 'ft-comp-pro-2',
                    name: 'Project Update',
                    subject: 'Project Update - [Project Name]',
                    body: `Hi [Recipient Name],

I wanted to provide you with a quick update on [Project Name].

**Progress:**
- [Completed item 1]
- [Completed item 2]
- [In progress item]

**Next Steps:**
- [Upcoming task 1]
- [Upcoming task 2]

**Timeline:** We are on track to complete by [date].

Please let me know if you have any questions or need additional information.

Best regards,
[Your Name]`,
                    category: 'compose',
                    featured_category: 'Professional',
                    is_featured: true
                }
            ],
            'Networking': [
                {
                    id: 'ft-comp-net-1',
                    name: 'LinkedIn Connection Follow Up',
                    subject: 'Great Connecting on LinkedIn',
                    body: `Hi [Name],

Thank you for accepting my connection request on LinkedIn! I've been following your work at [Company] and find it quite inspiring.

I'd love to learn more about your experience in [field/industry]. If you're open to it, I'd appreciate the opportunity to have a brief conversation.

No pressure at all - I understand everyone's busy. But if you have 15-20 minutes sometime, I'd really value your insights.

Thanks again for connecting!

Best,
[Your Name]`,
                    category: 'compose',
                    featured_category: 'Networking',
                    is_featured: true
                },
                {
                    id: 'ft-comp-net-2',
                    name: 'Informational Interview Request',
                    subject: 'Seeking Your Advice - [Industry/Role]',
                    body: `Dear [Name],

I hope this message finds you well. My name is [Your Name], and I'm currently exploring opportunities in [industry/field].

I came across your profile and was impressed by your journey at [Company]. Your experience in [specific area] particularly caught my attention.

I would be grateful if you could spare 15-20 minutes for a brief informational conversation. I'm eager to learn from your experiences and any advice you might have.

Thank you for considering my request. I understand if your schedule doesn't permit, but I truly appreciate any guidance you can offer.

Best regards,
[Your Name]`,
                    category: 'compose',
                    featured_category: 'Networking',
                    is_featured: true
                }
            ],
            'Thank You': [
                {
                    id: 'ft-comp-ty-1',
                    name: 'Thank You After Meeting',
                    subject: 'Thank You for Your Time',
                    body: `Dear [Name],

Thank you so much for taking the time to meet with me today. I really enjoyed our conversation about [topic discussed].

Your insights on [specific point] were particularly valuable, and I'll definitely keep your advice in mind as I move forward.

I appreciate your generosity in sharing your experience. Please don't hesitate to reach out if there's ever anything I can help you with.

Thanks again!

Warm regards,
[Your Name]`,
                    category: 'compose',
                    featured_category: 'Thank You',
                    is_featured: true
                }
            ],
            'Introduction': [
                {
                    id: 'ft-comp-intro-1',
                    name: 'Self Introduction',
                    subject: 'Introduction - [Your Name]',
                    body: `Dear [Recipient Name],

My name is [Your Name], and I am reaching out to introduce myself. I am a [your role/profession] with experience in [your field/expertise].

I came across [how you found them/their work] and was impressed by [specific thing that impressed you]. I believe we share common interests in [shared interest/field].

I would love to connect and explore potential ways we might collaborate or simply exchange ideas.

Looking forward to hearing from you!

Best regards,
[Your Name]`,
                    category: 'compose',
                    featured_category: 'Introduction',
                    is_featured: true
                }
            ]
        }
    };

    // Get all featured categories
    const getFeaturedCategories = () => {
        const categories = new Set(['all']);
        Object.values(featuredTemplates.campaign).forEach(templates => {
            templates.forEach(t => categories.add(t.featured_category));
        });
        Object.values(featuredTemplates.compose).forEach(templates => {
            templates.forEach(t => categories.add(t.featured_category));
        });
        return Array.from(categories);
    };

    // Get filtered featured templates
    const getFilteredFeaturedTemplates = () => {
        let allFeatured = [];
        
        // Flatten campaign templates
        Object.values(featuredTemplates.campaign).forEach(templates => {
            allFeatured = [...allFeatured, ...templates];
        });
        
        // Flatten compose templates
        Object.values(featuredTemplates.compose).forEach(templates => {
            allFeatured = [...allFeatured, ...templates];
        });

        // Filter by category
        if (category !== 'all') {
            allFeatured = allFeatured.filter(t => t.category === category);
        }

        // Filter by featured category
        if (featuredCategory !== 'all') {
            allFeatured = allFeatured.filter(t => t.featured_category === featuredCategory);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            allFeatured = allFeatured.filter(t => 
                t.name.toLowerCase().includes(query) || 
                t.subject.toLowerCase().includes(query) ||
                t.body.toLowerCase().includes(query)
            );
        }

        return allFeatured;
    };

    useEffect(() => {
        fetchTemplates();
    }, [category]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await templatesAPI.getAll(category);
            if (response.success) {
                setTemplates(response.data.templates || []);
            }
        } catch (error) {
            toast('Failed to load templates', {
                icon: <i className="ri-close-circle-line text-red-500"></i>,
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const query = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(query) || 
               t.subject.toLowerCase().includes(query) ||
               t.body.toLowerCase().includes(query);
    });

    const handleCreateNew = () => {
        setEditingTemplate(null);
        setFormData({
            name: '',
            category: 'campaign',
            subject: '',
            body: ''
        });
        setShowDialog(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            category: template.category,
            subject: template.subject,
            body: template.body
        });
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast('Please enter a template name', {
                icon: <i className="ri-error-warning-line text-yellow-500"></i>,
            });
            return;
        }
        if (!formData.subject?.trim()) {
            toast('Please enter a subject', {
                icon: <i className="ri-error-warning-line text-yellow-500"></i>,
            });
            return;
        }
        if (!formData.body?.trim()) {
            toast('Please enter the email body', {
                icon: <i className="ri-error-warning-line text-yellow-500"></i>,
            });
            return;
        }

        setIsSaving(true);
        try {
            if (editingTemplate) {
                const response = await templatesAPI.update(editingTemplate.id, formData);
                if (response.success) {
                    toast('Template updated successfully', {
                        icon: <i className="ri-check-line text-green-500"></i>,
                    });
                    setShowDialog(false);
                    fetchTemplates();
                } else {
                    toast(response.error || 'Failed to update template', {
                        icon: <i className="ri-close-circle-line text-red-500"></i>,
                    });
                }
            } else {
                const response = await templatesAPI.create(formData);
                if (response.success) {
                    toast('Template created successfully', {
                        icon: <i className="ri-add-circle-line text-green-500"></i>,
                    });
                    setShowDialog(false);
                    fetchTemplates();
                } else {
                    toast(response.error || 'Failed to create template', {
                        icon: <i className="ri-close-circle-line text-red-500"></i>,
                    });
                }
            }
        } catch (error) {
            console.error('Save template error:', error);
            toast(error.message || 'Failed to save template', {
                icon: <i className="ri-close-circle-line text-red-500"></i>,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleFavorite = async (template) => {
        try {
            const response = await templatesAPI.toggleFavorite(template.id);
            if (response.success) {
                if (response.data.template.name?.includes('(My Copy)')) {
                    toast('Template copied to your favorites', {
                        icon: <i className="ri-star-fill text-yellow-500"></i>,
                    });
                } else {
                    toast(template.is_favorite ? 'Removed from favorites' : 'Added to favorites', {
                        icon: <i className={`ri-star-${template.is_favorite ? 'line' : 'fill'} text-yellow-500`}></i>,
                    });
                }
                fetchTemplates();
            }
        } catch (error) {
            toast('Failed to update favorite', {
                icon: <i className="ri-close-circle-line text-red-500"></i>,
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.template) return;
        
        setIsDeleting(true);
        try {
            await templatesAPI.delete(deleteDialog.template.id);
            toast('Template deleted', {
                icon: <i className="ri-delete-bin-line text-red-500"></i>,
            });
            setDeleteDialog({ open: false, template: null });
            fetchTemplates();
        } catch (error) {
            toast('Failed to delete template', {
                icon: <i className="ri-close-circle-line text-red-500"></i>,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopy = (template) => {
        navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`);
        toast('Template copied to clipboard', {
            icon: <i className="ri-file-copy-line text-blue-500"></i>,
        });
    };

    const handleUseInCampaign = (template) => {
        // Store template in sessionStorage and navigate to new campaign
        sessionStorage.setItem('campaign_template', JSON.stringify({
            subject: template.subject,
            body: template.body
        }));
        navigate('/campaigns/new');
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            toast('Please describe what kind of email you need', {
                icon: <i className="ri-error-warning-line text-yellow-500"></i>,
            });
            return;
        }

        setIsGenerating(true);
        try {
            // For compose templates, explicitly tell AI to NOT use variables
            // For campaign templates, tell AI to use variables
            const enhancedPrompt = aiCategory === 'campaign'
                ? `${aiPrompt}. 

IMPORTANT: This is a CAMPAIGN template. You MUST use dynamic variables in {{variable_name}} format. 
Use variables like {{name}}, {{company}}, {{position}}, {{role}}, {{first_name}}, {{last_name}}, or other relevant variables.
These variables will be replaced with actual data from a CSV file when sending emails.
Variables should match common CSV column names.`
                : `${aiPrompt}. 

IMPORTANT: This is a COMPOSE template for sending simple one-off emails. 
DO NOT use any variables or placeholders like {{name}} or {{company}}.
Instead, use placeholder text like [RECIPIENT NAME], [COMPANY NAME], [DATE], [TIME] that the user can manually replace.
Write a complete, ready-to-use email with sample/placeholder text.`;
            
            const response = await aiAPI.generateTemplate(enhancedPrompt, aiTone, []);
            
            if (response.success) {
                setFormData({
                    name: `AI: ${aiPrompt.slice(0, 30)}${aiPrompt.length > 30 ? '...' : ''}`,
                    category: aiCategory,
                    subject: response.data.subject || '',
                    body: response.data.body || ''
                });
                setShowAIDialog(false);
                setShowDialog(true);
                setAiPrompt('');
                toast('Template generated! Review and save.', {
                    icon: <i className="ri-magic-line text-blue-500"></i>,
                });
            }
        } catch (error) {
            toast('Failed to generate template', {
                icon: <i className="ri-close-circle-line text-red-500"></i>,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const extractVariables = (text) => {
        const matches = (text || '').match(/\{\{(\w+)\}\}/g) || [];
        return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex">
                <Navbar />
                <Sidebar />
                <main className="ml-64 mt-16 p-6 flex-1">
                    <div className="max-w-6xl mx-auto animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/3"></div>
                        <div className="grid grid-cols-3 gap-4">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-muted rounded-lg"></div>)}
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
                            <h1 className="text-xl font-semibold flex items-center gap-2">
                                <i className="ri-file-list-3-line text-blue-500"></i>
                                Email Templates
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1">
                                Ready-to-use templates for campaigns and compose
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowAIDialog(true)}>
                                <i className="ri-magic-line mr-2"></i>
                                Generate with AI
                            </Button>
                            <Button size="sm" onClick={handleCreateNew}>
                                <i className="ri-add-line mr-2"></i>
                                New Template
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row - All in one row */}
                    <div className="flex items-center gap-3 mb-5">
                        {/* Section Toggle */}
                        <div className="flex bg-muted/50 rounded-lg p-1">
                            <button
                                onClick={() => setActiveSection('featured')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                                    activeSection === 'featured' 
                                        ? 'bg-background shadow text-foreground' 
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <i className="ri-star-line mr-1.5"></i>
                                Featured
                            </button>
                            <button
                                onClick={() => setActiveSection('my-templates')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                                    activeSection === 'my-templates' 
                                        ? 'bg-background shadow text-foreground' 
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <i className="ri-user-line mr-1.5"></i>
                                My Templates
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-6 w-px bg-border"></div>

                        {/* Type Filter */}
                        <Tabs value={category} onValueChange={(val) => setCategory(val)}>
                            <TabsList className="h-9">
                                <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                                <TabsTrigger value="campaign" className="text-xs px-3">Campaign</TabsTrigger>
                                <TabsTrigger value="compose" className="text-xs px-3">Compose</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Spacer */}
                        <div className="flex-1"></div>

                        {/* Search */}
                        <div className="relative w-180">
                            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none"></i>
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    type="button"
                                >
                                    <i className="ri-close-line text-sm"></i>
                                </button>
                            )}
                        </div>

                        {/* Category Filter - only for featured */}
                        {activeSection === 'featured' && (
                            <select
                                value={featuredCategory}
                                onChange={(e) => setFeaturedCategory(e.target.value)}
                                className="h-9 px-3 rounded-md border bg-background text-xs min-w-[140px]"
                            >
                                {getFeaturedCategories().map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Featured Templates Section */}
                    {activeSection === 'featured' && (
                        <>
                            {getFilteredFeaturedTemplates().length === 0 ? (
                                <div className="text-center py-16">
                                    <i className="ri-file-list-3-line text-5xl text-muted-foreground mb-4"></i>
                                    <p className="text-muted-foreground">No featured templates found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {getFilteredFeaturedTemplates().map((template) => {
                                        const variables = extractVariables(template.subject + ' ' + template.body);
                                        
                                        return (
                                            <Card key={template.id} className="group hover:shadow-md flex flex-col h-full">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                                                                <i className="ri-star-fill text-yellow-500 text-xs"></i>
                                                                {template.name}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge 
                                                                    variant={template.category === 'campaign' ? 'default' : 'secondary'}
                                                                    className="text-[10px]"
                                                                >
                                                                    {template.category}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {template.featured_category}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0 flex-1 flex flex-col">
                                                    <div className="bg-muted/40 rounded-lg p-3 mb-3">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                                                        <p className="text-sm truncate">{template.subject}</p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                                                        {template.body}
                                                    </p>
                                                    {template.category === 'campaign' && variables.length > 0 && (
                                                        <div className="mb-3">
                                                            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                                                <i className="ri-braces-line"></i>
                                                                Variables ({variables.length})
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {variables.slice(0, 4).map(v => (
                                                                    <Badge key={v} variant="outline" className="text-[9px] font-mono">
                                                                        {`{{${v}}}`}
                                                                    </Badge>
                                                                ))}
                                                                {variables.length > 4 && (
                                                                    <Badge variant="secondary" className="text-[9px]">
                                                                        +{variables.length - 4} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="mt-auto pt-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="w-full h-8 text-xs"
                                                            onClick={() => handleCopy(template)}
                                                        >
                                                            <i className="ri-file-copy-line mr-1"></i>Copy to Clipboard
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* My Templates Section */}
                    {activeSection === 'my-templates' && (
                        <>
                            {/* Templates Grid */}
                            {filteredTemplates.length === 0 ? (
                                <div className="text-center py-16">
                                    <i className="ri-file-list-3-line text-5xl text-muted-foreground mb-4"></i>
                                    <p className="text-muted-foreground mb-4">No templates found</p>
                                    <Button onClick={handleCreateNew}>
                                        <i className="ri-add-line mr-2"></i>Create Your First Template
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTemplates.map((template) => {
                                        const variables = extractVariables(template.subject + ' ' + template.body);
                                        const isOwned = template.user_id !== null;
                                        
                                        return (
                                            <Card key={template.id} className="group hover:shadow-md transition-shadow flex flex-col h-full">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                                                                {template.is_favorite && (
                                                                    <i className="ri-star-fill text-yellow-500 text-xs"></i>
                                                                )}
                                                                {template.name}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge 
                                                                    variant={(template.category || 'campaign') === 'campaign' ? 'default' : 'secondary'}
                                                                    className="text-[10px]"
                                                                >
                                                                    {template.category || 'campaign'}
                                                                </Badge>
                                                                {template.is_public && !isOwned && (
                                                                    <Badge variant="outline" className="text-[10px]">
                                                                        <i className="ri-global-line mr-1"></i>Public
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0"
                                                                onClick={() => handleToggleFavorite(template)}
                                                                title={template.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                                                            >
                                                                <i className={`ri-star-${template.is_favorite ? 'fill text-yellow-500' : 'line'} text-sm`}></i>
                                                            </Button>
                                                            {isOwned && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 p-0"
                                                                        onClick={() => handleEdit(template)}
                                                                    >
                                                                        <i className="ri-pencil-line text-sm"></i>
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                                                        onClick={() => setDeleteDialog({ open: true, template })}
                                                                    >
                                                                        <i className="ri-delete-bin-line text-sm"></i>
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0 flex-1 flex flex-col">
                                                    <div className="bg-muted/40 rounded-lg p-3 mb-3">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                                                        <p className="text-sm truncate">{template.subject}</p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                                                        {template.body}
                                                    </p>
                                                    {/* Only show variables for campaign templates */}
                                                    {template.category === 'campaign' && variables.length > 0 && (
                                                        <div className="mb-3">
                                                            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                                                <i className="ri-braces-line"></i>
                                                                Required CSV Columns ({variables.length})
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {variables.slice(0, 4).map(v => (
                                                                    <Badge key={v} variant="outline" className="text-[9px] font-mono">
                                                                        {`{{${v}}}`}
                                                                    </Badge>
                                                                ))}
                                                                {variables.length > 4 && (
                                                                    <Badge variant="secondary" className="text-[9px]">
                                                                        +{variables.length - 4} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] text-muted-foreground mt-1">
                                                                These variables will be replaced with values from your CSV
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="mt-auto pt-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="w-full h-8 text-xs"
                                                            onClick={() => handleCopy(template)}
                                                        >
                                                            <i className="ri-file-copy-line mr-1"></i>Copy to Clipboard
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <i className={`ri-${editingTemplate ? 'pencil' : 'add'}-line text-blue-500`}></i>
                            {editingTemplate ? 'Edit Template' : 'New Template'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTemplate ? 'Update your template' : 'Create a reusable email template'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto scrollbar-hide flex-1 pr-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium mb-1.5 block">Name *</label>
                                <Input
                                    placeholder="Template name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block">Type</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                                >
                                    <option value="campaign">Campaign (with variables)</option>
                                    <option value="compose">Compose (simple)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Subject *</label>
                            <Input
                                placeholder={formData.category === 'campaign' ? 'e.g., Application for {{position}} at {{company}}' : 'e.g., Meeting Request'}
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Body *</label>
                            <Textarea
                                placeholder={formData.category === 'campaign' 
                                    ? 'Hi {{name}},\n\nI am writing to express my interest in...' 
                                    : 'Hi,\n\nI hope this email finds you well...'}
                                value={formData.body}
                                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                                className="min-h-[200px] max-h-[300px] resize-none"
                            />
                        </div>
                        {formData.category === 'campaign' && (
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium mb-2 flex items-center gap-1">
                                    <i className="ri-information-line"></i>
                                    Dynamic Variables
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Use <code className="bg-muted px-1 rounded">{`{{variable_name}}`}</code> syntax for dynamic content. 
                                    <strong> Any column name from your CSV file</strong> can be used as a variable. Common examples:
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {['name', 'email', 'company', 'position', 'role', 'first_name', 'last_name'].map(v => (
                                        <Badge key={v} variant="outline" className="text-[10px] font-mono">
                                            {`{{${v}}}`}
                                        </Badge>
                                    ))}
                                    <Badge variant="secondary" className="text-[10px]">+ any CSV column</Badge>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <><i className="ri-loader-4-line animate-spin mr-2"></i>Saving...</>
                            ) : (
                                <><i className="ri-check-line mr-2"></i>{editingTemplate ? 'Update' : 'Create'}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Generation Dialog */}
            <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <i className="ri-magic-line"></i>
                            Generate with AI
                        </DialogTitle>
                        <DialogDescription>
                            Describe what kind of email template you need
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Template Type</label>
                            <select
                                value={aiCategory}
                                onChange={(e) => setAiCategory(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                            >
                                <option value="campaign">Campaign (with variables for bulk sending)</option>
                                <option value="compose">Compose (simple text for one-off emails)</option>
                            </select>
                        </div>
                        
                        {/* Type-specific information */}
                        {aiCategory === 'campaign' ? (
                            <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-3">
                                <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-1.5">
                                    <i className="ri-braces-line"></i>
                                    Campaign Template Variables
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                    AI will automatically include <code className="bg-muted px-1 rounded">{"{{variable}}"}</code> placeholders 
                                    that will be replaced with values from your CSV file when sending emails.
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    <span className="text-[10px] text-muted-foreground">Common variables:</span>
                                    {['name', 'company', 'position', 'first_name'].map(v => (
                                        <span key={v} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                                            {`{{${v}}}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                                    <i className="ri-mail-line"></i>
                                    Compose Template (Simple)
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    AI will generate a complete email with placeholder text like [RECIPIENT NAME] that you can 
                                    manually replace. No variables — ready for one-off emails.
                                </p>
                            </div>
                        )}
                        
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Tone</label>
                            <select
                                value={aiTone}
                                onChange={(e) => setAiTone(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                            >
                                <option value="professional">Professional</option>
                                <option value="friendly">Friendly</option>
                                <option value="formal">Formal</option>
                                <option value="casual">Casual</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Describe your email *</label>
                            <Textarea
                                placeholder={aiCategory === 'campaign' 
                                    ? "e.g., A cold outreach email to hiring managers about our recruitment services"
                                    : "e.g., A job application email for a software developer position, highlighting my React and Node.js experience"
                                }
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                rows={4}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                                💡 Be specific about the purpose, target audience, and any details you want included.
                            </p>
                        </div>
                        
                        {/* AI Disclaimer */}
                        <div className="bg-muted/50 border rounded-lg p-3">
                            <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                                <i className="ri-error-warning-line"></i>
                                AI Disclaimer
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                We use a free-tier AI model to generate emails. The generated content may not always be accurate or perfectly suited for your needs. 
                                <strong className="text-foreground"> Please review and edit the content before sending.</strong>
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAIDialog(false)}>Cancel</Button>
                        <Button onClick={handleGenerateAI} disabled={isGenerating}>
                            {isGenerating ? (
                                <><i className="ri-loader-4-line animate-spin mr-2"></i>Generating...</>
                            ) : (
                                <><i className="ri-magic-line mr-2"></i>Generate</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, template: null })}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <i className="ri-delete-bin-line"></i>
                            Delete Template
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete <strong>{deleteDialog.template?.name}</strong>?
                            <br />
                            <span className="text-xs text-muted-foreground mt-1 block">
                                This action cannot be undone.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, template: null })}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <><i className="ri-loader-4-line animate-spin mr-2"></i>Deleting...</>
                            ) : (
                                <><i className="ri-delete-bin-line mr-2"></i>Delete</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Templates;
