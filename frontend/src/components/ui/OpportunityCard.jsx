import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerForEvent } from '../../api/registrationService';
import { trackEvent } from '../../api/eventService';
import { Calendar, MapPin, ExternalLink, Clock, Bookmark, BookmarkCheck, CalendarPlus, Check, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
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
    outcomes = [],
    engagement, // new prop
    showDemographics = true
}) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isAddedToCal, setIsAddedToCal] = useState(false);
    
    // Simulate live interest if no real data exists
    // Fallback to a seeded number based on the ID if engagement is missing
    const seed = id ? (parseInt(id.toString().substring(0, 8), 16) % 40) + 10 : 15;
    const liveInterest = (engagement?.clicks || 0) + (engagement?.baseInterest || seed);

    // Logic for "Popular Among" demographic
    const getTopYear = () => {
        const demo = engagement?.demographics;
        if (!demo) return (id ? (parseInt(id.toString().slice(-3), 16) % 4) + 1 : 2);
        
        // Check real data first
        const years = [demo.year1, demo.year2, demo.year3, demo.year4];
        const max = Math.max(...years);
        if (max > 0) return years.indexOf(max) + 1;
        
        // Fallback to seed
        return demo.topYearSeed || 2;
    };
    const topYear = getTopYear();

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

    const { user, registrations, fetchUserRegistrations } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Track a 'view' when the card appears
        if (id) trackEvent(id, 'view', user?.profileData?.year).catch(() => {});
        
        // Check if already registered in global state
        if (registrations && registrations.length > 0) {
            const isReg = registrations.some(r => r.eventId?._id === id || r.eventId === id);
            if (isReg) setApplyStatus('success');
        }
    }, [id, user, registrations]);

    const handleApply = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // 1. Track the engagement click immediately
        if (id) trackEvent(id, 'click', user?.profileData?.year).catch(() => {});

        // 2. Auth Check
        if (!user) {
            navigate('/signin');
            return;
        }

        if (applyStatus === 'success' || applyStatus === 'error') {
            if (link) window.open(link, '_blank');
            return;
        }

        try {
            setIsApplying(true);
            // 3. Register internally if it's an internal event
            await registerForEvent(id);
            setApplyStatus('success');
            
            // 4. Update global registration state
            fetchUserRegistrations();
            
            // 5. Open external link if provided
            if (link) window.open(link, '_blank');
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
        <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17, mass: 1 }}
            className="clay-card group flex flex-col h-full overflow-hidden relative bg-bg-card transition-colors duration-500 hover:border-emerald-500/50"
        >
            {/* Localized Radial Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
                 style={{ 
                    background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' 
                 }} 
            />

            {/* Image Header with Clay cutout effect */}
            <div className="h-44 relative overflow-hidden m-2 rounded-[2rem] clay-inset z-10">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center opacity-30 ${getTypeStyles()}`}>
                        <span className="text-5xl font-heading font-bold opacity-40">{title[0]}</span>
                    </div>
                )}

                {/* Trending Badge (Social Proof) */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 items-end">
                    <div className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse-skeleton">
                        <Users size={12} className="text-black" />
                        <span className="text-[10px] font-black text-black uppercase tracking-tighter">
                            {liveInterest} INTERESTED
                        </span>
                    </div>
                    
                    {showDemographics && (
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                                Popular among {topYear}{topYear === 1 ? 'st' : topYear === 2 ? 'nd' : topYear === 3 ? 'rd' : 'th'} years
                            </span>
                        </div>
                    )}
                </div>

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
        </motion.div>
    );
};

export default OpportunityCard;
