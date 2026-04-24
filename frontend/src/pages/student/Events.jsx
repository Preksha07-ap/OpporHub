import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import OpportunityCard from '../../components/ui/OpportunityCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { Filter, Loader2, AlertCircle, ChevronDown, Zap, MapPin, Trophy, Sparkles } from 'lucide-react';
import { getEvents } from '../../api/eventService';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_OPTIONS = {
    type: ['All', 'Hackathon', 'Tech Talk', 'Meetup', 'Webinar', 'College Fest', 'Startup Event'],
    location: ['All India', 'Bangalore', 'Delhi', 'Mumbai', 'Remote'],
    time: ['All', 'Today', 'This Week', 'Upcoming'],
    mode: ['All', 'Online', 'Offline', 'Hybrid'],
    perks: ['All', 'Cash Prize', 'Certificate', 'Networking', 'Swag'],
    participationType: ['All', 'Solo', 'Team'],
    duration: ['All', 'Few hours', '1 day', 'Multi-day']
};

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Multi-dimensional Filter State
    const [filters, setFilters] = useState({
        type: 'All',
        location: 'All India',
        time: 'All',
        mode: 'All',
        perks: 'All',
        participationType: 'All',
        duration: 'All'
    });
    
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
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
                // We define Events as anything that fits these short-term specific types
                const validTypes = ['hackathon', 'tech talk', 'meetup', 'webinar', 'college fest', 'startup event'];
                const eventSectionData = data.filter(e => e.type && validTypes.includes(e.type.toLowerCase()));
                setEvents(eventSectionData);
            } catch (err) {
                setError('Failed to fetch events from the server.');
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
            perks: event.perks || []
        };
    };

    // Derived State for Smart Sections vs Filtered List
    const isFiltering = Object.values(filters).some(val => val !== 'All' && val !== 'All India');

    const filteredEvents = useMemo(() => {
        return events.filter(ev => {
            // 1. Type
            if (filters.type !== 'All' && ev.type !== filters.type) return false;
            
            // 2. Location Match
            const locText = `${ev.location || ''} ${ev.city || ''} ${ev.state || ''}`.toLowerCase();
            if (filters.location !== 'All India' && !locText.includes(filters.location.toLowerCase())) return false;

            // 3. Mode Match
            let mappedMode = filters.mode;
            if (filters.mode === 'Offline') mappedMode = 'In-Person';
            if (filters.mode !== 'All' && ev.format !== mappedMode) return false;

            // 4. Perks Match
            if (filters.perks !== 'All') {
                if (!ev.perks || !ev.perks.some(p => p.toLowerCase() === filters.perks.toLowerCase())) return false;
            }

            // 5. Participation & Duration Match
            if (filters.participationType !== 'All' && ev.participationType !== filters.participationType && ev.participationType !== 'Both') return false;
            if (filters.duration !== 'All' && ev.duration !== filters.duration) return false;

            // 6. Time Match
            if (filters.time !== 'All' && ev.startDate) {
                const eventDate = new Date(ev.startDate);
                const now = new Date();
                if (filters.time === 'Today') {
                    if (eventDate.toDateString() !== now.toDateString()) return false;
                } else if (filters.time === 'This Week') {
                    const nextWeek = new Date(now);
                    nextWeek.setDate(now.getDate() + 7);
                    if (eventDate < now || eventDate > nextWeek) return false;
                } else if (filters.time === 'Upcoming') {
                    if (eventDate < now) return false;
                }
            }
            
            // 7. Global Search Match (from URL query)
            if (query) {
                const searchLower = query.toLowerCase();
                const matchesTitle = ev.title?.toLowerCase().includes(searchLower);
                const matchesOrg = ev.organizerId?.name?.toLowerCase().includes(searchLower) || ev.org?.toLowerCase().includes(searchLower);
                const matchesTags = ev.tags?.some(tag => tag.toLowerCase().includes(searchLower));
                if (!matchesTitle && !matchesOrg && !matchesTags) return false;
            }

            return true;
        });
    }, [events, filters, query]);

    const smartSections = useMemo(() => {
        if (isFiltering || query) return null;
        
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const usedIds = new Set();

        const happeningThisWeek = events.filter(e => {
            if (!e.startDate) return false;
            const d = new Date(e.startDate);
            const isThisWeek = d >= now && d <= nextWeek;
            if (isThisWeek && !usedIds.has(e._id)) {
                usedIds.add(e._id);
                return true;
            }
            return false;
        }).slice(0, 4);
        
        const highReward = events.filter(e => {
            const isReward = e.perks && e.perks.some(p => p.toLowerCase().includes('cash'));
            if (isReward && !usedIds.has(e._id)) {
                usedIds.add(e._id);
                return true;
            }
            return false;
        }).slice(0, 4);
        
        const newlyAdded = [...events]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .filter(e => {
                if (!usedIds.has(e._id)) {
                    usedIds.add(e._id);
                    return true;
                }
                return false;
            }).slice(0, 4);

        return { happeningThisWeek, highReward, newlyAdded };
    }, [events, isFiltering]);

    const FilterDropdown = ({ title, category }) => {
        const isOpen = activeDropdown === category;
        const currentVal = filters[category];
        const isModified = category === 'location' ? currentVal !== 'All India' : currentVal !== 'All';

        return (
            <div className="relative">
                <button
                    onClick={() => setActiveDropdown(isOpen ? null : category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        isModified 
                            ? 'bg-terracotta/20 border-terracotta text-terracotta shadow-sm' 
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
                                            ? 'bg-terracotta text-white font-bold'
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
                <div className="clay-card border border-terracotta/20 rounded-3xl p-8 flex flex-col items-start gap-6 relative overflow-hidden bg-bg-card">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/10 rounded-full blur-[80px]" />
                    <div className="relative z-10 w-full">
                        <h1 className="text-4xl font-heading font-bold text-text-main mb-4 flex items-center gap-3">
                            <Sparkles className="text-terracotta" /> Discover Events
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
                            Short-term, engaging, community-driven, or competitive activities. Find your next hackathon, local meetup, or startup pitch event.
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
                    
                    <FilterDropdown title="Type" category="type" />
                    <FilterDropdown title="Location" category="location" />
                    <FilterDropdown title="Time" category="time" />
                    <FilterDropdown title="Mode" category="mode" />
                    <FilterDropdown title="Perks" category="perks" />
                    <FilterDropdown title="Team" category="participationType" />
                    <FilterDropdown title="Duration" category="duration" />
                    
                    {isFiltering && (
                        <button
                            onClick={() => setFilters({ type: 'All', location: 'All India', time: 'All', mode: 'All', perks: 'All', participationType: 'All', duration: 'All' })}
                            className="text-xs font-bold text-text-muted hover:text-white transition-colors underline ml-2"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
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
                            {filteredEvents.length === 0 ? (
                                <div className="text-center py-20 text-text-muted bg-white/5 rounded-2xl border border-white/5">
                                    <h3 className="text-2xl font-bold mb-2">No events match your criteria</h3>
                                    <p>Try clearing some filters or expanding your search scope!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredEvents.map(event => (
                                        <OpportunityCard key={event._id} {...mapEventProps(event)} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                // --- SMART SECTIONS VIEW ---
                <div className="space-y-16 mb-16">
                    
                    {smartSections.happeningThisWeek.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Zap className="text-amber-400" /> Happening This Week
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {smartSections.happeningThisWeek.map(event => (
                                    <OpportunityCard key={event._id} {...mapEventProps(event)} />
                                ))}
                            </div>
                        </section>
                    )}

                    {smartSections.highReward.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Trophy className="text-emerald-400" /> High Reward Events
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {smartSections.highReward.map(event => (
                                    <OpportunityCard key={event._id} {...mapEventProps(event)} />
                                ))}
                            </div>
                        </section>
                    )}

                    {smartSections.newlyAdded.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Sparkles className="text-blue-400" /> Newly Added
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {smartSections.newlyAdded.map(event => (
                                    <OpportunityCard key={event._id} {...mapEventProps(event)} />
                                ))}
                            </div>
                        </section>
                    )}

                    {events.length === 0 && (
                        <div className="text-center py-20 text-text-muted">
                            <h3 className="text-2xl font-bold mb-2">No events available</h3>
                            <p>Check back later or ensure the crawler is running!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Events;
