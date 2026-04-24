import React, { useState, useEffect, useMemo, useRef } from 'react';
import OpportunityCard from '../../components/ui/OpportunityCard';
import { Filter, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { getEvents } from '../../api/eventService';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_OPTIONS = {
    location: ['All India', 'Karnataka', 'Maharashtra', 'Bangalore', 'Delhi', 'Remote'],
    time: ['All', 'Today', 'This Week', 'This Month', 'Upcoming'],
    mode: ['All', 'Online', 'Offline', 'Hybrid'],
    domain: ['All', 'AI / ML', 'Web Development', 'Cloud / DevOps', 'Cybersecurity', 'Blockchain']
};

const Conferences = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Advanced Multi-dimensional Filter State
    const [filters, setFilters] = useState({
        location: 'All India',
        time: 'All',
        mode: 'All',
        domain: 'All'
    });
    
    // UI State for custom dropdowns
    const [activeDropdown, setActiveDropdown] = useState(null);
    const filterBarRef = useRef(null);

    // Close dropdowns if clicked outside
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
                // Filter the live DB for only conferences
                const liveConfs = data.filter(e => e.type && e.type.toLowerCase() === 'conference');
                setEvents(liveConfs);
            } catch (err) {
                setError('Failed to fetch local database conferences.');
                console.error(err);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Multi-Dimensional Filter Engine
    const filteredConferences = useMemo(() => {
        return events.filter(conf => {
            // 1. Location Match
            const locText = `${conf.location || ''} ${conf.city || ''} ${conf.state || ''}`.toLowerCase();
            const matchLocation = filters.location === 'All India' || locText.includes(filters.location.toLowerCase());

            // 2. Mode Match
            let mappedMode = filters.mode;
            if (filters.mode === 'Offline') mappedMode = 'In-Person';
            const matchMode = filters.mode === 'All' || conf.format === mappedMode;

            // 3. Domain Match
            // Split "AI / ML" to "AI", "Cloud / DevOps" to "Cloud" for better tag matching
            const domainKeyword = filters.domain.split('/')[0].trim().toLowerCase();
            const matchDomain = filters.domain === 'All' || 
                (conf.tags && conf.tags.some(tag => tag.toLowerCase().includes(domainKeyword)));

            // 4. Time Match
            let matchTime = true;
            if (filters.time !== 'All' && conf.startDate) {
                const eventDate = new Date(conf.startDate);
                const now = new Date();
                
                if (filters.time === 'Today') {
                    matchTime = eventDate.toDateString() === now.toDateString();
                } else if (filters.time === 'This Week') {
                    const nextWeek = new Date(now);
                    nextWeek.setDate(now.getDate() + 7);
                    matchTime = eventDate >= now && eventDate <= nextWeek;
                } else if (filters.time === 'This Month') {
                    matchTime = eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
                } else if (filters.time === 'Upcoming') {
                    matchTime = eventDate >= now;
                }
            }

            return matchLocation && matchMode && matchDomain && matchTime;
        });
    }, [events, filters]);

    const mapEventProps = (event) => {
        const dateString = event.startDate;
        let formattedDate = 'TBD';
        
        if (dateString) {
            if (typeof dateString === 'string' && dateString.includes('T')) {
                formattedDate = new Date(dateString).toLocaleDateString();
            } else {
                formattedDate = dateString; 
            }
        }

        return {
            id: event._id,
            title: event.title,
            org: event.organizerId?.name || 'Unknown Organizer',
            date: formattedDate,
            location: event.location,
            tags: event.tags || [],
            type: event.type || 'Conference',
            image: event.coverImage,
            link: event.link,
            engagement: event.engagement
        };
    };

    // Helper to render dropdown filters
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
                            ? 'bg-primary/20 border-primary text-primary shadow-sm' 
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
                                            ? 'bg-primary text-white font-bold'
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

            {/* Glowing UI Header Card */}
            <div className="mb-8">
                <div className="clay-card border border-primary/20 rounded-3xl p-8 flex flex-col items-start gap-6 relative overflow-hidden bg-bg-card">
                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 w-full">
                        <h1 className="text-4xl font-heading font-bold text-text-main mb-4">Tech Conferences</h1>
                        <p className="text-text-muted text-lg max-w-xl leading-relaxed">
                            Discover high-quality conferences, meetups, and workshops powered by our curated discovery pipeline.
                        </p>
                    </div>
                </div>
            </div>

            {/* Robust Filter Bar */}
            <div className="mb-12 relative z-[100]" ref={filterBarRef}>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-text-muted bg-white/5 p-2 rounded-xl border border-white/10">
                        <Filter size={18} />
                        <span className="text-sm font-bold mr-2 hidden md:inline">Filters:</span>
                    </div>
                    
                    <FilterDropdown title="Location" category="location" />
                    <FilterDropdown title="Domain / Tech" category="domain" />
                    <FilterDropdown title="Format" category="mode" />
                    <FilterDropdown title="Timeframe" category="time" />
                    
                    {/* Clear Filters Button */}
                    {(filters.location !== 'All India' || filters.domain !== 'All' || filters.mode !== 'All' || filters.time !== 'All') && (
                        <button
                            onClick={() => setFilters({ location: 'All India', time: 'All', mode: 'All', domain: 'All' })}
                            className="text-xs font-bold text-text-muted hover:text-white transition-colors underline ml-2"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-primary">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="text-text-muted font-medium">Brewing the best tech hubs...</p>
                </div>
            ) : error && events.length === 0 ? (
                <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col items-center justify-center text-center">
                    <AlertCircle size={48} className="mb-4" />
                    <h3 className="text-xl font-bold mb-2">Oops!</h3>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="mb-16">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={JSON.stringify(filters)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filteredConferences.length === 0 ? (
                                <div className="text-center py-20 text-text-muted bg-white/5 rounded-2xl border border-white/5">
                                    <h3 className="text-2xl font-bold mb-2">No conferences match your filters</h3>
                                    <p>Try clearing some filters or expanding your search!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredConferences.map(conf => (
                                        <OpportunityCard key={conf._id} {...mapEventProps(conf)} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Conferences;
