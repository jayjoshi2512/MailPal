import React, { useState, useEffect } from 'react';
import { Input } from '@/components/components/ui/input';
import { Button } from '@/components/components/ui/button';
import { toast } from 'sonner';
import { generalContactsAPI } from '@/services/api';
import ContactsSidebarSkeleton from './ContactsSidebarSkeleton';

/**
 * ContactsSidebar - Contacts list with manual add functionality
 * Features: Search, Select All, Add new contact (name optional, email required)
 */
const ContactsSidebar = ({ onContactSelect, onContactRemove }) => {
    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState(new Set());
    
    // Add contact form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactEmail, setNewContactEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async (search = '') => {
        try {
            setLoading(true);
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

    const filteredContacts = contacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        return contact.email.toLowerCase().includes(query) || contact.name?.toLowerCase().includes(query);
    });

    const getInitials = (contact) => {
        if (contact.name) {
            const names = contact.name.trim().split(' ');
            return names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : names[0][0].toUpperCase();
        }
        return contact.email[0].toUpperCase();
    };

    const getAvatarColor = (email) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
        return colors[email.charCodeAt(0) % colors.length];
    };

    const handleSelectAll = () => {
        if (selectedContacts.size === filteredContacts.length && filteredContacts.length > 0) {
            filteredContacts.forEach(c => onContactRemove?.(c.email));
            setSelectedContacts(new Set());
        } else {
            filteredContacts.forEach(c => onContactSelect?.(c));
            setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const toggleContactSelection = (contact) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(contact.id)) {
            newSelected.delete(contact.id);
            onContactRemove?.(contact.email);
        } else {
            newSelected.add(contact.id);
            onContactSelect?.(contact);
        }
        setSelectedContacts(newSelected);
    };

    const handleAddContact = async () => {
        if (!newContactEmail.trim()) {
            toast.error('Email is required');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newContactEmail.trim())) {
            toast.error('Please enter a valid email');
            return;
        }

        // Check if contact already exists
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

    if (loading) return <ContactsSidebarSkeleton />;

    return (
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
                    <i className={`ri-${selectedContacts.size === filteredContacts.length && filteredContacts.length > 0 ? 'checkbox-line' : 'checkbox-blank-line'} mr-1`}></i>
                    Select All
                </Button>
            </div>

            {/* Contacts Grid - Compact design */}
            <div className="flex-1 overflow-y-auto p-2">
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
                            return (
                                <div
                                    key={contact.id}
                                    onClick={() => toggleContactSelection(contact)}
                                    className={`relative flex flex-col items-center p-1.5 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'hover:bg-accent'}`}
                                    title={contact.email}
                                >
                                    {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center z-10">
                                            <i className="ri-check-line text-white text-[10px]"></i>
                                        </div>
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarColor(contact.email)}`}>
                                        {getInitials(contact)}
                                    </div>
                                    <p className="text-[9px] font-medium truncate w-full text-center mt-1">
                                        {contact.name || contact.email.split('@')[0]}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsSidebar;
