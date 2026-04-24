import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getPendingEvents, approveEvent, rejectEvent } from '../../api/eventService';
import { Building2, Calendar, MapPin, Check, X, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { role } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const data = await getPendingEvents();
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending events');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveEvent(id);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEvent(id);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-text-muted"><Clock className="animate-spin mr-2" /> Loading queue...</div>;
  if (error) return <div className="text-rose-400 text-center py-20 bg-rose-500/10 rounded-2xl border border-rose-500/20">{error}</div>;

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pt-24 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-main to-text-muted mb-2">
            Founder Approval Queue
          </h1>
          <p className="text-text-muted">Review automatically scraped events before they go live.</p>
        </div>
        <div className="clay-card px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold text-text-main">{events.length} Pending</span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
            {events.length === 0 ? (
                <div className="clay-card p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <Check className="text-sage" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-text-main mb-2">Queue is empty!</h3>
                    <p className="text-text-muted">All scraped events have been reviewed.</p>
                </div>
            ) : (
                events.map((event) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={event._id} 
                        className="clay-card p-6 flex flex-col md:flex-row gap-6 relative group overflow-hidden border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/20">
                                            {event.type}
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 text-text-muted text-xs font-bold rounded-full border border-white/5">
                                            {event.format}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors">
                                        <a href={event.link} target="_blank" rel="noopener noreferrer">{event.title}</a>
                                    </h3>
                                </div>
                            </div>
                            
                            <p className="text-text-muted text-sm line-clamp-2">{event.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-primary" />
                                    {formatDate(event.startDate)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-primary" />
                                    {event.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" />
                                    {event.organizerId?.name || "OpporHub Bot"}
                                </div>
                            </div>
                        </div>

                        <div className="flex md:flex-col gap-3 justify-center min-w-[140px]">
                            <button 
                                onClick={() => handleApprove(event._id)}
                                className="flex-1 flex items-center justify-center gap-2 bg-sage hover:bg-[#7fa370] text-black px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(138,154,91,0.39)] hover:shadow-[0_6px_20px_rgba(138,154,91,0.23)] border-none"
                            >
                                <Check size={18} /> Approve
                            </button>
                            <button 
                                onClick={() => handleReject(event._id)}
                                className="flex-1 flex items-center justify-center gap-2 bg-transparent hover:bg-rose-500/10 text-rose-400 border border-rose-500/30 px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                            >
                                <X size={18} /> Reject
                            </button>
                        </div>
                    </motion.div>
                ))
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
