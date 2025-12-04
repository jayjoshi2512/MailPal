import React from 'react';
import { Card, CardContent } from '@/components/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/components/ui/tabs';

const GuidesTabs = ({ guides }) => {
    return (
        <Tabs defaultValue="getting-started" className="space-y-3">
            <TabsList className="grid grid-cols-5 w-full h-9">
                {Object.entries(guides).map(([key, { title, icon }]) => (
                    <TabsTrigger key={key} value={key} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <i className={`${icon} text-sm`}></i>
                        <span className="hidden sm:inline">{title}</span>
                    </TabsTrigger>
                ))}
            </TabsList>

            {Object.entries(guides).map(([key, { steps }]) => (
                <TabsContent key={key} value={key} className="mt-3">
                    <Card>
                        <CardContent className="p-3">
                            <div className="space-y-2">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 items-start p-2.5 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                        <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm leading-tight">{step.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            ))}
        </Tabs>
    );
};

export default GuidesTabs;
