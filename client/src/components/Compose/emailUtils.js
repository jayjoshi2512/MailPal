/**
 * Email utility functions
 * Clean, production-ready utilities without unused code
 */

/**
 * Validates email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Formats file size to human-readable format
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generates email suggestions based on common domains
 */
export const generateEmailSuggestions = (input, commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']) => {
    if (!input.includes('@') || input.includes(' ')) {
        return [];
    }

    const [localPart, domain] = input.split('@');
    
    if (!localPart) {
        return [];
    }

    if (domain) {
        // Filter domains that start with the typed domain
        return commonDomains
            .filter(d => d.startsWith(domain))
            .map(d => `${localPart}@${d}`);
    } else {
        // Show all domains if @ was just typed
        return commonDomains.map(d => `${localPart}@${d}`);
    }
};
