import Contact from '../models/Contact.js';
import Papa from 'papaparse';

/**
 * Personal Contacts Controller
 * Manages contacts for the Compose page (personal contacts only)
 * Campaign contacts are handled separately in contactController.js
 */

/**
 * Transform contact to frontend format with snake_case aliases
 */
const transformContact = (contact) => {
  const c = contact.toObject ? contact.toObject() : contact;
  return {
    ...c,
    id: c._id,
    is_favorite: c.isFavorite,
    is_active: c.isActive,
    created_at: c.createdAt,
    updated_at: c.updatedAt
  };
};

/**
 * Get all personal contacts for the authenticated user
 */
export const getAllContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search } = req.query;

    const query = { userId, isActive: true };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ isFavorite: -1, createdAt: -1 })
      .lean();

    // Transform data to ensure consistent name field and snake_case aliases
    const transformedContacts = contacts.map(contact => {
      if (!contact.name && (contact.firstName || contact.lastName)) {
        contact.name = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
      }
      return transformContact(contact);
    });

    res.json({
      success: true,
      data: {
        contacts: transformedContacts,
        total: transformedContacts.length
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts'
    });
  }
};

/**
 * Create a single personal contact
 */
export const createContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, name, first_name, last_name, company, job_title, phone, notes } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({ userId, email, isActive: true });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        error: 'Contact with this email already exists'
      });
    }

    // Create contact
    const contact = await Contact.create({
      userId,
      email,
      name: name || null,
      firstName: first_name || null,
      lastName: last_name || null,
      company: company || null,
      jobTitle: job_title || null,
      phone: phone || null,
      notes: notes || null
    });

    res.json({
      success: true,
      data: { contact: transformContact(contact) }
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contact'
    });
  }
};

/**
 * Upload contacts from CSV file (personal contacts)
 */
export const uploadContactsCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required'
      });
    }

    // Parse CSV
    let parsed;
    try {
      parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_')
      });
    } catch (parseError) {
      console.error('CSV parse error:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Invalid CSV format'
      });
    }

    const contacts = parsed.data;
    
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No contacts found in CSV. Make sure your CSV has headers and data rows.'
      });
    }
    
    let added = 0;
    let skipped = 0;
    let errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const contact of contacts) {
      const email = (
        contact.email || contact.e_mail || contact['e-mail'] || contact.mail || contact.email_address
      )?.toString().trim();
      
      let name = (
        contact.name || contact.full_name || contact.fullname
      )?.toString().trim() || null;
      
      const firstName = (
        contact.first_name || contact.firstname || contact.first
      )?.toString().trim() || null;
      
      const lastName = (
        contact.last_name || contact.lastname || contact.last
      )?.toString().trim() || null;
      
      const company = (
        contact.company || contact.organization || contact.org
      )?.toString().trim() || null;

      if (!name && (firstName || lastName)) {
        name = [firstName, lastName].filter(Boolean).join(' ');
      }

      if (!email) {
        skipped++;
        continue;
      }

      if (!emailRegex.test(email)) {
        skipped++;
        errors.push({ email, reason: 'Invalid email format' });
        continue;
      }

      try {
        const existingContact = await Contact.findOne({ userId, email, isActive: true });

        if (existingContact) {
          skipped++;
          continue;
        }

        await Contact.create({
          userId,
          email,
          name,
          firstName,
          lastName,
          company
        });
        added++;
      } catch (err) {
        if (err.code === 11000) {
          skipped++;
        } else {
          console.error('Insert error for', email, ':', err.message);
          skipped++;
          errors.push({ email, reason: err.message });
        }
      }
    }

    res.json({
      success: true,
      data: {
        added,
        skipped,
        total: contacts.length,
        errors: errors.length > 0 && errors.length <= 10 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Error uploading contacts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload contacts'
    });
  }
};

/**
 * Update a contact
 */
export const updateContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { email, name, first_name, last_name, company, job_title, phone, notes } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      const existingContact = await Contact.findOne({
        userId,
        email,
        _id: { $ne: id },
        isActive: true
      });

      if (existingContact) {
        return res.status(400).json({
          success: false,
          error: 'Another contact with this email already exists'
        });
      }
    }

    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (first_name !== undefined) updateData.firstName = first_name;
    if (last_name !== undefined) updateData.lastName = last_name;
    if (company !== undefined) updateData.company = company;
    if (job_title !== undefined) updateData.jobTitle = job_title;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;

    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      updateData,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
};

/**
 * Delete a contact (soft delete)
 */
export const deleteContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: { deleted: true }
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
    });
  }
};

/**
 * Toggle favorite status for a contact
 */
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const contact = await Contact.findOne({ _id: id, userId, isActive: true });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    res.json({
      success: true,
      data: { contact: transformContact(contact) }
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle favorite'
    });
  }
};

/**
 * Bulk favorite contacts
 */
export const bulkFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contact IDs array is required'
      });
    }

    const result = await Contact.updateMany(
      { _id: { $in: ids }, userId, isActive: true },
      { isFavorite: true }
    );

    const contacts = await Contact.find({ _id: { $in: ids }, userId }).lean();

    res.json({
      success: true,
      data: { 
        updated: result.modifiedCount,
        contacts
      }
    });
  } catch (error) {
    console.error('Error bulk favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update favorites'
    });
  }
};

/**
 * Bulk delete contacts (soft delete)
 */
export const bulkDelete = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contact IDs array is required'
      });
    }

    const result = await Contact.updateMany(
      { _id: { $in: ids }, userId },
      { isActive: false }
    );

    res.json({
      success: true,
      data: { 
        deleted: result.modifiedCount 
      }
    });
  } catch (error) {
    console.error('Error bulk delete:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contacts'
    });
  }
};
