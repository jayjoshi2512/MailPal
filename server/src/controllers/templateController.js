import Template from '../models/Template.js';

/**
 * Transform template to frontend format
 */
const transformTemplate = (template) => {
  const t = template.toObject ? template.toObject() : template;
  return {
    ...t,
    id: t._id,
    user_id: t.userId,
    is_favorite: t.isFavorite,
    is_public: t.isPublic,
    is_active: t.isActive,
    use_count: t.useCount,
    created_at: t.createdAt,
    updated_at: t.updatedAt
  };
};

/**
 * Get all templates (public + user's own)
 */
export const getTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.query;

    // Get user's templates + public templates
    const query = {
      $or: [
        { userId: null },  // System templates
        { userId },        // User's templates
        { isPublic: true } // Public templates
      ],
      isActive: { $ne: false }
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    let templates = await Template.find(query).sort({ createdAt: -1 }).lean();

    // Sort: favorites first, then by use_count, then by created_at
    templates.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      if ((a.useCount || 0) > (b.useCount || 0)) return -1;
      if ((a.useCount || 0) < (b.useCount || 0)) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Transform for frontend
    const transformedTemplates = templates.map(transformTemplate);

    res.json({
      success: true,
      data: {
        templates: transformedTemplates,
        total: templates.length
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
};

/**
 * Get a single template by ID
 */
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        success: false,
        error: 'Valid template ID is required'
      });
    }

    const template = await Template.findById(id).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check access
    const isOwner = template.userId?.toString() === userId.toString();
    const isPublic = template.isPublic === true || template.userId === null;
    const isActive = template.isActive !== false;

    if (!isOwner && !isPublic) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    if (!isActive) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Increment use count
    await Template.findByIdAndUpdate(id, { $inc: { useCount: 1 } });

    res.json({
      success: true,
      data: { template: transformTemplate(template) }
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
};

/**
 * Create a new template
 */
export const createTemplate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, category, subject, body } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Name, subject and body are required'
      });
    }

    const template = await Template.create({
      userId,
      name,
      category: category || 'campaign',
      subject,
      body,
      isPublic: false
    });

    res.status(201).json({
      success: true,
      data: { template: transformTemplate(template) },
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
};

/**
 * Update a template (only user's own)
 */
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, category, subject, body } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (subject !== undefined) updateData.subject = subject;
    if (body !== undefined) updateData.body = body;

    const template = await Template.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found or not authorized'
      });
    }

    res.json({
      success: true,
      data: { template: transformTemplate(template) },
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update template'
    });
  }
};

/**
 * Delete a template (soft delete)
 */
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template'
    });
  }
};

/**
 * Toggle favorite status for a template
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const isPublic = template.isPublic === true || template.userId === null;
    const isOwner = template.userId?.toString() === userId.toString();

    // If it's a public template and user doesn't own it, create a personal copy
    if (isPublic && !isOwner) {
      const newTemplate = await Template.create({
        userId,
        name: template.name + ' (My Copy)',
        category: template.category || 'campaign',
        subject: template.subject,
        body: template.body,
        isPublic: false,
        isFavorite: true
      });

      return res.json({
        success: true,
        data: { template: transformTemplate(newTemplate) },
        message: 'Template copied to your favorites'
      });
    }

    // Toggle is_favorite for user's own template
    template.isFavorite = !template.isFavorite;
    await template.save();

    res.json({
      success: true,
      data: { template: transformTemplate(template) }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle favorite'
    });
  }
};

export default {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleFavorite
};
