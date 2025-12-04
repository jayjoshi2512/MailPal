import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';

const FileUploadStep = ({ 
    campaignName, 
    setCampaignName, 
    uploadedFile, 
    fileData, 
    fileInputRef, 
    handleFileUpload, 
    onNext 
}) => {
    return (
        <Card className="max-w-3xl">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Upload Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">Campaign Name *</label>
                    <Input 
                        value={campaignName} 
                        onChange={e => setCampaignName(e.target.value)} 
                        placeholder="e.g., Q4 Outreach" 
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Contact File *</label>
                    <div 
                        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${
                            uploadedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'hover:border-blue-400'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept=".csv,.xlsx,.xls" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                        />
                        {uploadedFile ? (
                            <>
                                <i className="ri-file-excel-2-line text-xl text-green-600"></i>
                                <p className="font-medium text-green-600 text-sm">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{fileData.records.length} contacts</p>
                            </>
                        ) : (
                            <>
                                <i className="ri-upload-cloud-2-line text-xl text-muted-foreground"></i>
                                <p className="text-sm font-medium">Click to upload</p>
                                <p className="text-xs text-muted-foreground">CSV, XLSX</p>
                            </>
                        )}
                    </div>
                </div>
                {fileData.headers.length > 0 && (
                    <div className="border rounded-lg overflow-hidden text-xs">
                        <table className="w-full">
                            <thead className="bg-muted sticky top-0">
                                <tr>
                                    {fileData.headers.map((h, i) => (
                                        <th key={i} className="px-2 py-1 text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fileData.records.slice(0, 3).map((r, i) => (
                                    <tr key={i} className="border-t">
                                        {fileData.headers.map((h, j) => (
                                            <td key={j} className="px-2 py-1 truncate max-w-24">{r[h]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {fileData.records.length > 3 && (
                            <div className="bg-muted/50 px-2 py-1.5 text-center text-muted-foreground border-t">
                                +{fileData.records.length - 3} more contacts
                            </div>
                        )}
                    </div>
                )}
                <div className="flex justify-end">
                    <Button onClick={onNext} disabled={!uploadedFile || !campaignName.trim()}>
                        Next <i className="ri-arrow-right-line ml-1"></i>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default FileUploadStep;
