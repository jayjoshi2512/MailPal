import React from 'react';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Textarea } from '@/components/components/ui/textarea';
import { Badge } from '@/components/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';

const CreateTemplateDialog = ({ 
    open, 
    onOpenChange, 
    formData, 
    setFormData, 
    onSave, 
    isSaving,
    isEditing 
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <i className={`ri-${isEditing ? 'pencil' : 'add'}-line text-blue-500`}></i>
                        {isEditing ? 'Edit Template' : 'New Template'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update your template' : 'Create a reusable email template'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 overflow-y-auto scrollbar-hide flex-1 pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Name *</label>
                            <Input
                                placeholder="Template name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Type</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                            >
                                <option value="campaign">Campaign (with variables)</option>
                                <option value="compose">Compose (simple)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block">Subject *</label>
                        <Input
                            placeholder={formData.category === 'campaign' ? 'e.g., Application for {{position}} at {{company}}' : 'e.g., Meeting Request'}
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block">Body *</label>
                        <Textarea
                            placeholder={formData.category === 'campaign' 
                                ? 'Hi {{name}},\n\nI am writing to express my interest in...' 
                                : 'Hi,\n\nI hope this email finds you well...'}
                            value={formData.body}
                            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                            className="min-h-[200px] max-h-[300px] resize-none"
                        />
                    </div>
                    {formData.category === 'campaign' && (
                        <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs font-medium mb-2 flex items-center gap-1">
                                <i className="ri-information-line"></i>
                                Dynamic Variables
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Use <code className="bg-muted px-1 rounded">{`{{variable_name}}`}</code> syntax for dynamic content. 
                                <strong> Any column name from your CSV file</strong> can be used as a variable. Common examples:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {['name', 'email', 'company', 'position', 'role', 'first_name', 'last_name'].map(v => (
                                    <Badge key={v} variant="outline" className="text-[10px] font-mono">
                                        {`{{${v}}}`}
                                    </Badge>
                                ))}
                                <Badge variant="secondary" className="text-[10px]">+ any CSV column</Badge>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? (
                            <><i className="ri-loader-4-line animate-spin mr-2"></i>Saving...</>
                        ) : (
                            <><i className="ri-check-line mr-2"></i>{isEditing ? 'Update' : 'Create'}</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTemplateDialog;
