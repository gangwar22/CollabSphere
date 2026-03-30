import React from 'react';

const Skeleton = ({ className }) => {
    return (
        <div className={`bg-dark-border/50 animate-pulse rounded-lg ${className}`}></div>
    );
};

export default Skeleton;
