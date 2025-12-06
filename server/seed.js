import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from './src/models/Template.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mailpal';

const defaultTemplates = [
  // Campaign Templates (with variables)
  {
    userId: null,
    name: 'Job Application',
    category: 'campaign',
    subject: 'Application for {{position}} at {{company}}',
    body: `Hi {{name}},

I am writing to express my interest in the {{position}} position at {{company}}. With my background in {{skill}}, I believe I would be a valuable addition to your team.

I would love the opportunity to discuss how my experience aligns with your needs.

Best regards,
{{sender_name}}`,
    variables: ['name', 'position', 'company', 'skill', 'sender_name'],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Follow Up',
    category: 'campaign',
    subject: 'Following up on my application - {{position}}',
    body: `Hi {{name}},

I wanted to follow up on my application for the {{position}} role at {{company}}. I remain very interested in this opportunity and would welcome the chance to discuss my qualifications.

Please let me know if there's any additional information I can provide.

Best regards,
{{sender_name}}`,
    variables: ['name', 'position', 'company', 'sender_name'],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Sales Outreach',
    category: 'campaign',
    subject: 'Quick question about {{company}}',
    body: `Hi {{name}},

I noticed {{company}} has been growing rapidly. Many companies in your space are looking for solutions to {{pain_point}}.

Would you be open to a brief call to explore if we might be able to help?

Best,
{{sender_name}}`,
    variables: ['name', 'company', 'pain_point', 'sender_name'],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Meeting Request',
    category: 'campaign',
    subject: 'Meeting Request - {{topic}}',
    body: `Hi {{name}},

I hope this email finds you well. I would like to schedule a meeting to discuss {{topic}}.

Would you be available for a {{duration}} call this week? Please let me know what times work best for you.

Best regards,
{{sender_name}}`,
    variables: ['name', 'topic', 'duration', 'sender_name'],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Partnership Proposal',
    category: 'campaign',
    subject: 'Partnership Opportunity with {{sender_company}}',
    body: `Hi {{name}},

My name is {{sender_name}} and I recently came across {{company}}. I was impressed by your work in {{industry}}.

I believe there could be great synergy between our organizations. Would you be open to exploring a potential partnership?

Best regards,
{{sender_name}}
{{sender_company}}`,
    variables: ['name', 'company', 'industry', 'sender_name', 'sender_company'],
    isPublic: true,
    isActive: true
  },
  // Compose Templates (no variables)
  {
    userId: null,
    name: 'Professional Thank You',
    category: 'compose',
    subject: 'Thank You',
    body: `Dear Sir/Madam,

Thank you for taking the time to speak with me. I really enjoyed learning more about the opportunity and your organization.

I am very excited about the possibility of joining your team and contributing to your success.

Best regards`,
    variables: [],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Meeting Confirmation',
    category: 'compose',
    subject: 'Meeting Confirmation',
    body: `Hi,

This is to confirm our meeting scheduled for [DATE] at [TIME].

Please let me know if you need to reschedule or if there's anything specific you'd like me to prepare.

Looking forward to our discussion.

Best regards`,
    variables: [],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Quick Check-in',
    category: 'compose',
    subject: 'Quick Check-in',
    body: `Hi,

I hope you're doing well. I wanted to reach out and see how things are going on your end.

If there's anything I can help with, please don't hesitate to let me know.

Best regards`,
    variables: [],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Information Request',
    category: 'compose',
    subject: 'Information Request',
    body: `Hi,

I hope this email finds you well. I am reaching out to request some information regarding [TOPIC].

Specifically, I would like to know:
1. [Question 1]
2. [Question 2]

Thank you for your time and assistance.

Best regards`,
    variables: [],
    isPublic: true,
    isActive: true
  },
  {
    userId: null,
    name: 'Apology Email',
    category: 'compose',
    subject: 'Apology',
    body: `Hi,

I wanted to reach out and sincerely apologize for [REASON]. This was not intentional and I take full responsibility.

I am taking steps to ensure this doesn't happen again. Please let me know if there's anything I can do to make this right.

Best regards`,
    variables: [],
    isPublic: true,
    isActive: true
  }
];

async function seedTemplates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if templates already exist
    const existingCount = await Template.countDocuments({ userId: null, isPublic: true });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing public templates. Skipping seed.`);
      console.log('   To reseed, first delete existing templates with: db.templates.deleteMany({ userId: null })');
    } else {
      console.log('📝 Seeding default templates...');
      await Template.insertMany(defaultTemplates);
      console.log(`✅ Successfully seeded ${defaultTemplates.length} default templates`);
    }

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
