import React from 'react';

const StepIndicator = ({ currentStep, onStepClick }) => {
    const steps = ['Upload', 'Configure', 'Template'];

    return (
        <div className="flex items-center gap-1 mb-6 text-sm">
            {steps.map((s, i) => (
                <React.Fragment key={s}>
                    <button
                        onClick={() => i + 1 < currentStep && onStepClick(i + 1)}
                        disabled={i + 1 > currentStep}
                        className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                            i + 1 === currentStep ? 'bg-blue-600 text-white' :
                            i + 1 < currentStep ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 cursor-pointer' :
                            'bg-muted text-muted-foreground'
                        }`}
                    >
                        {i + 1 < currentStep ? <i className="ri-check-line"></i> : i + 1}. {s}
                    </button>
                    {i < 2 && <div className={`flex-1 h-0.5 ${i + 1 < currentStep ? 'bg-blue-600' : 'bg-muted'}`} />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default StepIndicator;
