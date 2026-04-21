import React, { useState } from 'react';
import { registerForEvent } from '../../api/registrationService';
import { Calendar, MapPin, ExternalLink, Clock, Bookmark, CalendarPlus, Check } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for consolidating classes
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const OpportunityCard = ({
    id,
    title,
    org,
    date,
    location,
    tags = [],
    type = 'default',
    image,
    price,
    link
}) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isAddedToCal, setIsAddedToCal] = useState(false);
    
    // Application States
    const [isApplying, setIsApplying] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null); // null, 'success', 'error'

    const handleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaved(!isSaved);
    };

    const handleAddToCal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAddedToCal(!isAddedToCal);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (applyStatus === 'success' || applyStatus === 'error') return;

        // Open external registration smoothly and synchronously to avoid popup blockers
        if (link) {
            window.open(link, '_blank');
        }

        try {
            setIsApplying(true);
            await registerForEvent(id);
            setApplyStatus('success');
        } catch (err) {
            console.error('Registration failed:', err);
            // If the user isn't logged in, it will fail internally but we still let them visit the off-site link!
            setApplyStatus('error');
        } finally {
            setIsApplying(false);
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'conference': return 'text-purple-300 bg-purple-900/30';
            case 'hackathon': 
            case 'event':
            case 'ideathon': return 'text-rose-300 bg-rose-900/30';
            case 'project expo': return 'text-cyan-300 bg-cyan-900/30';
            case 'workshop': return 'text-amber-300 bg-amber-900/30';
            case 'contribution': return 'text-emerald-300 bg-emerald-900/30';
            default: return 'text-text-muted bg-white/5';
        }
    };

    return (
        <div className="clay-card group flex flex-col h-full overflow-hidden relative bg-bg-card">
            {/* Image Header with Clay cutout effect */}
            <div className="h-44 relative overflow-hidden m-2 rounded-[2rem] clay-inset">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center opacity-30 ${getTypeStyles()}`}>
                        <span className="text-5xl font-heading font-bold opacity-40">{title[0]}</span>
                    </div>
                )}

                {/* Save for Later Button */}
                <button 
                    onClick={handleSave}
                    className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors shadow-lg group"
                    title="Save for Later"
                >
                    <Bookmark size={16} className={isSaved ? "fill-primary text-primary" : "text-white group-hover:text-primary transition-colors"} />
                </button>

                {/* Add to Calendar Button */}
                <button 
                    onClick={handleAddToCal}
                    className={`absolute top-3 left-[3.25rem] z-20 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center border transition-all shadow-lg group ${isAddedToCal ? 'bg-primary/90 border-primary shadow-[0_0_15px_rgba(138,154,91,0.5)]' : 'bg-black/40 border-white/10 hover:bg-black/60'}`}
                    title={isAddedToCal ? "Added to Calendar" : "Add to Calendar"}
                >
                    {isAddedToCal ? <Check size={16} className="text-white" /> : <CalendarPlus size={16} className="text-white group-hover:text-primary transition-colors" />}
                </button>

                {/* Deadline Badge (High Engagement) */}
                {(type === 'hackathon' || type === 'internship') && (
                    <div className="absolute bottom-0 inset-x-0 bg-terracotta/95 text-white text-[11px] font-bold text-center py-1.5 uppercase tracking-wider backdrop-blur-sm z-20">
                        ⚡ Closing in {Math.floor(Math.random() * 3) + 2} days
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm", getTypeStyles())}>
                        {type}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col relative text-text-main">
                <div className="mb-4">
                    <p className="text-xs font-bold text-sage uppercase tracking-wide mb-1 flex items-center gap-2">
                        {org}
                    </p>
                    <h3 className="text-xl font-heading font-bold leading-tight group-hover:text-terracotta transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Calendar size={16} className="text-terracotta" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        {type === 'workshop' ? <Clock size={16} className="text-terracotta" /> : <MapPin size={16} className="text-terracotta" />}
                        <span>{location}</span>
                    </div>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag, i) => (
                            <span key={i} className="text-xs px-3 py-1 bg-surface-light dark:bg-surface-dark rounded-full text-text-muted font-medium hover:bg-terracotta hover:text-white transition-colors cursor-pointer">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-muted tracking-wide">+42 Attending</span>
                        <div className="flex -space-x-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-surface-light border-2 border-bg-card flex items-center justify-center text-[10px] font-bold text-text-muted">
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleApply}
                        disabled={isApplying || applyStatus === 'success'}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 group/btn ${
                            applyStatus === 'success' 
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                            : applyStatus === 'error'
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            : 'bg-text-main hover:bg-terracotta text-bg-primary hover:text-white'
                        }`}
                    >
                        {isApplying ? 'Processing...' : applyStatus === 'success' ? 'Applied ✨' : applyStatus === 'error' ? 'Already Applied' : 'Apply Now'}
                        {!applyStatus && !isApplying && <ExternalLink size={16} className="transition-transform group-hover/btn:translate-x-1" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpportunityCard;
