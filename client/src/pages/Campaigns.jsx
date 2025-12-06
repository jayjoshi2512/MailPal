import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { campaignsAPI } from '@/services/api';
import { 
    CampaignsHeader, 
    CampaignsSearch, 
    CampaignsTable, 
    EmptyCampaigns, 
    DeleteCampaignDialog, 
    CampaignsSkeleton 
} from '@/components/Campaigns';

const Campaigns = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });

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

    const filteredCampaigns = campaigns.filter(campaign => 
        (campaign.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openDeleteDialog = (campaign, e) => {
        e.stopPropagation();
        setDeleteDialog({ open: true, campaign });
    };

    const handleDelete = async () => {
        if (!deleteDialog.campaign) return;
        const campaignId = deleteDialog.campaign.id || deleteDialog.campaign._id;
        try {
            await campaignsAPI.delete(campaignId);
            setCampaigns(campaigns.filter(c => (c.id || c._id) !== campaignId));
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
                    <CampaignsHeader onNewCampaign={() => navigate('/campaigns/new')} />
                    <CampaignsSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                    {loading ? (
                        <CampaignsSkeleton />
                    ) : filteredCampaigns.length === 0 ? (
                        <EmptyCampaigns 
                            searchQuery={searchQuery} 
                            onNewCampaign={() => navigate('/campaigns/new')} 
                        />
                    ) : (
                        <CampaignsTable 
                            campaigns={filteredCampaigns}
                            onView={(id) => navigate(`/campaigns/${id}`)}
                            onDelete={openDeleteDialog}
                        />
                    )}
                </div>
            </main>

            <DeleteCampaignDialog 
                open={deleteDialog.open}
                campaign={deleteDialog.campaign}
                onOpenChange={(open) => setDeleteDialog({ open, campaign: deleteDialog.campaign })}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default Campaigns;
