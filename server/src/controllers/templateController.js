import { query } from '../config/database.js';

/**
 * Get all templates (public + user's own)
 */
export const getTemplates = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.query;

        // Use simple query that works with minimal columns
        // Then filter on application side for columns that might not exist
        let queryText = `SELECT * FROM templates WHERE user_id IS NULL OR user_id = $1`;
        const params = [userId];

        queryText += ` ORDER BY created_at DESC`;

        const result = await query(queryText, params);

        // Filter on application side for columns that might not exist
        let templates = result.rows.filter(template => {
            // Filter out inactive templates if is_active column exists
            if (template.is_active === false) return false;
            // Include public templates or user's own
            if (template.is_public === true || template.user_id === userId || template.user_id === null) return true;
            return template.user_id === null; // Default public templates have null user_id
        });

        // Filter by category if specified and category column exists
        if (category && category !== 'all') {
            templates = templates.filter(t => {
                // Only include templates that match the requested category
                // If template has no category, default to 'campaign' for backwards compatibility
                const templateCategory = t.category || 'campaign';
                return templateCategory === category;
            });
        }

        // Sort: favorites first, then by use_count, then by created_at
        templates.sort((a, b) => {
            if (a.is_favorite && !b.is_favorite) return -1;
            if (!a.is_favorite && b.is_favorite) return 1;
            if ((a.use_count || 0) > (b.use_count || 0)) return -1;
            if ((a.use_count || 0) < (b.use_count || 0)) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });

        res.json({
            success: true,
            data: {
                templates: templates,
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
        const userId = req.user.id;

        const result = await query(
            `SELECT * FROM templates WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        const template = result.rows[0];
        
        // Check access - either user owns it, or it's public, or it has null user_id (default)
        const isOwner = template.user_id === userId;
        const isPublic = template.is_public === true || template.user_id === null;
        const isActive = template.is_active !== false;
        
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

        // Try to increment use count (ignore if column doesn't exist)
        try {
            await query(
                'UPDATE templates SET use_count = COALESCE(use_count, 0) + 1 WHERE id = $1',
                [id]
            );
        } catch (e) {
            // Ignore if use_count column doesn't exist
        }

        res.json({
            success: true,
            data: { template }
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
        const userId = req.user.id;
        const { name, category, subject, body } = req.body;

        if (!name || !subject || !body) {
            return res.status(400).json({
                success: false,
                error: 'Name, subject and body are required'
            });
        }

        // Try with all columns first, fallback to minimal columns
        let result;
        try {
            result = await query(
                `INSERT INTO templates (user_id, name, category, subject, body, is_public)
                 VALUES ($1, $2, $3, $4, $5, false)
                 RETURNING *`,
                [userId, name, category || 'campaign', subject, body]
            );
        } catch (insertError) {
            // If category or is_public column doesn't exist, insert with minimal columns
            if (insertError.code === '42703') {
                console.log('Some columns missing, using minimal insert');
                result = await query(
                    `INSERT INTO templates (user_id, name, subject, body)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                    [userId, name, subject, body]
                );
            } else {
                throw insertError;
            }
        }

        res.status(201).json({
            success: true,
            data: { template: result.rows[0] },
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
        const userId = req.user.id;
        const { name, category, subject, body } = req.body;

        // Try with category column first
        let result;
        try {
            result = await query(
                `UPDATE templates 
                 SET name = COALESCE($1, name),
                     category = COALESCE($2, category),
                     subject = COALESCE($3, subject),
                     body = COALESCE($4, body),
                     updated_at = NOW()
                 WHERE id = $5 AND user_id = $6
                 RETURNING *`,
                [name, category, subject, body, id, userId]
            );
        } catch (updateError) {
            if (updateError.code === '42703') {
                // category column doesn't exist
                result = await query(
                    `UPDATE templates 
                     SET name = COALESCE($1, name),
                         subject = COALESCE($2, subject),
                         body = COALESCE($3, body),
                         updated_at = NOW()
                     WHERE id = $4 AND user_id = $5
                     RETURNING *`,
                    [name, subject, body, id, userId]
                );
            } else {
                throw updateError;
            }
        }

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Template not found or not authorized'
            });
        }

        res.json({
            success: true,
            data: { template: result.rows[0] },
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
 * Delete a template (soft delete if possible, otherwise hard delete)
 */
export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        let result;
        try {
            // Try soft delete first
            result = await query(
                `UPDATE templates 
                 SET is_active = false, updated_at = NOW()
                 WHERE id = $1 AND user_id = $2
                 RETURNING id`,
                [id, userId]
            );
        } catch (updateError) {
            if (updateError.code === '42703') {
                // is_active column doesn't exist, do hard delete
                result = await query(
                    `DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING id`,
                    [id, userId]
                );
            } else {
                throw updateError;
            }
        }

        if (result.rows.length === 0) {
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
        const userId = req.user.id;

        // Check if user owns the template
        const template = await query(
            `SELECT * FROM templates WHERE id = $1`,
            [id]
        );

        if (template.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        const templateData = template.rows[0];
        
        // Safe check for is_public - column might not exist
        const isPublic = templateData.is_public === true || templateData.user_id === null;
        const isOwner = templateData.user_id === userId;

        // If it's a public template and user doesn't own it, create a personal copy
        if (isPublic && !isOwner) {
            let newTemplate;
            try {
                newTemplate = await query(
                    `INSERT INTO templates (user_id, name, category, subject, body, is_public, is_favorite)
                     VALUES ($1, $2, $3, $4, $5, false, true)
                     RETURNING *`,
                    [
                        userId,
                        templateData.name + ' (My Copy)',
                        templateData.category || 'campaign',
                        templateData.subject,
                        templateData.body
                    ]
                );
            } catch (insertError) {
                if (insertError.code === '42703') {
                    newTemplate = await query(
                        `INSERT INTO templates (user_id, name, subject, body)
                         VALUES ($1, $2, $3, $4)
                         RETURNING *`,
                        [userId, templateData.name + ' (My Copy)', templateData.subject, templateData.body]
                    );
                } else {
                    throw insertError;
                }
            }

            return res.json({
                success: true,
                data: { template: newTemplate.rows[0] },
                message: 'Template copied to your favorites'
            });
        }

        // Toggle is_favorite for user's own template
        let result;
        try {
            result = await query(
                `UPDATE templates 
                 SET is_favorite = NOT COALESCE(is_favorite, false),
                     updated_at = NOW()
                 WHERE id = $1 AND user_id = $2
                 RETURNING *`,
                [id, userId]
            );
        } catch (updateError) {
            // If is_favorite column doesn't exist, just return success with current template
            // The user should run COMPLETE_SETUP.sql to enable favorites
            if (updateError.code === '42703') {
                console.warn('is_favorite column missing. Please run COMPLETE_SETUP.sql');
                return res.json({
                    success: true,
                    data: { template: templateData },
                    message: 'Favorites feature requires database update'
                });
            }
            throw updateError;
        }

        res.json({
            success: true,
            data: { template: result.rows[0] }
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
