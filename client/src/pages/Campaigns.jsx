import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Badge } from '@/components/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { campaignsAPI } from '@/services/api';

/**
 * Campaigns Page - List and manage email campaigns
 */
const Campaigns = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });

    // Fetch campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await campaignsAPI.getAll();
                if (response.success) {
                    setCampaigns(response.data.campaigns || []);
                }
            } catch (error) {
                console.error('Failed to fetch campaigns:', error);
                toast.error('Failed to load campaigns');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    // Filter campaigns by search
    const filteredCampaigns = campaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get status badge variant
    const getStatusBadge = (status) => {
        const variants = {
            draft: { variant: 'secondary', icon: 'ri-draft-line' },
            scheduled: { variant: 'outline', icon: 'ri-calendar-line' },
            running: { variant: 'default', icon: 'ri-play-circle-line' },
            paused: { variant: 'secondary', icon: 'ri-pause-circle-line' },
            completed: { variant: 'default', icon: 'ri-check-double-line' },
        };
        return variants[status] || variants.draft;
    };

    // Open delete dialog
    const openDeleteDialog = (campaign, e) => {
        e.stopPropagation();
        setDeleteDialog({ open: true, campaign });
    };

    // Delete campaign
    const handleDelete = async () => {
        if (!deleteDialog.campaign) return;
        
        try {
            await campaignsAPI.delete(deleteDialog.campaign.id);
            setCampaigns(campaigns.filter(c => c.id !== deleteDialog.campaign.id));
            toast.success('Campaign deleted');
            setDeleteDialog({ open: false, campaign: null });
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create and manage your cold email campaigns with AI-powered templates
                            </p>
                        </div>
                        <Button onClick={() => navigate('/campaigns/new')} className="gap-2">
                            <i className="ri-add-line text-lg"></i>
                            New Campaign
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                            <Input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Campaigns Table */}
                    {loading ? (
                        <Card>
                            <CardContent className="p-6">
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-12 bg-muted rounded"></div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : filteredCampaigns.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <i className="ri-mail-send-line text-3xl text-muted-foreground"></i>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchQuery ? 'No campaigns found' : 'No campaigns yet'}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                                    {searchQuery 
                                        ? 'Try a different search term'
                                        : 'Create your first campaign to start sending personalized cold emails with AI-generated templates'
                                    }
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => navigate('/campaigns/new')} className="gap-2">
                                        <i className="ri-add-line"></i>
                                        Create Campaign
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Campaign</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Subject</th>
                                            <th className="text-center p-3 text-xs font-medium text-muted-foreground">Status</th>
                                            <th className="text-center p-3 text-xs font-medium text-muted-foreground">Emails Sent</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Created</th>
                                            <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCampaigns.map((campaign) => {
                                            const statusBadge = getStatusBadge(campaign.status);
                                            return (
                                                <tr 
                                                    key={campaign.id} 
                                                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                                >
                                                    <td className="p-3">
                                                        <span className="font-medium text-sm">{campaign.name}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">{campaign.subject}</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Badge variant={statusBadge.variant} className="text-xs">
                                                            <i className={`${statusBadge.icon} mr-1`}></i>
                                                            {campaign.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-sm font-medium">{campaign.total_sent || 0}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(campaign.created_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/campaigns/${campaign.id}`);
                                                                }}
                                                            >
                                                                <i className="ri-eye-line text-sm"></i>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                                onClick={(e) => openDeleteDialog(campaign, e)}
                                                            >
                                                                <i className="ri-delete-bin-line text-sm"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, campaign: deleteDialog.campaign })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <i className="ri-delete-bin-line text-red-500"></i>
                            Delete Campaign
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "<strong>{deleteDialog.campaign?.name}</strong>"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-400">
                                <i className="ri-error-warning-line mr-2"></i>
                                All campaign data including sent email history will be permanently deleted.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, campaign: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <i className="ri-delete-bin-line mr-2"></i>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Campaigns;
