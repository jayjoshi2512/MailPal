import CampaignContact from '../models/CampaignContact.js';
import Campaign from '../models/Campaign.js';

/**
 * Campaign Contacts Controller
 * Manages contacts for campaigns (stored in CampaignContact model)
 * These are separate from personal contacts
 */

/**
 * Get all contacts for a campaign
 * Returns recipients from SentEmail table (actual sent emails)
 */
export const getContacts = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;
    const { status, limit = 100, offset = 0 } = req.query;

    // Verify campaign ownership
    const campaign = await Campaign.findOne({ _id: campaignId, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Import SentEmail model
    const SentEmail = (await import('../models/SentEmail.js')).default;

    // Get unique recipients from SentEmail table for this campaign
    const sentEmails = await SentEmail.find({ campaignId, userId })
      .select('recipientEmail recipientName sentAt')
      .sort({ sentAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    // Transform to contact format
    const contacts = sentEmails.map(email => ({
      email: email.recipientEmail,
      name: email.recipientName,
      sentAt: email.sentAt
    }));

    // Remove duplicates based on email
    const uniqueContacts = Array.from(
      new Map(contacts.map(c => [c.email, c])).values()
    );

    const total = await SentEmail.countDocuments({ campaignId, userId });

    res.json({
      success: true,
      data: {
        contacts: uniqueContacts,
        total: uniqueContacts.length,
      },
    });
  } catch (error) {
    console.error('Get campaign contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts',
    });
  }
};

/**
 * Add a single contact to a campaign
 */
export const addContact = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;
    const { email, name, first_name, last_name, company, job_title, custom_fields } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Verify campaign ownership
    const campaign = await Campaign.findOne({ _id: campaignId, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Build name if not provided
    const contactName = name || [first_name, last_name].filter(Boolean).join(' ') || null;

    const contact = await CampaignContact.create({
      campaignId,
      userId,
      email,
      name: contactName,
      firstName: first_name || null,
      lastName: last_name || null,
      company: company || null,
      jobTitle: job_title || null,
      customFields: custom_fields || {}
    });

    res.status(201).json({
      success: true,
      data: { contact },
      message: 'Contact added successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Contact already exists in this campaign',
      });
    }
    console.error('Add campaign contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add contact',
    });
  }
};

/**
 * Bulk add contacts to a campaign
 */
export const bulkAddContacts = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contacts array is required',
      });
    }

    // Verify campaign ownership
    const campaign = await Campaign.findOne({ _id: campaignId, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Prepare contacts for bulk insert
    const contactDocs = contacts.map((contact) => ({
      campaignId,
      userId,
      email: contact.email,
      name: contact.name || [contact.first_name, contact.last_name].filter(Boolean).join(' ') || null,
      firstName: contact.first_name || null,
      lastName: contact.last_name || null,
      company: contact.company || null,
      jobTitle: contact.job_title || null,
      customFields: contact.custom_fields || {}
    }));

    // Insert with ordered: false to continue on duplicates
    let added = 0;
    let skipped = 0;

    try {
      const result = await CampaignContact.insertMany(contactDocs, { ordered: false });
      added = result.length;
      skipped = contacts.length - added;
    } catch (bulkError) {
      if (bulkError.insertedDocs) {
        added = bulkError.insertedDocs.length;
      }
      skipped = contacts.length - added;
    }

    const addedContacts = await CampaignContact.find({ campaignId })
      .sort({ createdAt: -1 })
      .limit(contacts.length)
      .lean();

    res.status(201).json({
      success: true,
      data: {
        contacts: addedContacts,
        added,
        skipped,
      },
      message: `${added} contacts added successfully`,
    });
  } catch (error) {
    console.error('Bulk add campaign contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add contacts',
    });
  }
};

/**
 * Update a campaign contact
 */
export const updateContact = async (req, res) => {
  try {
    const { campaignId, contactId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Verify campaign ownership
    const campaign = await Campaign.findOne({ _id: campaignId, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    const allowedFields = ['email', 'name', 'firstName', 'lastName', 'company', 'jobTitle', 'customFields', 'status'];
    
    const updateData = {};
    Object.keys(updates).forEach((key) => {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (allowedFields.includes(camelKey)) {
        updateData[camelKey] = updates[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    const contact = await CampaignContact.findOneAndUpdate(
      { _id: contactId, campaignId },
      updateData,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    res.json({
      success: true,
      data: { contact },
      message: 'Contact updated successfully',
    });
  } catch (error) {
    console.error('Update campaign contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact',
    });
  }
};

/**
 * Delete a campaign contact (soft delete)
 */
export const deleteContact = async (req, res) => {
  try {
    const { campaignId, contactId } = req.params;
    const userId = req.user._id;

    // Verify campaign ownership
    const campaign = await Campaign.findOne({ _id: campaignId, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    const contact = await CampaignContact.findOneAndUpdate(
      { _id: contactId, campaignId },
      { isActive: false },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Delete campaign contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact',
    });
  }
};
