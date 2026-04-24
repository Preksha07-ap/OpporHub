import React, { useState, useEffect, useMemo } from 'react';
import OpportunityCard from '../../components/ui/OpportunityCard';
import { Loader2, AlertCircle, Filter, ChevronDown } from 'lucide-react';
import { getEvents } from '../../api/eventService';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_OPTIONS = {
    type: ['All', 'GitHub Issues', 'Open Source Programs']
};

const Contributions = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        type: 'All'
    });
    
    const [activeDropdown, setActiveDropdown] = useState(null);
    const filterBarRef = React.useRef(null);

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
                const programs = data.filter(e => e.type && (e.type.toLowerCase() === 'open source' || e.type.toLowerCase() === 'contribution'));
                setEvents(programs);
            } catch (err) {
                setError('Failed to fetch open source programs from the server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const mapEventProps = (event) => {
        const dateString = event.startDate;
        let formattedDate = 'Rolling';
        
        if (dateString) {
            if (typeof dateString === 'string' && dateString.includes('T')) {
                formattedDate = new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } else {
                formattedDate = dateString;
            }
        }

        return {
            id: event._id,
            title: event.title,
            org: event.organizerId?.name || 'Unknown Organizer',
            date: formattedDate,
            location: event.location || 'Remote',
            tags: event.tags || [],
            type: 'contribution',
            image: event.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80',
            link: event.link
        };
    };

    const isFiltering = Object.values(filters).some(val => val !== 'All');

    const filteredData = useMemo(() => {
        return events.filter(ev => {
            const tags = (ev.tags || []).map(t => t.toLowerCase());
            const link = (ev.link || '').toLowerCase();
            
            if (filters.type === 'GitHub Issues') {
                const isGithub = link.includes('github.com') || tags.includes('good first issue') || tags.includes('good first issues') || tags.includes('contribution');
                if (!isGithub) return false;
            }

            if (filters.type === 'Open Source Programs') {
                const isProgram = tags.includes('fellowship') || tags.includes('mentorship') || (!link.includes('github.com') && tags.includes('open source'));
                if (!isProgram) return false;
            }

            return true;
        });
    }, [events, filters]);

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
            <div className="mb-12">
                <div className="clay-card border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden bg-bg-card">
                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 w-full">
                        <h1 className="text-4xl font-heading font-bold text-text-main mb-4">Open Source Contributions</h1>
                        <p className="text-text-muted text-lg max-w-xl leading-relaxed mb-8">
                            Start small by tackling realtime "Good First Issues", or explore massive tier-1 official programs offering direct stipends and full-time outcomes!
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
                    
                    {isFiltering && (
                        <button
                            onClick={() => setFilters({ type: 'All' })}
                            className="text-xs font-bold text-text-muted hover:text-white transition-colors underline ml-2"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-primary">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="text-text-muted font-medium">Fetching realtime open source opportunities...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col items-center justify-center text-center mb-16">
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
                            {filteredData.length === 0 ? (
                                <div className="text-center py-20 text-text-muted bg-white/5 rounded-2xl border border-white/5">
                                    <h3 className="text-2xl font-bold mb-2">No opportunities found</h3>
                                    <p>Check back later or adjust your filters!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredData.map(prog => (
                                        <OpportunityCard key={prog._id} {...mapEventProps(prog)} />
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

export default Contributions;
