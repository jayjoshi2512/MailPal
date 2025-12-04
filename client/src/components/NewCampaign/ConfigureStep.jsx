import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Badge } from '@/components/components/ui/badge';

const ConfigureStep = ({ 
    emailColumn, 
    setEmailColumn, 
    variables, 
    setVariables, 
    fileData, 
    onBack, 
    onNext 
}) => {
    const handleEmailColumnChange = (value) => {
        setEmailColumn(value);
        setVariables(fileData.headers.filter(h => h !== value));
    };

    return (
        <Card className="max-w-3xl">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Configure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">Email Column *</label>
                    <select
                        value={emailColumn}
                        onChange={e => handleEmailColumnChange(e.target.value)}
                        className="w-full h-9 px-3 border rounded-md bg-background text-sm"
                    >
                        <option value="">Select</option>
                        {fileData.headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Variables</label>
                    <div className="flex flex-wrap gap-1">
                        {variables.map(v => (
                            <Badge key={v} variant="secondary" className="text-xs">
                                {`{{${v}}}`}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack}>
                        <i className="ri-arrow-left-line mr-1"></i> Back
                    </Button>
                    <Button onClick={onNext} disabled={!emailColumn}>
                        Next <i className="ri-arrow-right-line ml-1"></i>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ConfigureStep;
