import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getPendingEvents, approveEvent, rejectEvent } from '../../api/eventService';
import { getUsers } from '../../api/adminService';
import { Building2, Calendar, MapPin, Check, X, Clock, Users, Mail, UserCheck, GraduationCap } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'users'
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (activeTab === 'events') {
      fetchPendingEvents();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
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

  if (loading && (activeTab === 'events' ? events.length === 0 : users.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-text-muted space-y-4">
        <Clock className="animate-spin text-primary" size={40} />
        <p className="font-medium">Loading {activeTab === 'events' ? 'queue' : 'users'}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pt-24 min-h-screen max-w-7xl mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-main to-text-muted mb-2">
            Founder Control Center
          </h1>
          <p className="text-text-muted text-lg italic font-medium">Manage your growing ecosystem.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
              activeTab === 'events' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Calendar size={18} /> Approval Queue
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
              activeTab === 'users' 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Users size={18} /> User Directory
          </button>
        </div>
      </div>

      {error && (
        <div className="text-rose-400 text-center py-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 backdrop-blur-sm animate-shake">
          {error}
        </div>
      )}

      <div className="space-y-6 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'events' ? (
            <motion.div 
              key="events"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {events.length === 0 ? (
                <div className="clay-card p-20 text-center flex flex-col items-center bg-white/5 border-white/10">
                  <div className="w-20 h-20 rounded-full bg-sage/20 flex items-center justify-center mb-6 border border-sage/30">
                    <Check className="text-sage" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-main mb-2">Queue is empty!</h3>
                  <p className="text-text-muted">All scraped events have been reviewed.</p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={event._id} 
                    className="clay-card p-6 flex flex-col md:flex-row gap-6 relative group overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-300"
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
                          <h3 className="text-2xl font-bold text-text-main group-hover:text-primary transition-colors">
                            <a href={event.link} target="_blank" rel="noopener noreferrer">{event.title}</a>
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-text-muted text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted font-medium pt-2">
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

                    <div className="flex md:flex-col gap-3 justify-center min-w-[160px]">
                      <button 
                        onClick={() => handleApprove(event._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-sage hover:bg-sage/80 text-black px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-sage/10 border-none"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(event._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/10 text-rose-400 border border-white/10 hover:border-rose-500/30 px-6 py-3.5 rounded-xl text-sm font-bold transition-all"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {users.length === 0 ? (
                <div className="clay-card p-20 text-center flex flex-col items-center bg-white/5 border-white/10">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
                    <Users className="text-primary" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-main mb-2">No users yet!</h3>
                  <p className="text-text-muted">Once people sign up, they will appear here.</p>
                </div>
              ) : (
                <div className="clay-card p-0 overflow-hidden border border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Details</th>
                          <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-bold text-primary border border-white/10 uppercase">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-text-main">{user.name}</div>
                                  <div className="text-xs text-text-muted flex items-center gap-1">
                                    <Mail size={12} /> {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                                user.role === 'ADMIN' 
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' 
                                  : user.role === 'ORGANIZER'
                                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20'
                                  : 'bg-primary/20 text-primary border-primary/20'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm text-text-muted font-medium">
                                {user.role === 'STUDENT' ? (
                                  <div className="flex items-center gap-2">
                                    <GraduationCap size={14} className="text-primary/60" />
                                    {user.profileData?.university || 'University not set'}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Building2 size={14} className="text-primary/60" />
                                    {user.profileData?.organization || 'Organization not set'}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right text-sm text-text-muted">
                              <div className="flex flex-col items-end">
                                <span>{formatDate(user.createdAt)}</span>
                                <span className="text-[10px] opacity-50 uppercase tracking-tighter">at {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
