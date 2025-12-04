import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { templatesAPI, aiAPI } from '@/services/api';
import {
    TemplatesHeader,
    TemplatesFilters,
    TemplateCard,
    CreateTemplateDialog,
    AIGenerateDialog,
    DeleteTemplateDialog,
    TemplatesSkeleton,
    EmptyTemplates,
    getFeaturedCategories,
    getFilteredFeaturedTemplates
} from '@/components/Templates';

const Templates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [activeSection, setActiveSection] = useState('my-templates');
    const [featuredCategory, setFeaturedCategory] = useState('all');
    
    // Create/Edit dialog
    const [showDialog, setShowDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'campaign', subject: '', body: '' });
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
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    // Filter to only show user's own templates (exclude public templates where user_id is null)
    const myTemplates = templates.filter(t => t.user_id !== null);
    
    const filteredTemplates = myTemplates.filter(t => {
        const query = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(query) || 
               t.subject.toLowerCase().includes(query) ||
               t.body.toLowerCase().includes(query);
    });

    const handleCreateNew = () => {
        setEditingTemplate(null);
        setFormData({ name: '', category: 'campaign', subject: '', body: '' });
        setShowDialog(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({ name: template.name, category: template.category, subject: template.subject, body: template.body });
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!formData.name?.trim() || !formData.subject?.trim() || !formData.body?.trim()) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsSaving(true);
        try {
            const response = editingTemplate 
                ? await templatesAPI.update(editingTemplate.id, formData)
                : await templatesAPI.create(formData);
            
            if (response.success) {
                toast.success(editingTemplate ? 'Template updated' : 'Template created');
                setShowDialog(false);
                fetchTemplates();
            } else {
                toast.error(response.error || 'Failed to save template');
            }
        } catch (error) {
            toast.error('Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleFavorite = async (template) => {
        try {
            const response = await templatesAPI.toggleFavorite(template.id);
            if (response.success) {
                toast.success(template.is_favorite ? 'Removed from favorites' : 'Added to favorites');
                fetchTemplates();
            }
        } catch (error) {
            toast.error('Failed to update favorite');
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.template) return;
        
        setIsDeleting(true);
        try {
            await templatesAPI.delete(deleteDialog.template.id);
            toast.success('Template deleted');
            setDeleteDialog({ open: false, template: null });
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopy = (template) => {
        navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`);
        toast.success('Template copied to clipboard');
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Please describe what kind of email you need');
            return;
        }

        setIsGenerating(true);
        try {
            const enhancedPrompt = aiCategory === 'campaign'
                ? `${aiPrompt}. IMPORTANT: Use dynamic variables in {{variable_name}} format like {{name}}, {{company}}, {{position}}.`
                : `${aiPrompt}. IMPORTANT: DO NOT use variables. Use placeholder text like [RECIPIENT NAME], [COMPANY NAME].`;
            
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
                toast.success('Template generated! Review and save.');
            }
        } catch (error) {
            toast.error('Failed to generate template');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return <TemplatesSkeleton />;

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-6xl mx-auto">
                    <TemplatesHeader 
                        onNewTemplate={handleCreateNew} 
                        onAIGenerate={() => setShowAIDialog(true)} 
                    />

                    <TemplatesFilters 
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        category={category}
                        setCategory={setCategory}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        featuredCategory={featuredCategory}
                        setFeaturedCategory={setFeaturedCategory}
                        featuredCategories={getFeaturedCategories()}
                    />

                    {/* Featured Templates Section */}
                    {activeSection === 'featured' && (
                        <>
                            {getFilteredFeaturedTemplates(category, featuredCategory, searchQuery).length === 0 ? (
                                <div className="text-center py-16">
                                    <i className="ri-file-list-3-line text-5xl text-muted-foreground mb-4"></i>
                                    <p className="text-muted-foreground">No featured templates found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {getFilteredFeaturedTemplates(category, featuredCategory, searchQuery).map((template) => (
                                        <TemplateCard 
                                            key={template.id}
                                            template={template}
                                            isFeatured={true}
                                            onCopy={handleCopy}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* My Templates Section */}
                    {activeSection === 'my-templates' && (
                        <>
                            {filteredTemplates.length === 0 ? (
                                <EmptyTemplates onCreateNew={handleCreateNew} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTemplates.map((template) => (
                                        <TemplateCard 
                                            key={template.id}
                                            template={template}
                                            onCopy={handleCopy}
                                            onEdit={handleEdit}
                                            onDelete={(t) => setDeleteDialog({ open: true, template: t })}
                                            onToggleFavorite={handleToggleFavorite}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <CreateTemplateDialog 
                open={showDialog}
                onOpenChange={setShowDialog}
                editingTemplate={editingTemplate}
                formData={formData}
                setFormData={setFormData}
                isSaving={isSaving}
                onSave={handleSave}
            />

            <AIGenerateDialog 
                open={showAIDialog}
                onOpenChange={setShowAIDialog}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                aiTone={aiTone}
                setAiTone={setAiTone}
                aiCategory={aiCategory}
                setAiCategory={setAiCategory}
                isGenerating={isGenerating}
                onGenerate={handleGenerateAI}
            />

            <DeleteTemplateDialog 
                open={deleteDialog.open}
                onOpenChange={(open) => !open && setDeleteDialog({ open: false, template: null })}
                template={deleteDialog.template}
                isDeleting={isDeleting}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default Templates;
