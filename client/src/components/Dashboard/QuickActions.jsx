import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * QuickActions - Action buttons for common tasks
 */
const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Compose Email',
            icon: 'ri-edit-line',
            color: 'blue',
            path: '/compose'
        },
        {
            label: 'New Campaign',
            icon: 'ri-add-line',
            color: 'green',
            path: '/campaigns/new'
        },
        {
            label: 'View Campaigns',
            icon: 'ri-folder-line',
            color: 'teal',
            path: '/campaigns'
        }
    ];

    return (
        <div className="mt-4 grid grid-cols-3 gap-3">
            {actions.map((action, idx) => (
                <ActionButton key={idx} {...action} onClick={() => navigate(action.path)} />
            ))}
        </div>
    );
};

const ActionButton = ({ label, icon, color, onClick }) => (
    <button 
        onClick={onClick} 
        className={`p-3 rounded-xl border bg-${color}-500/5 hover:bg-${color}-500/10 border-${color}-500/20 transition-all flex items-center justify-center gap-2 text-sm font-medium group`}
    >
        <i className={`${icon} text-${color}-500 group-hover:scale-110 transition-transform`}></i>
        {label}
    </button>
);

export default QuickActions;
