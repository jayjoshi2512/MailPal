import React from 'react';
import { Button } from '@/components/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';

const ConfirmSendDialog = ({ 
    open, 
    onOpenChange, 
    campaign, 
    recipients = [],
    dailyLimit = 500,
    onSend 
}) => {
    const recipientsCount = recipients.length;
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <i className="ri-send-plane-line text-blue-600"></i>Send Campaign
                    </DialogTitle>
                    <DialogDescription>
                        Send <strong>{recipientsCount}</strong> emails for "<strong>{campaign?.name}</strong>"
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Recipients</span>
                        <span className="font-medium">{recipientsCount}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Daily Limit</span>
                        <span className="font-medium">{dailyLimit}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Sent Today</span>
                        <span className="font-medium">{localStorage.getItem('emails_sent_today') || 0}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onSend}>
                        <i className="ri-send-plane-line mr-2"></i>Send Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmSendDialog;
