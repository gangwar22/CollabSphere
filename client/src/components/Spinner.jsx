import React from 'react';

const Spinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className={`animate-spin rounded-full border-t-transparent border-primary-500 ${sizeClasses[size]}`}></div>
    );
};

export default Spinner;
