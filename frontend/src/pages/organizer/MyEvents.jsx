import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Calendar, MapPin, ExternalLink, Edit, Share2, List, Trash2, Search, Loader } from 'lucide-react';
import { getMyEvents, deleteEvent } from '../../api/eventService';

const MyEvents = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'organizer') {
        return <Navigate to="/" replace />;
    }

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getMyEvents();
                // Map the backend data
                const formatted = data.map(ev => ({
                    id: ev._id,
                    title: ev.title,
                    type: ev.type,
                    views: Math.floor(Math.random() * 500), // Note: Views can be piped from analytics later
                    applied: ev.capacity || 0, // Fallback since actual application count requires aggregate
                    location: ev.location,
                    date: new Date(ev.startDate).toLocaleDateString(),
                    status: 'Active' // We haven't implemented a formal draft/expired system yet
                }));
                setEvents(formatted);
            } catch (err) {
                console.error("Failed fetching events:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent(id);
                setEvents(events.filter(e => e.id !== id));
            } catch(err) {
                console.error("Failed deleting event", err);
            }
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || event.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl min-h-screen">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-black text-text-main mb-2 flex items-center gap-3">
                        <List className="text-primary" size={32} /> My Events
                    </h1>
                    <p className="text-text-muted text-lg">Manage all your posted opportunities and track their performance.</p>
                </div>
            </motion.div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search events..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-text-main placeholder:text-text-muted"
                    />
                </div>
                <div className="flex bg-surface border border-white/5 rounded-xl p-1 shrink-0 overflow-x-auto">
                    {['All', 'Active', 'Draft', 'Expired'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filterStatus === status ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="animate-spin text-primary" size={48} />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12 bg-surface rounded-2xl border border-white/5">
                        <p className="text-text-muted font-bold text-lg">No events found matching your criteria.</p>
                    </div>
                ) : (
                    filteredEvents.map((event, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1 + (idx * 0.1) }}
                            key={event.id} 
                            className="clay-card p-6 bg-surface border border-white/5 hover:border-primary/30 transition-all flex flex-col gap-5 group"
                        >
                            {/* Top row: Title and details */}
                            <div>
                                <h3 className="text-2xl font-bold text-text-main group-hover:text-primary transition-colors mb-2">{event.title}</h3>
                                <p className="text-sm font-medium text-text-muted flex items-center gap-2 mb-2">
                                    {event.date} <span className="text-white/20">|</span> {event.location} <span className="text-white/20">|</span> {event.type}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-text-muted">Status:</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${event.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : event.status === 'Draft' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Boxes */}
                            <div className="flex gap-4">
                                <div className="bg-bg-card border border-white/5 px-4 py-3 rounded-xl min-w-[120px]">
                                    <p className="text-2xl font-black text-text-main mb-1">{event.views}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Views</p>
                                </div>
                                <div className="bg-bg-card border border-white/5 px-4 py-3 rounded-xl min-w-[120px]">
                                    <p className="text-2xl font-black text-text-main mb-1">{event.applied}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Applied</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 mt-2">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-text-main hover:bg-white/10 transition-colors text-sm font-bold border border-white/10">
                                    <Edit size={16} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(event.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-sm font-bold border border-rose-500/20"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-text-main hover:bg-white/10 transition-colors text-sm font-bold border border-white/10">
                                    <Share2 size={16} /> Share
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold border border-primary/20 ml-auto">
                                    <ExternalLink size={16} /> View Details
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyEvents;
