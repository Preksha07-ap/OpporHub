import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerForEvent } from '../../api/registrationService';
import { Calendar, MapPin, ExternalLink, Clock, Bookmark, BookmarkCheck, CalendarPlus, Check } from 'lucide-react';
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
    link,
    perks = [],
    outcomes = []
}) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isAddedToCal, setIsAddedToCal] = useState(false);
    
    // Application States
    const [isApplying, setIsApplying] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null); // null, 'success', 'error'

    // Load saved state from localStorage on mount
    useEffect(() => {
        try {
            const savedItems = JSON.parse(localStorage.getItem('opporhub_saved')) || [];
            if (savedItems.some(item => (typeof item === 'object' ? item.id === id : item === id))) {
                setIsSaved(true);
            }
        } catch (e) {
            console.error(e);
        }
    }, [id]);

    const handleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            let savedItems = JSON.parse(localStorage.getItem('opporhub_saved')) || [];
            if (isSaved) {
                // Remove from saved
                savedItems = savedItems.filter(item => (typeof item === 'object' ? item.id !== id : item !== id));
            } else {
                // Add to saved as a full object so the dashboard can render it immediately
                if (!savedItems.some(i => (typeof i === 'object' ? i.id === id : i === id))) {
                    savedItems.push({ id, title, org, date, location, type, link, image });
                }
            }
            localStorage.setItem('opporhub_saved', JSON.stringify(savedItems));
            setIsSaved(!isSaved);
        } catch (err) {
            console.error("Failed to save to localStorage", err);
        }
    };

    const handleAddToCal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Generate Google Calendar Link
        const text = encodeURIComponent(title || "OpportunityHub Event");
        const details = encodeURIComponent(`Link: ${link || "Not provided"}\nOrganization: ${org || "Not provided"}`);
        const loc = encodeURIComponent(location || "Remote");
        
        // Use a generic date if none is perfectly parsable, otherwise try to parse
        let dates = "";
        try {
            // Attempt to parse 'Rolling' or 'Oct 24, 2026' into a valid Date
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                const start = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
                // Add 1 hour for end time
                d.setHours(d.getHours() + 1);
                const end = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
                dates = `&dates=${start}/${end}`;
            } else {
                // Fallback date: Tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const start = tomorrow.toISOString().replace(/-|:|\.\d\d\d/g, "");
                tomorrow.setHours(tomorrow.getHours() + 1);
                const end = tomorrow.toISOString().replace(/-|:|\.\d\d\d/g, "");
                dates = `&dates=${start}/${end}`;
            }
        } catch (err) {
            console.error(err);
        }

        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${loc}${dates}`;
        
        window.open(calUrl, '_blank');
        setIsAddedToCal(true);
    };

    const { user } = useAuth();
    const navigate = useNavigate();

    const handleApply = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/signin');
            return;
        }

        if (applyStatus === 'success' || applyStatus === 'error') return;

        try {
            setIsApplying(true);
            await registerForEvent(id);
            setApplyStatus('success');
        } catch (err) {
            console.error('Registration failed:', err);
            const message = err.response?.data?.message || '';
            if (message.toLowerCase().includes('already registered')) {
                setApplyStatus('success'); // Treat as success if already done
            } else {
                setApplyStatus('error');
            }
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
                    className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center border transition-all shadow-lg group ${isSaved ? 'bg-primary/90 border-primary shadow-[0_0_15px_rgba(138,154,91,0.5)]' : 'bg-black/40 border-white/10 hover:bg-black/60'}`}
                    title={isSaved ? "Saved" : "Save for Later"}
                >
                    {isSaved ? <BookmarkCheck size={16} className="text-white" /> : <Bookmark size={16} className="text-white group-hover:text-primary transition-colors" />}
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

                {/* "Outcome" Badge for Workshops */}
                {type === 'workshop' && outcomes && outcomes.length > 0 && (
                    <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-amber-500 text-sm">🚀</span>
                        <div>
                            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Outcome</p>
                            <p className="text-sm font-semibold text-text-main leading-tight">
                                {outcomes.join(', ')}
                            </p>
                        </div>
                    </div>
                )}

                {/* "Why should I attend?" Hook for Events */}
                {type !== 'workshop' && perks && perks.length > 0 && (
                    <div className="mb-4 bg-terracotta/10 border border-terracotta/20 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-terracotta text-sm">💡</span>
                        <div>
                            <p className="text-[11px] font-bold text-terracotta uppercase tracking-wider mb-0.5">Why Attend?</p>
                            <p className="text-sm font-semibold text-text-main leading-tight">
                                {perks.join(' + ')}
                            </p>
                        </div>
                    </div>
                )}

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

                    <div className="grid grid-cols-2 gap-3">
                        <a 
                            href={link || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm bg-surface border border-white/10 hover:bg-white/5 text-text-main"
                        >
                            View Details <ExternalLink size={14} />
                        </a>
                        <button 
                            onClick={handleApply}
                            disabled={isApplying || applyStatus === 'success'}
                            className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                                applyStatus === 'success' 
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                                : applyStatus === 'error'
                                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                                : 'bg-primary hover:bg-primary-hover text-white'
                            }`}
                        >
                            {isApplying ? 'Processing...' : applyStatus === 'success' ? 'Applied ✨' : applyStatus === 'error' ? 'Already Applied' : 'Mark Applied'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpportunityCard;
