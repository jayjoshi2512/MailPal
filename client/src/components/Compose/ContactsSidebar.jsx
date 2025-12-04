import React, { useState, useEffect } from 'react';
import { Input } from '@/components/components/ui/input';
import { Button } from '@/components/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';
import { toast } from 'sonner';
import { generalContactsAPI } from '@/services/api';
import ContactsSidebarSkeleton from './ContactsSidebarSkeleton';

/**
 * ContactsSidebar - Personal contacts for Compose page
 * Features: Search, Multi-select, Bulk favorite/delete, Add new contact, CSV upload
 * 
 * Note: This shows only personal contacts from the `contacts` table.
 * Campaign contacts are stored separately in `campaign_contacts` table.
 */
const ContactsSidebar = ({ onContactSelect, onContactRemove }) => {
    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState(new Set());
    
    // Multi-select mode for bulk actions
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [bulkSelected, setBulkSelected] = useState(new Set());
    
    // Add contact form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactEmail, setNewContactEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);
    
    // Delete confirmation modal
    const [deleteDialog, setDeleteDialog] = useState({ open: false, contact: null, isBulk: false });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkAction, setIsBulkAction] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async (search = '') => {
        try {
            setLoading(true);
            // Fetch only personal contacts (not campaign contacts)
            const response = await generalContactsAPI.getAll(search);
            if (response.success) {
                setContacts(response.data.contacts || []);
            }
        } catch (error) {
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchContacts(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter contacts by search query
    const filteredContacts = contacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        return contact.email.toLowerCase().includes(query) || 
               contact.name?.toLowerCase().includes(query) ||
               contact.company?.toLowerCase().includes(query);
    });

    const getInitials = (contact) => {
        if (contact.name) {
            const names = contact.name.trim().split(' ');
            return names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : names[0][0].toUpperCase();
        }
        return contact.email[0].toUpperCase();
    };

    const getAvatarColor = (email) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
        return colors[email.charCodeAt(0) % colors.length];
    };

    const handleSelectAll = () => {
        if (multiSelectMode) {
            // In multi-select mode, select all for bulk actions
            if (bulkSelected.size === filteredContacts.length && filteredContacts.length > 0) {
                setBulkSelected(new Set());
            } else {
                setBulkSelected(new Set(filteredContacts.map(c => c.id)));
            }
        } else {
            // Normal mode - select for email recipients
            if (selectedContacts.size === filteredContacts.length && filteredContacts.length > 0) {
                filteredContacts.forEach(c => onContactRemove?.(c.email));
                setSelectedContacts(new Set());
            } else {
                filteredContacts.forEach(c => onContactSelect?.(c));
                setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
            }
        }
    };

    const toggleBulkSelect = (contactId) => {
        const newSelected = new Set(bulkSelected);
        if (newSelected.has(contactId)) {
            newSelected.delete(contactId);
        } else {
            newSelected.add(contactId);
        }
        setBulkSelected(newSelected);
    };

    const handleBulkFavorite = async () => {
        if (bulkSelected.size === 0) return;
        
        setIsBulkAction(true);
        try {
            const ids = Array.from(bulkSelected);
            const response = await generalContactsAPI.bulkFavorite(ids);
            if (response.success) {
                toast.success(`${ids.length} contacts updated`);
                fetchContacts();
                setBulkSelected(new Set());
                setMultiSelectMode(false);
            }
        } catch (error) {
            toast.error('Failed to update favorites');
        } finally {
            setIsBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
        if (bulkSelected.size === 0) return;
        setDeleteDialog({ open: true, contact: null, isBulk: true });
    };

    const confirmBulkDelete = async () => {
        setIsDeleting(true);
        try {
            const ids = Array.from(bulkSelected);
            const response = await generalContactsAPI.bulkDelete(ids);
            if (response.success) {
                toast.success(`${ids.length} contacts deleted`);
                // Remove from selected recipients too
                ids.forEach(id => {
                    const contact = contacts.find(c => c.id === id);
                    if (contact) {
                        const newSelected = new Set(selectedContacts);
                        newSelected.delete(id);
                        setSelectedContacts(newSelected);
                        onContactRemove?.(contact.email);
                    }
                });
                fetchContacts();
                setBulkSelected(new Set());
                setMultiSelectMode(false);
            }
        } catch (error) {
            toast.error('Failed to delete contacts');
        } finally {
            setIsDeleting(false);
            setDeleteDialog({ open: false, contact: null, isBulk: false });
        }
    };

    const toggleContactSelection = (contact) => {
        if (multiSelectMode) {
            toggleBulkSelect(contact.id);
        } else {
            const newSelected = new Set(selectedContacts);
            if (newSelected.has(contact.id)) {
                newSelected.delete(contact.id);
                onContactRemove?.(contact.email);
            } else {
                newSelected.add(contact.id);
                onContactSelect?.(contact);
            }
            setSelectedContacts(newSelected);
        }
    };

    const handleAddContact = async () => {
        if (!newContactEmail.trim()) {
            toast.error('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newContactEmail.trim())) {
            toast.error('Please enter a valid email');
            return;
        }

        if (contacts.some(c => c.email.toLowerCase() === newContactEmail.trim().toLowerCase())) {
            toast.error('Contact already exists');
            return;
        }

        setIsAdding(true);
        try {
            const response = await generalContactsAPI.create({
                email: newContactEmail.trim(),
                name: newContactName.trim() || null
            });

            if (response.success) {
                toast.success('Contact added');
                setNewContactName('');
                setNewContactEmail('');
                setShowAddForm(false);
                fetchContacts();
            } else {
                toast.error(response.error || 'Failed to add contact');
            }
        } catch (error) {
            toast.error('Failed to add contact');
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleFavorite = async (e, contact) => {
        e.stopPropagation();
        try {
            const response = await generalContactsAPI.toggleFavorite(contact.id);
            if (response.success) {
                // Update local state
                setContacts(prev => prev.map(c => 
                    c.id === contact.id ? { ...c, is_favorite: !c.is_favorite } : c
                ).sort((a, b) => {
                    // Sort favorites first
                    if (a.is_favorite && !b.is_favorite) return -1;
                    if (!a.is_favorite && b.is_favorite) return 1;
                    return new Date(b.created_at) - new Date(a.created_at);
                }));
                toast.success(contact.is_favorite ? 'Removed from favorites' : 'Added to favorites');
            }
        } catch (error) {
            toast.error('Failed to update favorite');
        }
    };

    const openDeleteDialog = (e, contact) => {
        e.stopPropagation();
        setDeleteDialog({ open: true, contact });
    };

    const handleDeleteContact = async () => {
        if (deleteDialog.isBulk) {
            await confirmBulkDelete();
            return;
        }
        
        if (!deleteDialog.contact) return;
        
        setIsDeleting(true);
        try {
            const response = await generalContactsAPI.delete(deleteDialog.contact.id);
            if (response.success) {
                toast.success('Contact deleted');
                const newSelected = new Set(selectedContacts);
                newSelected.delete(deleteDialog.contact.id);
                setSelectedContacts(newSelected);
                onContactRemove?.(deleteDialog.contact.email);
                fetchContacts();
            } else {
                toast.error(response.error || 'Failed to delete contact');
            }
        } catch (error) {
            toast.error('Failed to delete contact');
        } finally {
            setIsDeleting(false);
            setDeleteDialog({ open: false, contact: null, isBulk: false });
        }
    };

    const handleCSVUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        setIsUploading(true);
        try {
            const text = await file.text();
            
            // Basic CSV validation - check if it has email column
            const firstLine = text.split('\n')[0]?.toLowerCase() || '';
            if (!firstLine.includes('email') && !firstLine.includes('mail')) {
                toast.error('CSV must have an "email" column');
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            
            const response = await generalContactsAPI.uploadCSV(text);
            
            if (response.success) {
                const { added, skipped } = response.data;
                if (added === 0 && skipped > 0) {
                    toast.info(`All ${skipped} contacts already exist or were invalid`);
                } else {
                    toast.success(`Added ${added} contacts${skipped > 0 ? `, ${skipped} skipped` : ''}`);
                }
                fetchContacts();
            } else {
                toast.error(response.error || 'Failed to upload contacts');
            }
        } catch (error) {
            console.error('CSV Upload error:', error);
            toast.error(error.message || 'Failed to upload CSV');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (loading) return <ContactsSidebarSkeleton />;

    return (
        <>
            <div className="w-72 border-l border-border bg-background flex flex-col fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-hidden">
                {/* Header */}
                <div className="p-3 border-b border-border flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <i className="ri-contacts-line"></i>Contacts
                        </h3>
                        <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                                {contacts.length}
                            </span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="hidden"
                            />
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                title="Upload CSV"
                            >
                                <i className={`ri-${isUploading ? 'loader-4-line animate-spin' : 'upload-2-line'} text-sm`}></i>
                            </Button>
                            <Button 
                                size="sm" 
                                variant={multiSelectMode ? 'default' : 'ghost'}
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                    setMultiSelectMode(!multiSelectMode);
                                    setBulkSelected(new Set());
                                }}
                                title={multiSelectMode ? 'Exit multi-select' : 'Multi-select mode'}
                            >
                                <i className={`ri-${multiSelectMode ? 'close-line' : 'checkbox-multiple-line'} text-sm`}></i>
                            </Button>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                <i className={`ri-${showAddForm ? 'close-line' : 'add-line'} text-sm`}></i>
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {multiSelectMode && (
                        <div className="flex items-center gap-1 mb-2 p-1.5 bg-muted/50 rounded-lg">
                            <span className="text-[10px] text-muted-foreground flex-1">
                                {bulkSelected.size} selected
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px]"
                                onClick={handleBulkFavorite}
                                disabled={bulkSelected.size === 0 || isBulkAction}
                            >
                                <i className="ri-star-line mr-1"></i>Favorite
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px] text-red-600 hover:text-red-700"
                                onClick={handleBulkDelete}
                                disabled={bulkSelected.size === 0 || isBulkAction}
                            >
                                <i className="ri-delete-bin-line mr-1"></i>Delete
                            </Button>
                        </div>
                    )}

                    {/* Add Contact Form */}
                    {showAddForm && (
                        <div className="mb-2 p-2 bg-muted/50 rounded-lg space-y-2">
                            <Input
                                type="text"
                                placeholder="Name (optional)"
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                                className="h-7 text-xs"
                            />
                            <Input
                                type="email"
                                placeholder="Email *"
                                value={newContactEmail}
                                onChange={(e) => setNewContactEmail(e.target.value)}
                                className="h-7 text-xs"
                            />
                            <Button 
                                size="sm" 
                                className="w-full h-7 text-xs"
                                onClick={handleAddContact}
                                disabled={isAdding || !newContactEmail.trim()}
                            >
                                {isAdding ? (
                                    <><i className="ri-loader-4-line animate-spin mr-1"></i>Adding...</>
                                ) : (
                                    <><i className="ri-add-line mr-1"></i>Add Contact</>
                                )}
                            </Button>
                        </div>
                    )}
                    
                    <div className="relative mb-2">
                        <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-xs"
                        />
                    </div>

                    <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={handleSelectAll} disabled={filteredContacts.length === 0}>
                        <i className={`ri-${(multiSelectMode ? bulkSelected.size : selectedContacts.size) === filteredContacts.length && filteredContacts.length > 0 ? 'checkbox-line' : 'checkbox-blank-line'} mr-1`}></i>
                        {multiSelectMode ? 'Select All for Bulk' : 'Select All'}
                    </Button>
                </div>

                {/* Contacts Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                    {filteredContacts.length === 0 ? (
                        <div className="text-center py-8">
                            <i className="ri-contacts-line text-3xl text-muted-foreground mb-2"></i>
                            <p className="text-xs text-muted-foreground">{searchQuery ? 'No contacts found' : 'No contacts'}</p>
                            {!showAddForm && (
                                <Button 
                                    size="sm" 
                                    variant="link" 
                                    className="text-xs mt-2"
                                    onClick={() => setShowAddForm(true)}
                                >
                                    <i className="ri-add-line mr-1"></i>Add your first contact
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-1.5">
                            {filteredContacts.map((contact) => {
                                const isSelected = selectedContacts.has(contact.id);
                                const isBulkSelected = bulkSelected.has(contact.id);
                                const isFavorite = contact.is_favorite;
                                return (
                                    <div
                                        key={contact.id}
                                        className={`group relative flex flex-col items-center p-1.5 rounded-lg cursor-pointer transition-all ${
                                            multiSelectMode 
                                                ? (isBulkSelected ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-500' : 'hover:bg-accent')
                                                : (isSelected ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'hover:bg-accent')
                                        }`}
                                        title={contact.email}
                                    >
                                        
                                        {/* Multi-select checkbox - top left in multi-select mode */}
                                        {multiSelectMode ? (
                                            <div 
                                                className={`absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center z-20 transition-all ${
                                                    isBulkSelected ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <i className={`ri-${isBulkSelected ? 'check-line' : 'checkbox-blank-line'} text-white text-[9px]`}></i>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Favorite button - top left */}
                                                <button
                                                    onClick={(e) => handleToggleFavorite(e, contact)}
                                                    className={`absolute -top-1 -left-1 w-4 h-4 rounded-full items-center justify-center z-20 transition-all ${isFavorite ? 'flex bg-yellow-400' : 'hidden group-hover:flex bg-gray-400 hover:bg-yellow-400'}`}
                                                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                                >
                                                    <i className={`ri-star-${isFavorite ? 'fill' : 'line'} text-white text-[9px]`}></i>
                                                </button>
                                                
                                                {/* Selection indicator when no favorite badge */}
                                                {isSelected && !isFavorite && (
                                                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center z-10">
                                                        <i className="ri-check-line text-white text-[10px]"></i>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        {/* Delete button - top right (only in normal mode) */}
                                        {!multiSelectMode && (
                                            <button
                                                onClick={(e) => openDeleteDialog(e, contact)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full items-center justify-center z-20 hidden group-hover:flex transition-all"
                                                title="Delete contact"
                                            >
                                                <i className="ri-delete-bin-line text-white text-[9px]"></i>
                                            </button>
                                        )}
                                        
                                        <div 
                                            onClick={() => toggleContactSelection(contact)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarColor(contact.email)} ${isFavorite ? 'ring-2 ring-yellow-400' : ''}`}
                                        >
                                            {getInitials(contact)}
                                        </div>
                                        <p 
                                            onClick={() => toggleContactSelection(contact)}
                                            className="text-[9px] font-medium truncate w-full text-center mt-1"
                                        >
                                            {contact.name || contact.email.split('@')[0]}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, contact: null, isBulk: false })}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <i className="ri-delete-bin-line"></i>
                            {deleteDialog.isBulk ? 'Delete Selected Contacts' : 'Delete Contact'}
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            {deleteDialog.isBulk ? (
                                <>Are you sure you want to delete <strong>{bulkSelected.size} contacts</strong>?</>
                            ) : (
                                <>Are you sure you want to delete <strong>{deleteDialog.contact?.name || deleteDialog.contact?.email}</strong>?</>
                            )}
                            <br />
                            <span className="text-xs text-muted-foreground mt-1 block">
                                {deleteDialog.isBulk 
                                    ? 'These contacts will be removed from your list.'
                                    : 'This contact will be removed from your list.'
                                }
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, contact: null, isBulk: false })}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteContact}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <><i className="ri-loader-4-line animate-spin mr-2"></i>Deleting...</>
                            ) : (
                                <><i className="ri-delete-bin-line mr-2"></i>Delete{deleteDialog.isBulk ? ` (${bulkSelected.size})` : ''}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ContactsSidebar;
