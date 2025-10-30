import React, { useState, useEffect } from 'react';
import { Input } from '@/components/components/ui/input';
import { Button } from '@/components/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { toast } from 'sonner';
import { generalContactsAPI } from '@/services/api';
import ContactsSidebarSkeleton from './ContactsSidebarSkeleton';

/**
 * Professional ContactsSidebar Component
 * Production-grade contacts management with grid layout and smart filtering
 */
const ContactsSidebar = ({ onContactSelect, onContactRemove }) => {
    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc', 'name-desc', 'email-asc', 'recent'
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [newContact, setNewContact] = useState({ email: '', name: '' });
    const [uploading, setUploading] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState(new Set());

    // Fetch contacts on mount
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async (search = '') => {
        try {
            setLoading(true);
            const response = await generalContactsAPI.getAll(search);
            if (response.success) {
                setContacts(response.data.contacts || []);
            } else {
                throw new Error('Failed to load contacts');
            }
        } catch (error) {
            console.error('❌ Error fetching contacts:', error);
            toast.error('Failed to load contacts. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchContacts(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle add manual contact
    const handleAddContact = async () => {
        if (!newContact.email || !newContact.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            const response = await generalContactsAPI.create(newContact);
            if (response.success) {
                toast.success(`Contact ${newContact.name || newContact.email} added successfully`);
                setShowAddModal(false);
                setNewContact({ email: '', name: '' });
                fetchContacts(searchQuery);
            } else {
                throw new Error(response.error || 'Failed to add contact');
            }
        } catch (error) {
            console.error('❌ Error adding contact:', error);
            toast.error(error.response?.data?.error || 'Failed to add contact');
        }
    };

    // Handle CSV upload
    const handleCSVUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const csvData = event.target.result;
                const response = await generalContactsAPI.uploadCSV(csvData);
                
                if (response.success) {
                    const { added, skipped, total } = response.data;
                    toast.success(`Successfully added ${added} contacts! ${skipped > 0 ? `(${skipped} skipped)` : ''}`);
                    setShowCSVModal(false);
                    fetchContacts(searchQuery);
                } else {
                    throw new Error(response.error || 'Failed to upload CSV');
                }
            } catch (error) {
                console.error('❌ Error uploading CSV:', error);
                toast.error(error.response?.data?.error || 'Failed to upload CSV file');
            } finally {
                setUploading(false);
            }
        };

        reader.onerror = () => {
            toast.error('Failed to read file');
            setUploading(false);
        };

        reader.readAsText(file);
    };

    // Delete contact handler with dynamic removal from recipient list
    const handleDeleteContact = async (contactId) => {
        try {
            // Find the contact before deleting to get email
            const contactToDelete = contacts.find(c => c.id === contactId);
            
            const response = await generalContactsAPI.delete(contactId);
            if (response.success) {
                toast.success('Contact deleted successfully');
                fetchContacts(searchQuery);
                
                // Notify parent to remove from recipients if present
                if (contactToDelete && onContactRemove) {
                    onContactRemove(contactToDelete.email);
                }
            } else {
                throw new Error('Failed to delete contact');
            }
        } catch (error) {
            console.error('❌ Error deleting contact:', error);
            toast.error('Failed to delete contact');
        }
    };

    // Filter and sort contacts
    const filteredAndSortedContacts = contacts
        .filter(contact => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    contact.email.toLowerCase().includes(query) ||
                    contact.name?.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return (a.name || a.email).localeCompare(b.name || b.email);
                case 'name-desc':
                    return (b.name || b.email).localeCompare(a.name || a.email);
                case 'email-asc':
                    return a.email.localeCompare(b.email);
                case 'recent':
                    return new Date(b.created_at) - new Date(a.created_at);
                default:
                    return 0;
            }
        });

    // Get initials for avatar
    const getInitials = (contact) => {
        if (contact.name) {
            const names = contact.name.trim().split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[1][0]).toUpperCase();
            }
            return names[0][0].toUpperCase();
        }
        return contact.email[0].toUpperCase();
    };

    // Get background color for avatar
    const getAvatarColor = (email) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-orange-500',
            'bg-red-500',
            'bg-teal-500',
            'bg-cyan-500',
            'bg-amber-500',
        ];
        const index = email.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedContacts.size === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0) {
            // Deselect all - remove from recipients
            filteredAndSortedContacts.forEach(contact => {
                if (onContactRemove) {
                    onContactRemove(contact.email);
                }
            });
            setSelectedContacts(new Set());
        } else {
            // Select all filtered contacts - add to recipients
            filteredAndSortedContacts.forEach(contact => {
                if (onContactSelect) {
                    onContactSelect(contact);
                }
            });
            const allIds = new Set(filteredAndSortedContacts.map(c => c.id));
            setSelectedContacts(allIds);
        }
    };

    // Toggle individual contact selection
    const toggleContactSelection = (contact) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(contact.id)) {
            // Deselect
            newSelected.delete(contact.id);
            if (onContactRemove) {
                onContactRemove(contact.email);
            }
        } else {
            // Select
            newSelected.add(contact.id);
            if (onContactSelect) {
                onContactSelect(contact);
            }
        }
        setSelectedContacts(newSelected);
    };

    // Show skeleton loader
    if (loading) {
        return <ContactsSidebarSkeleton />;
    }

    return (
        <div className="w-80 border-l border-border bg-background flex flex-col fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-hidden">
            {/* Header with counter */}
            <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <i className="ri-contacts-line"></i>
                        Contacts
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                        {contacts.length}
                    </span>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-3">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                    <Input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9 text-sm"
                    />
                </div>

                {/* Sort and Select All Row */}
                <div className="flex items-center gap-2 mb-3">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 h-8 text-xs px-2 border border-border rounded-md bg-background hover:bg-accent transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="name-asc">Name (A → Z)</option>
                        <option value="name-desc">Name (Z → A)</option>
                        <option value="email-asc">Email (A → Z)</option>
                        <option value="recent">Recently Added</option>
                    </select>
                    
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3 whitespace-nowrap"
                        onClick={handleSelectAll}
                        disabled={filteredAndSortedContacts.length === 0}
                    >
                        <i className={`ri-${selectedContacts.size === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0 ? 'checkbox-line' : 'checkbox-blank-line'} mr-1 text-sm`}></i>
                        Select All
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => setShowCSVModal(true)}
                    >
                        <i className="ri-file-upload-line mr-1 text-sm"></i>
                        Upload CSV
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="ri-user-add-line mr-1 text-sm"></i>
                        Add
                    </Button>
                </div>
            </div>

            {/* Contacts Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredAndSortedContacts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <i className="ri-contacts-line text-3xl text-muted-foreground"></i>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                            {searchQuery ? 'No contacts found' : 'No contacts yet'}
                        </p>
                        {!searchQuery && (
                            <p className="text-xs text-muted-foreground">
                                Click "Add" or "Upload CSV" to get started
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-3">
                        {filteredAndSortedContacts.map((contact) => {
                            const isSelected = selectedContacts.has(contact.id);
                            return (
                                <div
                                    key={contact.id}
                                    className="relative group"
                                >
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteContact(contact.id);
                                        }}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                                        title="Delete contact"
                                    >
                                        <i className="ri-delete-bin-line text-xs"></i>
                                    </button>

                                    {/* Contact Card */}
                                    <div
                                        onClick={() => toggleContactSelection(contact)}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all ${
                                            isSelected 
                                                ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' 
                                                : 'hover:bg-accent'
                                        }`}
                                        title={contact.email}
                                    >
                                        {/* Selected indicator */}
                                        {isSelected && (
                                            <div className="absolute top-1 left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <i className="ri-check-line text-white text-xs"></i>
                                            </div>
                                        )}

                                        {/* Avatar */}
                                        <div
                                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md group-hover:scale-105 transition-transform ${getAvatarColor(
                                                contact.email
                                            )}`}
                                        >
                                            {getInitials(contact)}
                                        </div>
                                        
                                        {/* Name/Email */}
                                        <div className="text-center w-full px-1">
                                            <p className="text-[10px] font-medium truncate leading-tight">
                                                {contact.name || contact.email.split('@')[0]}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Contact Modal */}
            {showAddModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                    onClick={() => setShowAddModal(false)}
                >
                    <Card className="w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <i className="ri-user-add-line text-blue-600"></i>
                                Add New Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Name (Optional)
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setNewContact({ email: '', name: '' });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        className="flex-1" 
                                        onClick={handleAddContact}
                                        disabled={!newContact.email}
                                    >
                                        <i className="ri-check-line mr-1"></i>
                                        Add Contact
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* CSV Upload Modal */}
            {showCSVModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                    onClick={() => setShowCSVModal(false)}
                >
                    <Card className="w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <i className="ri-file-upload-line text-blue-600"></i>
                                Upload CSV File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm text-blue-900 dark:text-blue-100 mb-2 font-medium">
                                        CSV Format Requirements:
                                    </p>
                                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                        <li className="flex items-start gap-2">
                                            <i className="ri-checkbox-circle-fill text-blue-600 mt-0.5"></i>
                                            <span>Required column: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">email</code></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="ri-checkbox-circle-fill text-blue-600 mt-0.5"></i>
                                            <span>Optional column: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">name</code></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="ri-information-fill text-blue-600 mt-0.5"></i>
                                            <span>First row should contain column headers</span>
                                        </li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <label className="block mb-2">
                                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleCSVUpload}
                                                className="hidden"
                                                id="csv-upload"
                                                disabled={uploading}
                                            />
                                            <label htmlFor="csv-upload" className="cursor-pointer">
                                                <i className="ri-upload-cloud-2-line text-4xl text-muted-foreground mb-2 block"></i>
                                                <p className="text-sm font-medium mb-1">
                                                    {uploading ? 'Uploading...' : 'Click to select CSV file'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    or drag and drop
                                                </p>
                                            </label>
                                        </div>
                                    </label>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowCSVModal(false)}
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ContactsSidebar;
