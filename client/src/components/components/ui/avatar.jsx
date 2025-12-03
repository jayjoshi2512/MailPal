import React, { useState } from 'react';

/**
 * Get initials from a full name
 * @param {string} name - Full name (e.g., "Jay Joshi")
 * @returns {string} Initials (e.g., "JJ")
 */
const getInitials = (name) => {
    if (!name) return '??';

    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

    // Get first letter of first and last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate a consistent color based on name
 * @param {string} name - User's name
 * @returns {string} Background color class
 */
const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';

    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-sky-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-red-500',
        'bg-orange-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-amber-500',
    ];

    // Generate consistent color based on name
    const hash = name.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
};

/**
 * Avatar Component
 * Shows profile picture or fallback to initials
 */
export const Avatar = ({
    src,
    alt,
    name,
    size = 'md',
    className = ''
}) => {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-16 h-16 text-2xl',
        xl: 'w-20 h-20 text-3xl',
        '2xl': 'w-24 h-24 text-4xl',
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const initials = getInitials(name || alt);
    const bgColor = getAvatarColor(name || alt);

    // Show image if src exists and hasn't errored
    const showImage = src && !imageError;

    return (
        <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizeClass} ${className}`}>
            {showImage ? (
                <img
                    src={src}
                    alt={alt || name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
            ) : (
                <div className={`w-full h-full flex items-center justify-center ${bgColor} text-white font-semibold`}>
                    {initials}
                </div>
            )}
        </div>
    );
};

/**
 * Avatar Group Component
 * Shows multiple avatars in a row with overlap
 */
export const AvatarGroup = ({
    avatars = [],
    max = 3,
    size = 'md',
    className = ''
}) => {
    const displayAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
        <div className={`flex items-center -space-x-2 ${className}`}>
            {displayAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    alt={avatar.alt}
                    name={avatar.name}
                    size={size}
                    className="ring-2 ring-background"
                />
            ))}

            {remainingCount > 0 && (
                <div className={`${size === 'xs' ? 'w-6 h-6 text-xs' : size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-background text-gray-700 dark:text-gray-300 font-medium`}>
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};

export default Avatar;
