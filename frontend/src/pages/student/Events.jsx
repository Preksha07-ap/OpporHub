import React, { useState, useEffect } from 'react';
import OpportunityCard from '../../components/ui/OpportunityCard';
import { Filter, Loader2, AlertCircle } from 'lucide-react';
import { getEvents } from '../../api/eventService';

const Events = () => {
    const [filterDomain, setFilterDomain] = useState('All');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data);
            } catch (err) {
                setError('Failed to fetch events from the server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = filterDomain === 'All'
        ? events
        : events.filter(event => event.type && event.type.toLowerCase() === filterDomain.toLowerCase());

    const mapEventProps = (event) => {
        // Safe formatting for dates
        const startDate = new Date(event.startDate).toLocaleDateString();
        
        return {
            id: event._id,
            title: event.title,
            org: event.organizerId?.name || 'Unknown Organizer',
            date: startDate,
            location: event.location,
            tags: event.tags || [],
            type: event.type,
            image: event.coverImage,
            domain: event.type,
            link: event.link
        };
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-text-main mb-2">Tech Events</h1>
                    <p className="text-text-muted text-lg">Build, compete, and participate in hackathons, ideathons, and expos.</p>
                </div>

                <div className="flex items-center gap-2 bg-bg-card p-1.5 rounded-2xl border border-white/5 shadow-sm overflow-x-auto">
                    <div className="px-3 text-text-muted">
                        <Filter size={18} />
                    </div>
                    {['All', 'Hackathon', 'Conference', 'Workshop'].map(domain => (
                        <button
                            key={domain}
                            onClick={() => setFilterDomain(domain)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filterDomain === domain
                                ? 'bg-primary text-white shadow-md'
                                : 'text-text-muted hover:text-text-main hover:bg-white/5'
                                }`}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-primary">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="text-text-muted font-medium">Fetching global events...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col items-center justify-center text-center">
                    <AlertCircle size={48} className="mb-4" />
                    <h3 className="text-xl font-bold mb-2">Oops!</h3>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-20 text-text-muted">
                            <h3 className="text-2xl font-bold mb-2">No events found</h3>
                            <p>Try adjusting your category filter, or check back later!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredEvents.map(event => (
                                <OpportunityCard key={event._id} {...mapEventProps(event)} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Events;
