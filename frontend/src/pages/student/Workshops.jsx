import React, { useState, useEffect, useMemo, useRef } from 'react';
import OpportunityCard from '../../components/ui/OpportunityCard';
import { Filter, Loader2, AlertCircle, ChevronDown, Hammer, Clock, Baby, Sparkles } from 'lucide-react';
import { getEvents } from '../../api/eventService';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_OPTIONS = {
    domain: ['All', 'AI / ML', 'Web Dev', 'App Dev', 'Cloud / DevOps', 'Cybersecurity', 'UI/UX'],
    skillLevel: ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    format: ['All', 'Hands-on', 'Project-based', 'Bootcamp'],
    duration: ['All', 'Few hours', 'Half-day', 'Full-day', 'Multi-day'],
    mode: ['All', 'Online', 'Offline', 'Hybrid'],
    pricing: ['All', 'Free', 'Paid']
};

const Workshops = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Multi-dimensional Filter State
    const [filters, setFilters] = useState({
        domain: 'All',
        skillLevel: 'All',
        format: 'All',
        duration: 'All',
        mode: 'All',
        pricing: 'All'
    });
    
    const [activeDropdown, setActiveDropdown] = useState(null);
    const filterBarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                // Filter strictly for workshops
                const workshopsData = data.filter(e => e.type && e.type.toLowerCase() === 'workshop');
                setEvents(workshopsData);
            } catch (err) {
                setError('Failed to fetch workshops from the server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Helper to map DB object to Component Props
    const mapEventProps = (event) => {
        let formattedDate = 'TBD';
        if (event.startDate) {
            formattedDate = new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return {
            id: event._id,
            title: event.title,
            org: event.organizerId?.name || 'Unknown Organizer',
            date: formattedDate,
            location: event.location,
            tags: event.tags || [],
            type: event.type,
            image: event.coverImage,
            link: event.link,
            outcomes: event.outcomes || [],
            perks: event.perks || []
        };
    };

    // Derived State for Smart Sections vs Filtered List
    const isFiltering = Object.values(filters).some(val => val !== 'All');

    const filteredWorkshops = useMemo(() => {
        return events.filter(ev => {
            // 1. Domain (mapped from tags)
            if (filters.domain !== 'All') {
                const domainKeyword = filters.domain.split('/')[0].trim().toLowerCase();
                const matchDomain = ev.tags && ev.tags.some(tag => tag.toLowerCase().includes(domainKeyword));
                if (!matchDomain) return false;
            }
            
            // 2. Skill Level
            if (filters.skillLevel !== 'All' && ev.skillLevel !== filters.skillLevel) return false;

            // 3. Format
            if (filters.format !== 'All' && ev.workshopFormat !== filters.format) return false;

            // 4. Duration
            if (filters.duration !== 'All' && ev.duration !== filters.duration) return false;

            // 5. Mode Match
            let mappedMode = filters.mode;
            if (filters.mode === 'Offline') mappedMode = 'In-Person';
            if (filters.mode !== 'All' && ev.format !== mappedMode) return false;

            // 6. Pricing Match
            if (filters.pricing !== 'All' && ev.pricing !== filters.pricing) return false;

            return true;
        });
    }, [events, filters]);

    // Smart Sections Data (Only calculate if NOT filtering)
    const smartSections = useMemo(() => {
        if (isFiltering) return null;
        
        const now = new Date();
        const next48Hours = new Date(now);
        next48Hours.setHours(now.getHours() + 48);

        const usedIds = new Set();

        const buildToday = events.filter(e => {
            if (e.workshopFormat === 'Project-based' && !usedIds.has(e._id)) {
                usedIds.add(e._id);
                return true;
            }
            return false;
        }).slice(0, 4);
        
        const startingSoon = events.filter(e => {
            if (!e.startDate) return false;
            const d = new Date(e.startDate);
            if (d >= now && d <= next48Hours && !usedIds.has(e._id)) {
                usedIds.add(e._id);
                return true;
            }
            return false;
        }).slice(0, 4);

        const beginnerFriendly = events.filter(e => {
            if (e.skillLevel === 'Beginner' && !usedIds.has(e._id)) {
                usedIds.add(e._id);
                return true;
            }
            return false;
        }).slice(0, 4);
        
        const recentlyAdded = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(e => {
            if (!usedIds.has(e._id)) {
                usedIds.add(e._id);
                return true;
            }
            return false;
        }).slice(0, 4);

        return { buildToday, startingSoon, beginnerFriendly, recentlyAdded };
    }, [events, isFiltering]);

    const FilterDropdown = ({ title, category }) => {
        const isOpen = activeDropdown === category;
        const currentVal = filters[category];
        const isModified = currentVal !== 'All';

        return (
            <div className="relative">
                <button
                    onClick={() => setActiveDropdown(isOpen ? null : category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        isModified 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-sm' 
                            : 'bg-black/40 border-white/10 text-text-muted hover:text-text-main hover:bg-white/5 backdrop-blur-sm'
                    }`}
                >
                    {isModified ? currentVal : title}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-[#0a0f0a] backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden z-[100] py-1"
                        >
                            {FILTER_OPTIONS[category].map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setFilters(prev => ({ ...prev, [category]: option }));
                                        setActiveDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                        filters[category] === option
                                            ? 'bg-amber-500 text-white font-bold'
                                            : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-[80vh]">

            <div className="mb-8">
                <div className="clay-card border border-amber-500/20 rounded-3xl p-8 flex flex-col items-start gap-6 relative overflow-hidden bg-bg-card">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
                    <div className="relative z-10 w-full">
                        <h1 className="text-4xl font-heading font-bold text-text-main mb-4 flex items-center gap-3">
                            <Hammer className="text-amber-500" /> Hands-On Workshops
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
                            Bridge the gap between interest and real skill. Build projects, deploy apps, and earn certificates in intensive learning sessions.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-12 relative z-[100]" ref={filterBarRef}>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-text-muted bg-white/5 p-2 rounded-xl border border-white/10">
                        <Filter size={18} />
                        <span className="text-sm font-bold mr-2 hidden md:inline">Filters:</span>
                    </div>
                    
                    <FilterDropdown title="Domain" category="domain" />
                    <FilterDropdown title="Skill Level" category="skillLevel" />
                    <FilterDropdown title="Format" category="format" />
                    <FilterDropdown title="Duration" category="duration" />
                    <FilterDropdown title="Mode" category="mode" />
                    <FilterDropdown title="Pricing" category="pricing" />
                    
                    {isFiltering && (
                        <button
                            onClick={() => setFilters({ domain: 'All', skillLevel: 'All', format: 'All', duration: 'All', mode: 'All', pricing: 'All' })}
                            className="text-xs font-bold text-text-muted hover:text-white transition-colors underline ml-2"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-amber-500">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="text-text-muted font-medium">Loading hands-on sessions...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col items-center justify-center text-center">
                    <AlertCircle size={48} className="mb-4" />
                    <h3 className="text-xl font-bold mb-2">Oops!</h3>
                    <p>{error}</p>
                </div>
            ) : isFiltering ? (
                // --- FILTERED GRID VIEW ---
                <div className="mb-16">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={JSON.stringify(filters)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filteredWorkshops.length === 0 ? (
                                <div className="text-center py-20 text-text-muted bg-white/5 rounded-2xl border border-white/5">
                                    <h3 className="text-2xl font-bold mb-2">No workshops match your criteria</h3>
                                    <p>Try clearing some filters or expanding your search scope!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredWorkshops.map(shop => (
                                        <OpportunityCard key={shop._id} {...mapEventProps(shop)} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                // --- SMART SECTIONS VIEW ---
                <div className="space-y-16 mb-16">
                    
                    {smartSections.buildToday.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Hammer className="text-amber-500" /> Build Something Today
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {smartSections.buildToday.map(shop => (
                                    <OpportunityCard key={shop._id} {...mapEventProps(shop)} />
                                ))}
                            </div>
                        </section>
                    )}

                    {smartSections.startingSoon.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Clock className="text-blue-400" /> Starting Soon
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {smartSections.startingSoon.map(shop => (
                                    <OpportunityCard key={shop._id} {...mapEventProps(shop)} />
                                ))}
                            </div>
                        </section>
                    )}

                    {smartSections.beginnerFriendly.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Baby className="text-emerald-400" /> Beginner Friendly
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {smartSections.beginnerFriendly.map(shop => (
                                    <OpportunityCard key={shop._id} {...mapEventProps(shop)} />
                                ))}
                            </div>
                        </section>
                    )}

                    {smartSections.recentlyAdded.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Sparkles className="text-purple-400" /> Recently Added
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {smartSections.recentlyAdded.map(shop => (
                                    <OpportunityCard key={shop._id} {...mapEventProps(shop)} />
                                ))}
                            </div>
                        </section>
                    )}

                    {events.length === 0 && (
                        <div className="text-center py-20 text-text-muted">
                            <h3 className="text-2xl font-bold mb-2">No workshops available</h3>
                            <p>Check back later or ensure the crawler is running!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Workshops;
