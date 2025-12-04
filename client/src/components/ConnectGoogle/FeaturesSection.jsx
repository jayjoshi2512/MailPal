import React from 'react';

const features = [
    { icon: 'ri-shield-check-line', text: 'Secure OAuth 2.0 authentication' },
    { icon: 'ri-mail-line', text: 'Send emails directly from your Gmail' },
    { icon: 'ri-user-line', text: 'No traditional signup required' },
    { icon: 'ri-lock-line', text: 'Your data stays private & secure' }
];

const FeaturesSection = () => {
    return (
        <div className="space-y-3 pt-2">
            {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <i className={`${feature.icon} text-blue-600`}></i>
                    </div>
                    <span className="text-muted-foreground">{feature.text}</span>
                </div>
            ))}
        </div>
    );
};

export default FeaturesSection;
