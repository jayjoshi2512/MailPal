// Featured/Default Templates Data
export const featuredTemplates = {
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
export const getFeaturedCategories = () => {
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
export const getFilteredFeaturedTemplates = (category, featuredCategory, searchQuery) => {
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
