import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="clay-card p-6 bg-surface-light border border-white/5 animate-pulse-skeleton min-h-[300px] flex flex-col gap-4">
            {/* Image placeholder */}
            <div className="w-full h-48 bg-white/5 rounded-2xl"></div>
            
            {/* Header placeholder */}
            <div className="space-y-3">
                <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
            </div>
            
            {/* Stats placeholder */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="h-8 bg-white/5 rounded-lg"></div>
                <div className="h-8 bg-white/5 rounded-lg"></div>
            </div>
            
            {/* Footer placeholder */}
            <div className="h-12 bg-white/10 rounded-xl w-full mt-4"></div>
        </div>
    );
};

export default SkeletonCard;
