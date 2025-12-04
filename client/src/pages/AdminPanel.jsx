import React, { useState, useEffect } from 'react';
import { AdminLogin, AdminDashboard } from '@/components/AdminPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminAPI = {
    verify: async (token) => {
        const res = await fetch(`${API_URL}/admin/verify`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },
};

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        const storedToken = localStorage.getItem('admin_token');
        if (storedToken) {
            try {
                const result = await adminAPI.verify(storedToken);
                if (result.success) {
                    setToken(storedToken);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('admin_token');
                }
            } catch (error) {
                localStorage.removeItem('admin_token');
            }
        }
        setChecking(false);
    };

    const handleAuthenticated = (newToken) => {
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setToken(null);
        setIsAuthenticated(false);
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin text-4xl text-primary"></i>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onAuthenticated={handleAuthenticated} />;
    }

    return <AdminDashboard token={token} onLogout={handleLogout} />;
};

export default AdminPanel;
