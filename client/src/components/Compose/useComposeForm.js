import { useState, useCallback } from 'react';
import { isValidEmail, generateEmailSuggestions } from './emailUtils';

/**
 * Custom hook for managing email recipients with autocomplete
 */
export const useEmailRecipients = () => {
    const [to, setTo] = useState('');
    const [toEmails, setToEmails] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleToChange = useCallback((e) => {
        const value = e.target.value;
        setTo(value);

        // Generate suggestions
        const emailSuggestions = generateEmailSuggestions(value);
        setSuggestions(emailSuggestions);
        setShowSuggestions(emailSuggestions.length > 0);
    }, []);

    const addEmail = useCallback((email) => {
        const trimmedEmail = email.trim();
        if (trimmedEmail && isValidEmail(trimmedEmail) && !toEmails.includes(trimmedEmail)) {
            setToEmails(prev => [...prev, trimmedEmail]);
            setTo('');
            setShowSuggestions(false);
            return true;
        }
        return false;
    }, [toEmails]);

    const removeEmail = useCallback((emailToRemove) => {
        setToEmails(prev => prev.filter(email => email !== emailToRemove));
    }, []);

    const handleToKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault();
            if (to.trim()) {
                addEmail(to);
            }
        } else if (e.key === 'Backspace' && !to && toEmails.length > 0) {
            setToEmails(prev => prev.slice(0, -1));
        }
    }, [to, toEmails, addEmail]);

    const selectSuggestion = useCallback((suggestion) => {
        addEmail(suggestion);
    }, [addEmail]);

    const clearRecipients = useCallback(() => {
        setToEmails([]);
        setTo('');
        setShowSuggestions(false);
    }, []);

    return {
        to,
        toEmails,
        suggestions,
        showSuggestions,
        handleToChange,
        addEmail,
        removeEmail,
        handleToKeyDown,
        selectSuggestion,
        clearRecipients
    };
};

/**
 * Custom hook for managing file attachments
 */
export const useAttachments = () => {
    const [attachments, setAttachments] = useState([]);

    const addAttachments = useCallback((files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => file.size <= 25 * 1024 * 1024); // 25MB limit
        
        if (validFiles.length !== fileArray.length) {
            alert('Some files were skipped because they exceed 25MB limit');
        }
        
        setAttachments(prev => [...prev, ...validFiles]);
    }, []);

    const removeAttachment = useCallback((index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearAttachments = useCallback(() => {
        setAttachments([]);
    }, []);

    return {
        attachments,
        addAttachments,
        removeAttachment,
        clearAttachments
    };
};
