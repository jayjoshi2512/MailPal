import React, { useState, useEffect, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/components/ui/tabs';
import { toast } from 'sonner';
import { generalContactsAPI, campaignsAPI, contactsAPI } from '@/services/api';
import ContactsSidebarSkeleton from './ContactsSidebarSkeleton';

/**
 * ContactsSidebar - Unified contact management
 * Tabs: Personal (User's list) | Campaigns (Campaign recipients)
 */
const ContactsSidebar = ({ onContactSelect, onContactRemove }) => {
    const [activeTab, setActiveTab] = useState('personal');
    
    // ==========================================
    // PERSONAL CONTACTS STATE
    // ==========================================
    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState(new Set());
    
    // Multi-select mode
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [bulkSelected, setBulkSelected] = useState(new Set());
    
    // Add contact form
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCSVHelp, setShowCSVHelp] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactEmail, setNewContactEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    // Delete modal
    const [deleteDialog, setDeleteDialog] = useState({ open: false, contact: null, isBulk: false });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkAction, setIsBulkAction] = useState(false);

    // ==========================================
    // CAMPAIGN CONTACTS STATE
    // ==========================================
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaignContacts, setCampaignContacts] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [loadingCampaignContacts, setLoadingCampaignContacts] = useState(false);
    const [campaignSearch, setCampaignSearch] = useState('');

    // ==========================================
    // EFFECTS
    // ==========================================

    useEffect(() => {
        if (activeTab === 'personal') {
            fetchContacts();
        } else {
            fetchCampaigns();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'personal') {
            const timer = setTimeout(() => fetchContacts(searchQuery), 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, activeTab]);

    // ==========================================
    // PERSONAL CONTACTS LOGIC
    // ==========================================

    const fetchContacts = async (search = '') => {
        try {
            setLoading(true);
            const response = await generalContactsAPI.getAll(search);
            if (response.success) {
                setContacts(response.data.contacts || []);
            } else {
                toast.error(response.error || 'Failed to load contacts');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        return contact.email.toLowerCase().includes(query) || 
               contact.name?.toLowerCase().includes(query) ||
               contact.company?.toLowerCase().includes(query);
    });

    const getInitials = (name, email) => {
        if (name) {
            const names = name.trim().split(' ');
            return names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : names[0][0].toUpperCase();
        }
        return email ? email[0].toUpperCase() : '?';
    };

    const getAvatarColor = (email) => {
        if (!email) return 'bg-gray-500';
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
        return colors[email.charCodeAt(0) % colors.length];
    };

    const handleSelectAll = () => {
        if (multiSelectMode) {
            if (bulkSelected.size === filteredContacts.length && filteredContacts.length > 0) {
                setBulkSelected(new Set());
            } else {
                setBulkSelected(new Set(filteredContacts.map(c => c._id || c.id)));
            }
        } else {
            if (selectedContacts.size === filteredContacts.length && filteredContacts.length > 0) {
                const removeCount = filteredContacts.length;
                filteredContacts.forEach(c => onContactRemove?.(c.email, true));
                setSelectedContacts(new Set());
                if (removeCount > 0) {
                    toast.info(`Removed ${removeCount} contact${removeCount > 1 ? 's' : ''} from recipients`);
                }
            } else {
                const addCount = filteredContacts.length;
                filteredContacts.forEach(c => onContactSelect?.(c, true));
                setSelectedContacts(new Set(filteredContacts.map(c => c._id || c.id)));
                if (addCount > 0) {
                    toast.success(`Added ${addCount} contact${addCount > 1 ? 's' : ''} to recipients`);
                }
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
                ids.forEach(id => {
                    const contact = contacts.find(c => (c._id || c.id) === id);
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
        const contactId = contact._id || contact.id;
        if (multiSelectMode) {
            toggleBulkSelect(contactId);
        } else {
            const newSelected = new Set(selectedContacts);
            if (newSelected.has(contactId)) {
                newSelected.delete(contactId);
                onContactRemove?.(contact.email, false);
            } else {
                newSelected.add(contactId);
                onContactSelect?.(contact, false);
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
        const contactId = contact._id || contact.id;
        const currentFavorite = contact.is_favorite ?? contact.isFavorite;
        try {
            const response = await generalContactsAPI.toggleFavorite(contactId);
            if (response.success) {
                setContacts(prev => prev.map(c => {
                    if ((c._id || c.id) === contactId) {
                        const newFav = !(c.is_favorite ?? c.isFavorite);
                        return { ...c, is_favorite: newFav, isFavorite: newFav };
                    }
                    return c;
                }).sort((a, b) => {
                    const aFav = a.is_favorite ?? a.isFavorite;
                    const bFav = b.is_favorite ?? b.isFavorite;
                    if (aFav && !bFav) return -1;
                    if (!aFav && bFav) return 1;
                    return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
                }));
                toast.success(currentFavorite ? 'Removed from favorites' : 'Added to favorites');
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
        const contactId = deleteDialog.contact._id || deleteDialog.contact.id;
        setIsDeleting(true);
        try {
            const response = await generalContactsAPI.delete(contactId);
            if (response.success) {
                toast.success('Contact deleted');
                const newSelected = new Set(selectedContacts);
                newSelected.delete(contactId);
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
            const firstLine = text.split('\n')[0]?.toLowerCase() || '';
            if (!firstLine.includes('email') && !firstLine.includes('mail')) {
                toast.error('CSV must have an "email" column. Check the format guide.');
                setShowCSVHelp(true);
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            const response = await generalContactsAPI.uploadCSV(text);
            if (response.success) {
                const { added, reactivated, skipped, total } = response.data;
                
                const successCount = (added || 0) + (reactivated || 0);
                
                if (successCount > 0) {
                    let message = '';
                    if (added > 0 && reactivated > 0) {
                        message = `Added ${added} new contact${added > 1 ? 's' : ''}, reactivated ${reactivated}`;
                    } else if (added > 0) {
                        message = `Added ${added} contact${added > 1 ? 's' : ''}`;
                    } else if (reactivated > 0) {
                        message = `Reactivated ${reactivated} contact${reactivated > 1 ? 's' : ''}`;
                    }
                    toast.success(message);
                    fetchContacts();
                }
                
                if (skipped > 0 && successCount > 0) {
                    toast.info(`Skipped ${skipped} duplicate contact${skipped > 1 ? 's' : ''}`);
                } else if (skipped > 0 && successCount === 0) {
                    toast.warning(`All ${total} contacts already exist`);
                }
            } else {
                toast.error(response.error || 'Failed to upload contacts');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to upload CSV');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ==========================================
    // CAMPAIGN CONTACTS LOGIC
    // ==========================================

    const fetchCampaigns = async () => {
        try {
            setLoadingCampaigns(true);
            const response = await campaignsAPI.getAll();
            if (response.success) {
                setCampaigns(response.data.campaigns || []);
            }
        } catch (error) {
            toast.error('Failed to load campaigns');
        } finally {
            setLoadingCampaigns(false);
        }
    };

    const handleCampaignClick = async (campaign) => {
        setSelectedCampaign(campaign);
        try {
            setLoadingCampaignContacts(true);
            const response = await contactsAPI.getAll(campaign.id);
            if (response.success) {
                setCampaignContacts(response.data.contacts || []);
            }
        } catch (error) {
            toast.error('Failed to load campaign contacts');
        } finally {
            setLoadingCampaignContacts(false);
        }
    };

    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setCampaignContacts([]);
        setCampaignSearch('');
    };

    const filteredCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(campaignSearch.toLowerCase())
    );

    const filteredCampaignContacts = campaignContacts.filter(c => 
        c.email.toLowerCase().includes(campaignSearch.toLowerCase())
    );

    const toggleCampaignContactSelection = (contact) => {
        if (campaignContactsAdded.has(contact.email)) {
            // Remove
            onContactRemove?.(contact.email, false);
            setCampaignContactsAdded(prev => {
                const newSet = new Set(prev);
                newSet.delete(contact.email);
                return newSet;
            });
            toast.info(`Removed ${contact.name || contact.email} from recipients`);
        } else {
            // Add
            onContactSelect?.(contact, false);
            setCampaignContactsAdded(prev => new Set(prev).add(contact.email));
            toast.success(`Added ${contact.name || contact.email} to recipients`);
        }
    };

    const [campaignContactsAdded, setCampaignContactsAdded] = useState(new Set());

    const handleSelectAllCampaignContacts = () => {
        const allAdded = filteredCampaignContacts.every(c => campaignContactsAdded.has(c.email));
        
        if (allAdded) {
            // Remove all
            const removeCount = filteredCampaignContacts.length;
            filteredCampaignContacts.forEach(c => {
                onContactRemove?.(c.email, true);
                setCampaignContactsAdded(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(c.email);
                    return newSet;
                });
            });
            if (removeCount > 0) {
                toast.info(`Removed ${removeCount} contact${removeCount > 1 ? 's' : ''} from recipients`);
            }
        } else {
            // Add all not yet added
            let addCount = 0;
            filteredCampaignContacts.forEach(c => {
                if (!campaignContactsAdded.has(c.email)) {
                    onContactSelect?.(c, true);
                    setCampaignContactsAdded(prev => new Set(prev).add(c.email));
                    addCount++;
                }
            });
            if (addCount > 0) {
                toast.success(`Added ${addCount} contact${addCount > 1 ? 's' : ''} to recipients`);
            }
        }
    };

    // ==========================================
    // RENDER
    // ==========================================

    if (loading && activeTab === 'personal') return <ContactsSidebarSkeleton />;

    return (
        <div className="w-72 border-l border-border bg-background flex flex-col fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-hidden shadow-lg z-30">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <div className="px-3 pt-3 border-b border-border bg-muted/10">
                    <TabsList className="w-full grid grid-cols-2 mb-2 bg-transparent p-0 gap-2">
                        <TabsTrigger 
                            value="personal" 
                            className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border rounded-md transition-all"
                        >
                            Personal
                        </TabsTrigger>
                        <TabsTrigger 
                            value="campaigns" 
                            className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border rounded-md transition-all"
                        >
                            Campaigns
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* PERSONAL CONTACTS TAB */}
                <TabsContent value="personal" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=active]:flex">
                    {/* Header & Actions */}
                    <div className="p-3 border-b border-border flex-shrink-0 bg-background">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
                                <i className="ri-contacts-book-line"></i>My Contacts
                            </h3>
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-semibold rounded-full">
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
                                    size="sm" variant="ghost" className="h-6 w-6 p-0"
                                    onClick={() => setShowCSVHelp(true)}
                                    title="CSV Format Help"
                                >
                                    <i className="ri-information-line text-sm"></i>
                                </Button>
                                <Button 
                                    size="sm" variant="ghost" className="h-6 w-6 p-0"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    title="Upload CSV"
                                >
                                    <i className={`ri-${isUploading ? 'loader-4-line animate-spin' : 'upload-2-line'} text-sm`}></i>
                                </Button>
                                <Button 
                                    size="sm" variant={multiSelectMode ? 'default' : 'ghost'} className="h-6 w-6 p-0"
                                    onClick={() => { setMultiSelectMode(!multiSelectMode); setBulkSelected(new Set()); }}
                                    title="Multi-select"
                                >
                                    <i className={`ri-${multiSelectMode ? 'close-line' : 'checkbox-multiple-line'} text-sm`}></i>
                                </Button>
                                <Button 
                                    size="sm" variant="ghost" className="h-6 w-6 p-0"
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    title="Add Contact"
                                >
                                    <i className={`ri-${showAddForm ? 'close-line' : 'add-line'} text-sm`}></i>
                                </Button>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {multiSelectMode && (
                            <div className="flex items-center gap-1 mb-2 p-1.5 bg-muted/50 rounded-lg">
                                <span className="text-[10px] text-muted-foreground flex-1">{bulkSelected.size} selected</span>
                                <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={handleBulkFavorite} disabled={bulkSelected.size === 0 || isBulkAction}>
                                    <i className="ri-star-line mr-1"></i>Fav
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-red-600" onClick={handleBulkDelete} disabled={bulkSelected.size === 0 || isBulkAction}>
                                    <i className="ri-delete-bin-line mr-1"></i>Del
                                </Button>
                            </div>
                        )}

                        {/* Add Form */}
                        {showAddForm && (
                            <div className="mb-2 p-2 bg-muted/50 rounded-lg space-y-2">
                                <Input placeholder="Name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} className="h-7 text-xs" />
                                <Input placeholder="Email *" value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} className="h-7 text-xs" />
                                <Button size="sm" className="w-full h-7 text-xs" onClick={handleAddContact} disabled={isAdding || !newContactEmail.trim()}>
                                    {isAdding ? 'Adding...' : 'Add Contact'}
                                </Button>
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative mb-2">
                            <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"></i>
                            <Input placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-7 h-8 text-xs" />
                        </div>

                        <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={handleSelectAll} disabled={filteredContacts.length === 0}>
                            <i className={`ri-${(multiSelectMode ? bulkSelected.size : selectedContacts.size) === filteredContacts.length && filteredContacts.length > 0 ? 'checkbox-line' : 'checkbox-blank-line'} mr-1`}></i>
                            {multiSelectMode ? 'Select All' : 'Select All'}
                        </Button>
                    </div>

                    {/* Contacts List */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                        {filteredContacts.length === 0 ? (
                            <div className="text-center py-8 px-4 text-muted-foreground">
                                <i className="ri-contacts-book-line text-4xl mb-2 opacity-30"></i>
                                <p className="text-xs font-medium mb-1">No contacts yet</p>
                                <p className="text-[10px] opacity-70">Add contacts manually or upload a CSV file</p>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="mt-3 h-7 text-xs"
                                    onClick={() => setShowCSVHelp(true)}
                                >
                                    <i className="ri-file-list-line mr-1"></i>
                                    CSV Format Guide
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-1.5">
                                {filteredContacts.map((contact) => {
                                    const contactId = contact._id || contact.id;
                                    const isSelected = selectedContacts.has(contactId);
                                    const isBulkSelected = bulkSelected.has(contactId);
                                    const isFavorite = contact.is_favorite ?? contact.isFavorite;
                                    return (
                                        <div
                                            key={contactId}
                                            className={`group relative flex flex-col items-center p-1.5 rounded-lg cursor-pointer transition-all ${
                                                multiSelectMode 
                                                    ? (isBulkSelected ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-500' : 'hover:bg-accent')
                                                    : (isSelected ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'hover:bg-accent')
                                            }`}
                                            title={contact.email}
                                        >
                                            {multiSelectMode ? (
                                                <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center z-20 ${isBulkSelected ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                                    <i className={`ri-${isBulkSelected ? 'check-line' : 'checkbox-blank-line'} text-white text-[9px]`}></i>
                                                </div>
                                            ) : (
                                                <>
                                                    <button onClick={(e) => handleToggleFavorite(e, contact)} className={`absolute -top-1 -left-1 w-4 h-4 rounded-full items-center justify-center z-20 ${isFavorite ? 'flex bg-yellow-400' : 'hidden group-hover:flex bg-gray-400'}`}>
                                                        <i className={`ri-star-${isFavorite ? 'fill' : 'line'} text-white text-[9px]`}></i>
                                                    </button>
                                                    {isSelected && !isFavorite && (
                                                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center z-10">
                                                            <i className="ri-check-line text-white text-[10px]"></i>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {!multiSelectMode && (
                                                <button onClick={(e) => openDeleteDialog(e, contact)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center z-20 hidden group-hover:flex">
                                                    <i className="ri-delete-bin-line text-white text-[9px]"></i>
                                                </button>
                                            )}
                                            <div onClick={() => toggleContactSelection(contact)} className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarColor(contact.email)}`}>
                                                {getInitials(contact.name, contact.email)}
                                            </div>
                                            <p onClick={() => toggleContactSelection(contact)} className="text-[9px] font-medium truncate w-full text-center mt-1">
                                                {contact.name || contact.email.split('@')[0]}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* CAMPAIGNS TAB */}
                <TabsContent value="campaigns" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=active]:flex">
                    <div className="p-3 border-b border-border bg-background">
                        <div className="flex items-center gap-2 mb-2">
                            {selectedCampaign && (
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 -ml-1" onClick={handleBackToCampaigns}>
                                    <i className="ri-arrow-left-line"></i>
                                </Button>
                            )}
                            <h3 className="text-xs font-semibold flex items-center gap-2 text-muted-foreground truncate">
                                <i className="ri-megaphone-line"></i>
                                {selectedCampaign ? selectedCampaign.name : 'Campaigns'}
                            </h3>
                        </div>
                        <div className="relative">
                            <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"></i>
                            <Input 
                                placeholder={selectedCampaign ? "Search recipients..." : "Search campaigns..."} 
                                value={campaignSearch} 
                                onChange={(e) => setCampaignSearch(e.target.value)} 
                                className="pl-7 h-8 text-xs" 
                            />
                        </div>
                        {selectedCampaign && (
                            <Button size="sm" variant="outline" className="w-full h-7 text-xs mt-2" onClick={handleSelectAllCampaignContacts}>
                                {filteredCampaignContacts.every(c => campaignContactsAdded.has(c.email)) ? (
                                    <><i className="ri-subtract-line mr-1"></i>Remove All ({filteredCampaignContacts.length})</>
                                ) : (
                                    <><i className="ri-add-line mr-1"></i>Add All ({filteredCampaignContacts.length})</>
                                )}
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                        {loadingCampaigns || loadingCampaignContacts ? (
                            <div className="flex justify-center py-8"><i className="ri-loader-4-line animate-spin text-2xl text-blue-500"></i></div>
                        ) : selectedCampaign ? (
                            // Campaign Contacts List
                            filteredCampaignContacts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground"><p className="text-xs">No contacts found</p></div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredCampaignContacts.map((contact, i) => {
                                        const isAdded = campaignContactsAdded.has(contact.email);
                                        return (
                                            <div key={i} className={`flex items-center gap-2 p-2 rounded cursor-pointer group transition-colors ${isAdded ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' : 'hover:bg-accent'}`} onClick={() => toggleCampaignContactSelection(contact)}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(contact.email)}`}>
                                                    {getInitials(contact.name, contact.email)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium truncate">{contact.email}</p>
                                                    {contact.name && <p className="text-[10px] text-muted-foreground truncate">{contact.name}</p>}
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                                    <i className={`ri-${isAdded ? 'check-line text-green-600' : 'add-line'}`}></i>
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            // Campaigns List
                            filteredCampaigns.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground"><p className="text-xs">No campaigns found</p></div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredCampaigns.map(campaign => (
                                        <div 
                                            key={campaign.id} 
                                            onClick={() => handleCampaignClick(campaign)}
                                            className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-xs font-semibold truncate flex-1">{campaign.name}</h4>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                                    campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    campaign.status === 'running' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {campaign.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1"><i className="ri-calendar-line"></i> {new Date(campaign.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* CSV Format Help Dialog */}
            <Dialog open={showCSVHelp} onOpenChange={setShowCSVHelp}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <i className="ri-file-list-3-line"></i>
                            CSV Upload Format
                        </DialogTitle>
                        <DialogDescription>
                            Required format for uploading contacts
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                        {/* Required Field */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Required Field</h4>
                            <div className="flex flex-wrap items-center gap-2">
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">email</code>
                                <span className="text-xs text-muted-foreground">or</span>
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">e-mail</code>
                                <span className="text-xs text-muted-foreground">or</span>
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">mail</code>
                            </div>
                            <p className="text-xs text-muted-foreground">At least one email column is required</p>
                        </div>

                        {/* Optional Fields */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Optional Fields</h4>
                            <div className="flex flex-wrap gap-2">
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">name</code>
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">first_name</code>
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">last_name</code>
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">company</code>
                            </div>
                        </div>

                        {/* Example */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Example Format</h4>
                            <div className="bg-muted p-3 rounded-lg">
                                <pre className="text-xs font-mono overflow-x-auto">{`email,name,company
john@example.com,John Doe,Acme Inc
jane@test.com,Jane Smith,Tech Corp`}</pre>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="space-y-2 pt-2 border-t">
                            <h4 className="text-sm font-semibold">Important</h4>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>• First row must contain column headers</li>
                                <li>• Duplicate emails will be skipped</li>
                                <li>• Invalid email formats will be skipped</li>
                            </ul>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button onClick={() => setShowCSVHelp(false)}>
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, contact: null, isBulk: false })}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><i className="ri-delete-bin-line"></i>Delete Contact</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this contact?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, contact: null, isBulk: false })}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteContact}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ContactsSidebar;