import axios from 'axios';

/**
 * API Service - Centralized API calls with axios
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed';
        throw new Error(message);
    }
);

// ========================================
// AUTH API
// ========================================

export const authAPI = {
    /**
     * Get Google OAuth URL
     * Sends isReturningUser flag to determine if consent is needed
     */
    getGoogleAuthUrl: async () => {
        // Check if user has JWT token (means they've connected before)
        const token = localStorage.getItem('token');
        const isReturningUser = !!token;
        
        return apiClient.get(`/auth/google?isReturningUser=${isReturningUser}`);
    },
    
    /**
     * Get current user
     */
    getCurrentUser: async () => {
        return apiClient.get('/auth/me');
    },
    
    /**
     * Logout
     */
    logout: async () => {
        const data = await apiClient.post('/auth/logout');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        return data;
    },
    
    /**
     * Refresh access token
     */
    refreshToken: async () => {
        return apiClient.post('/auth/refresh');
    },
};

// ========================================
// CAMPAIGNS API
// ========================================

export const campaignsAPI = {
    /**
     * Get all campaigns
     */
    getAll: async (params = {}) => {
        return apiClient.get('/campaigns', { params });
    },
    
    /**
     * Get single campaign
     */
    getById: async (id) => {
        return apiClient.get(`/campaigns/${id}`);
    },
    
    /**
     * Create campaign
     */
    create: async (campaignData) => {
        return apiClient.post('/campaigns', campaignData);
    },
    
    /**
     * Update campaign
     */
    update: async (id, campaignData) => {
        return apiClient.patch(`/campaigns/${id}`, campaignData);
    },
    
    /**
     * Delete campaign
     */
    delete: async (id) => {
        return apiClient.delete(`/campaigns/${id}`);
    },
    
    /**
     * Get campaign analytics
     */
    getAnalytics: async (id) => {
        return apiClient.get(`/campaigns/${id}/analytics`);
    },
};

// ========================================
// CONTACTS API
// ========================================

export const contactsAPI = {
    /**
     * Get all contacts for campaign
     */
    getAll: async (campaignId, params = {}) => {
        return apiClient.get(`/campaigns/${campaignId}/contacts`, { params });
    },
    
    /**
     * Add single contact
     */
    add: async (campaignId, contactData) => {
        return apiClient.post(`/campaigns/${campaignId}/contacts`, contactData);
    },
    
    /**
     * Bulk add contacts
     */
    bulkAdd: async (campaignId, contacts) => {
        return apiClient.post(`/campaigns/${campaignId}/contacts/bulk`, { contacts });
    },
    
    /**
     * Update contact
     */
    update: async (campaignId, contactId, contactData) => {
        return apiClient.patch(`/campaigns/${campaignId}/contacts/${contactId}`, contactData);
    },
    
    /**
     * Delete contact
     */
    delete: async (campaignId, contactId) => {
        return apiClient.delete(`/campaigns/${campaignId}/contacts/${contactId}`);
    },
};

// ========================================
// GENERAL CONTACTS API (User's contact list)
// ========================================

export const generalContactsAPI = {
    /**
     * Get all contacts for the authenticated user
     */
    getAll: async (search = '') => {
        const params = search ? { search } : {};
        return apiClient.get('/contacts', { params });
    },
    
    /**
     * Create a single contact
     */
    create: async (contactData) => {
        return apiClient.post('/contacts', contactData);
    },
    
    /**
     * Upload contacts from CSV
     */
    uploadCSV: async (csvData) => {
        return apiClient.post('/contacts/upload-csv', { csvData });
    },
    
    /**
     * Update contact
     */
    update: async (contactId, contactData) => {
        return apiClient.put(`/contacts/${contactId}`, contactData);
    },
    
    /**
     * Delete contact
     */
    delete: async (contactId) => {
        return apiClient.delete(`/contacts/${contactId}`);
    },
};

// ========================================
// UPLOAD API
// ========================================

export const uploadAPI = {
    /**
     * Upload single file
     */
    uploadSingle: async (file, onUploadProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return apiClient.post('/upload/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
    },
    
    /**
     * Upload multiple files
     */
    uploadMultiple: async (files, onUploadProgress) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        return apiClient.post('/upload/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
    },
    
    /**
     * Delete uploaded file
     */
    deleteFile: async (filename) => {
        return apiClient.delete(`/upload/${filename}`);
    },
};

// ========================================
// DASHBOARD API
// ========================================

export const dashboardAPI = {
    /**
     * Get comprehensive dashboard statistics
     */
    getStats: async () => {
        return apiClient.get('/dashboard/stats');
    },

    /**
     * Get response rate
     */
    getResponseRate: async () => {
        return apiClient.get('/dashboard/response-rate');
    },
};

// ========================================
// EMAIL API
// ========================================

export const emailAPI = {
    /**
     * Send email with optional attachments
     */
    send: async (emailData) => {
        return apiClient.post('/emails/test', emailData);
    },
};

// ========================================
// HEALTH CHECK
// ========================================

export const healthCheck = async () => {
    try {
        const response = await apiClient.get('/health');
        return response;
    } catch (error) {
        console.error('Health check failed:', error);
        return { success: false, error: error.message };
    }
};

export default {
    auth: authAPI,
    dashboard: dashboardAPI,
    campaigns: campaignsAPI,
    contacts: contactsAPI,
    generalContacts: generalContactsAPI,
    upload: uploadAPI,
    email: emailAPI,
    healthCheck,
};
