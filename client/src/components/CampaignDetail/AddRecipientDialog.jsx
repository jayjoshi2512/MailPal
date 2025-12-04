import React from 'react';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';

const AddRecipientDialog = ({ 
    open, 
    onOpenChange, 
    newRecipient, 
    setNewRecipient, 
    variables, 
    onAdd 
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <i className="ri-user-add-line text-green-600"></i>Add Recipient
                    </DialogTitle>
                    <DialogDescription>Add recipient with required variables</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    <div>
                        <label className="text-xs font-medium mb-1 block">Email *</label>
                        <Input 
                            type="email" 
                            placeholder="email@example.com" 
                            value={newRecipient.email} 
                            onChange={e => setNewRecipient(prev => ({ ...prev, email: e.target.value }))} 
                        />
                    </div>
                    {variables.map(v => (
                        <div key={v}>
                            <label className="text-xs font-medium mb-1 block">{v}</label>
                            <Input 
                                placeholder={`Enter ${v}...`} 
                                value={newRecipient[v] || ''} 
                                onChange={e => setNewRecipient(prev => ({ ...prev, [v]: e.target.value }))} 
                            />
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onAdd}>
                        <i className="ri-check-line mr-2"></i>Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddRecipientDialog;
