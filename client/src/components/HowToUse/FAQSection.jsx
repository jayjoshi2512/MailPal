import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/components/ui/card';

const FAQSection = ({ faqs }) => {
    return (
        <Card className="col-span-2">
            <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <i className="ri-question-answer-line"></i>
                    FAQ
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
                <div className="grid grid-cols-2 gap-2">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="p-2 rounded border bg-muted/30">
                            <p className="text-xs font-medium leading-tight">{faq.q}</p>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default FAQSection;
