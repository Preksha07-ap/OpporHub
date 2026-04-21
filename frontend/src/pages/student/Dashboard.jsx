import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Bookmark, Briefcase, Settings, LogOut, Search, Clock, CheckCircle, Trophy, Code, Star, Zap, Calendar, Bell, BellRing, CalendarPlus, Users, Video, Sparkles, History, Trash2, ExternalLink, MapPin, Camera, ShieldCheck, Lock, Mail, RefreshCw, BookOpen, Award, TrendingUp, Github, Plus, Terminal } from 'lucide-react';
import OpportunityCard from '../../components/ui/OpportunityCard';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyRegistrations, cancelRegistration } from '../../api/registrationService';
import { updateProfile } from '../../api/authService';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'saved', 'profile', 'tracker', 'calendar', 'mentorship'
    const [reminders, setReminders] = useState({ 1: true, 2: false });
    const [applicationFilter, setApplicationFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('appliedDate');

    // Profile State
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const [profileForm, setProfileForm] = useState({ name: userInfo.name || '', password: '', newPassword: '' });
    const [profileLoad, setProfileLoad] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoad(true);
        try {
            await updateProfile({ name: profileForm.name, password: profileForm.newPassword });
            alert("Profile updated successfully");
            setProfileForm({ ...profileForm, password: '', newPassword: '' });
        } catch(err) {
            alert("Failed to update profile");
        } finally {
            setProfileLoad(false);
        }
    };

    // Live Data & Loading
    const [applicationsList, setApplicationsList] = useState([]);
    const [isLoadingApps, setIsLoadingApps] = useState(true);

    React.useEffect(() => {
        const fetchApps = async () => {
            if (activeTab !== 'applications') return;
            try {
                const data = await getMyRegistrations();
                const formatted = data.map(reg => {
                    const event = reg.eventId;
                    return {
                        id: reg._id,
                        title: event?.title || 'Unknown Event',
                        org: 'Platform Partner', // Organizer name not populated actively down tree
                        type: event?.type || 'event',
                        date: event?.startDate ? `${new Date(event.startDate).toLocaleDateString()} - ${event.endDate ? new Date(event.endDate).toLocaleDateString() : ''}` : '',
                        location: event?.location || 'Remote',
                        status: reg.status, // "Registered", "Cancelled", "Attended"
                        appliedDate: new Date(reg.registeredAt).toLocaleDateString(),
                        deadline: event?.deadline ? new Date(event.deadline).toLocaleDateString() : ''
                    };
                });
                setApplicationsList(formatted);
            } catch (err) {
                console.error("Failed fetching applications:", err);
            } finally {
                setIsLoadingApps(false);
            }
        };
        fetchApps();
    }, [activeTab]);

    const handleWithdraw = async (id) => {
        try {
            await cancelRegistration(id);
            setApplicationsList(applicationsList.map(app => 
                app.id === id ? { ...app, status: 'Cancelled' } : app
            ));
        } catch (err) {
            console.error('Failed to withdraw:', err);
        }
    };

    const appCounts = {
        'All': applicationsList.length,
        'Registered': applicationsList.filter(a => a.status === 'Registered').length,
        'Attended': applicationsList.filter(a => a.status === 'Attended').length,
        'Cancelled': applicationsList.filter(a => a.status === 'Cancelled').length
    };

    const [savedList, setSavedList] = useState([
        {
            id: 3,
            title: "React India 2026",
            org: "React.js Comm",
            date: "Sep 2026",
            location: "Goa",
            tags: ["Frontend", "React"],
            type: "conference",
            deadline: "Aug 15, 2026"
        },
        {
            id: 4,
            title: "Web3 Open Source",
            org: "Ethereum Foundation",
            date: "Ongoing",
            location: "Remote",
            tags: ["Blockchain", "Open Source"],
            type: "contribution",
            deadline: "No Deadline"
        }
    ]);

    const handleRemoveSaved = (id) => {
        setSavedList(savedList.filter(item => item.id !== id));
    };

    const mockUpcomingEvents = [
        {
            id: 1,
            title: "Web3 Open Source Hackathon",
            type: "hackathon",
            date: "Nov 15, 2026",
            time: "10:00 AM IST",
            location: "Remote",
            daysLeft: 3
        },
        {
            id: 2,
            title: "React Masterclass Workshop",
            type: "workshop",
            date: "Dec 02, 2026",
            time: "05:00 PM IST",
            location: "Bangalore (Hybrid)",
            daysLeft: 20
        }
    ];

    const mockSuggestedMentors = [
        { id: 1, name: "Sarah Chen", role: "Senior SWE", company: "Google", match: "98%", available: "Next Tuesday" },
        { id: 2, name: "Rahul Sharma", role: "Product Manager", company: "Microsoft", match: "92%", available: "Tomorrow" }
    ];

    const mockPastMeetings = [
        { id: 1, mentor: "David Kim", date: "Oct 15, 2026", topic: "Resume Review & Frontend Prep", duration: "45 mins" }
    ];

    const toggleReminder = (id) => {
        setReminders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getStatusStyles = (status) => {
        switch(status) {
            case 'Registered': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'Attended': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
            case 'Cancelled': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
            default: return 'bg-surface-light text-text-muted';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen max-w-7xl flex flex-col md:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
                <div className="clay-card p-6 bg-surface-light border border-white/5 mb-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-sage mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-inner uppercase">
                        {userInfo?.name ? userInfo.name.charAt(0) : 'U'}
                    </div>
                    <h2 className="text-xl font-bold text-text-main font-heading">{userInfo?.name || 'Student'}</h2>
                    <p className="text-sm text-text-muted mb-4">{userInfo?.profileData?.university || 'OpporHub Member'}</p>
                    <div className="text-xs font-semibold py-1 px-3 bg-primary/20 text-primary rounded-full inline-block border border-primary/20">
                        Top 5% Applicant
                    </div>
                </div>

                <div className="space-y-1">
                    <button 
                        onClick={() => setActiveTab('applications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'applications' ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                    >
                        <Briefcase size={18} /> My Applications
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'profile' ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                    >
                        <User size={18} /> Profile Settings
                    </button>
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'saved' ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                    >
                        <Bookmark size={18} /> Saved for Later
                    </button>
                    <button 
                        onClick={() => setActiveTab('tracker')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'tracker' ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                    >
                        <Trophy size={18} /> Progress Tracker
                    </button>
                    <button 
                        onClick={() => setActiveTab('calendar')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'calendar' ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                    >
                        <Calendar size={18} /> Personal Calendar
                    </button>
                    <button 
                        onClick={() => setActiveTab('mentorship')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'mentorship' ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                    >
                        <Users size={18} /> Alumni Mentors
                    </button>
                </div>

                <div className="pt-8 mt-8 border-t border-white/10 space-y-1">
                    <Link to="/signin" onClick={() => localStorage.removeItem('userRole')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-rose-400 hover:bg-rose-500/10">
                        <LogOut size={18} /> Sign Out
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow">
                {activeTab === 'applications' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                            <div>
                                <h1 className="text-3xl font-heading font-black text-text-main mb-1">Application Tracker</h1>
                                <p className="text-text-muted">Manage your active and past applications.</p>
                            </div>
                            
                            <div className="flex bg-surface border border-white/5 rounded-xl p-1 shrink-0 overflow-x-auto">
                                {['All', 'Registered', 'Attended', 'Cancelled'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => setApplicationFilter(status)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${applicationFilter === status ? 'bg-bg-card shadow-md text-primary border border-white/5' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
                                    >
                                        {status}
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${applicationFilter === status ? 'bg-primary/20 text-primary' : 'bg-black/20 text-text-muted'}`}>
                                            {appCounts[status]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-grow">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Search applications by title or organization..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary text-text-main transition-colors placeholder:text-text-muted/50"
                                />
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-bold text-text-muted hidden md:inline-block">Sort by:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-surface border border-white/10 rounded-xl py-3 px-4 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-primary text-text-main appearance-none cursor-pointer hover:border-white/20 transition-colors"
                                >
                                    <option value="appliedDate" className="bg-zinc-900 text-white font-semibold">Date Applied</option>
                                    <option value="deadline" className="bg-zinc-900 text-white font-semibold">Deadline</option>
                                    <option value="status" className="bg-zinc-900 text-white font-semibold">Status</option>
                                </select>
                            </div>
                        </div>

                        {isLoadingApps ? (
                            <div className="clay-card p-12 flex items-center justify-center text-primary">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                            </div>
                        ) : applicationsList.length === 0 ? (
                            <div className="clay-card p-12 bg-bg-card border border-white/5 flex flex-col items-center justify-center text-center">
                                <Briefcase size={48} className="text-white/10 mb-4" />
                                <h3 className="text-xl font-bold text-text-main mb-2">No Applications Yet</h3>
                                <p className="text-text-muted mb-6">You haven't applied to any opportunities. Start exploring and taking action!</p>
                                <Link to="/events" className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95">Browse Opportunities</Link>
                            </div>
                        ) : (() => {
                            const filteredApps = applicationsList
                                .filter(app => applicationFilter === 'All' || app.status === applicationFilter)
                                .filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()) || app.org.toLowerCase().includes(searchQuery.toLowerCase()))
                                .sort((a, b) => {
                                    if (sortBy === 'appliedDate') return new Date(b.appliedDate) - new Date(a.appliedDate);
                                    if (sortBy === 'deadline') {
                                        if (!a.deadline) return 1;
                                        if (!b.deadline) return -1;
                                        return new Date(a.deadline) - new Date(b.deadline);
                                    }
                                    if (sortBy === 'status') return a.status.localeCompare(b.status);
                                    return 0;
                                });

                            if (filteredApps.length === 0) {
                                return (
                                    <div className="clay-card p-12 border border-white/5 flex flex-col items-center justify-center text-center">
                                         <Search size={32} className="text-white/20 mb-3" />
                                         <p className="text-text-muted font-medium">No applications match your current filters or search query.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {filteredApps.map(app => (
                                        <div key={app.id} className="clay-card p-6 bg-bg-card border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border ${app.type === 'hackathon' ? 'bg-rose-900/30 text-rose-300 border-rose-500/20' : 'bg-amber-900/30 text-amber-300 border-amber-500/20'}`}>
                                                        {app.type}
                                                    </span>
                                                    <span className="text-sm font-semibold text-text-muted">{app.org}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-text-main mb-2">{app.title}</h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-muted">
                                                    <span className="flex items-center"><Clock size={14} className="inline mr-1 text-primary"/> Applied: {app.appliedDate}</span>
                                                    {app.deadline && (
                                                      <span className="flex items-center"><Calendar size={14} className="inline mr-1 text-terracotta"/> Deadline: {app.deadline}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-white/10 pt-4 md:pt-0 w-full md:w-auto">
                                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${getStatusStyles(app.status)}`}>
                                                    {app.status === 'Attended' ? <CheckCircle size={14} /> : app.status === 'Cancelled' ? <LogOut size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                                                    {app.status}
                                                </div>
                                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                                    {app.status === 'Registered' && (
                                                        <button onClick={() => handleWithdraw(app.id)} className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-rose-500/20">Withdraw</button>
                                                    )}
                                                    <button className="text-xs px-4 py-2 rounded-lg bg-surface border border-white/10 text-text-main font-bold hover:bg-white/5 transition-colors shadow-sm">View Details</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </motion.div>
                )}

                {activeTab === 'saved' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-heading font-black text-text-main mb-1">Saved for Later</h1>
                                <p className="text-text-muted">You have {savedList.length} bookmarked opportunities ready for application.</p>
                            </div>
                        </div>

                        {savedList.length === 0 ? (
                            <div className="clay-card p-12 bg-bg-card border border-white/5 flex flex-col items-center justify-center text-center">
                                <Bookmark size={48} className="text-white/10 mb-4" />
                                <h3 className="text-xl font-bold text-text-main mb-2">No Saved Opportunities</h3>
                                <p className="text-text-muted mb-6">Save opportunities to apply later.</p>
                                <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95">Browse Opportunities</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {savedList.map((item) => (
                                    <div key={item.id} className="clay-card p-6 bg-bg-card border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border ${item.type === 'conference' ? 'bg-purple-900/30 text-purple-300 border-purple-500/20' : 'bg-blue-900/30 text-blue-300 border-blue-500/20'}`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-sm font-semibold text-text-muted">{item.org}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-text-main mb-2">{item.title}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-muted">
                                                <span className="flex items-center"><MapPin size={14} className="inline mr-1 text-primary"/> {item.location}</span>
                                                <span className="flex items-center"><Calendar size={14} className="inline mr-1 text-terracotta"/> Deadline: {item.deadline}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center justify-end gap-3 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                            <button className="w-full md:w-auto text-xs font-bold text-text-main hover:bg-white/5 px-4 py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 group">
                                                <CalendarPlus size={16} className="text-primary group-hover:scale-110 transition-transform"/> Add to Calendar
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveSaved(item.id)}
                                                className="w-full md:w-auto text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-4 py-3 rounded-xl transition-all border border-transparent hover:border-rose-500/20 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} /> Remove
                                            </button>
                                            <button className="w-full md:w-auto text-sm font-bold bg-primary text-white border border-primary/50 hover:bg-primary-hover px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                                <ExternalLink size={16} /> Apply Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-heading font-black text-text-main mb-1">Profile Settings</h1>
                            <p className="text-text-muted">Manage your personal information, security, and preferences.</p>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Personal Information Card */}
                            <div className="clay-card p-8 bg-bg-card border border-white/5 space-y-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-white/10">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 rounded-full bg-surface border-2 border-primary/50 overflow-hidden flex items-center justify-center text-3xl font-black text-text-main">
                                            JS
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-text-main mb-1">Profile Picture</h3>
                                        <p className="text-sm text-text-muted mb-4 font-medium">Upload a professional photo or use your avatar.</p>
                                        <div className="flex gap-3">
                                            <button className="px-5 py-2.5 bg-surface hover:bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-text-main transition-colors shadow-sm focus:ring-2 focus:ring-primary/50">Upload New</button>
                                            <button className="px-5 py-2.5 hover:bg-rose-500/10 rounded-xl text-sm font-bold text-rose-400 transition-colors focus:ring-2 focus:ring-rose-500/50">Remove</button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                        <User size={20} className="text-primary"/> Personal Details
                                    </h3>
                                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-main ml-1 tracking-wide">Full Name</label>
                                            <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main transition-all font-medium" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-sm font-bold text-text-main tracking-wide">Email Address</label>
                                            </div>
                                            <input type="email" disabled value={userInfo.email || ''} className="w-full px-4 py-3 rounded-xl border border-white/5 bg-surface/50 text-text-muted transition-all font-medium cursor-not-allowed opacity-70" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-main ml-1 tracking-wide">Update Password</label>
                                            <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})} placeholder="New password" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main transition-all font-medium" />
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <button type="submit" disabled={profileLoad} className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                                {profileLoad ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Removed extra mock security grid for production */}

                                {/* Preferences */}
                                <div className="clay-card p-8 bg-bg-card border border-white/5 h-full">
                                    <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                        <BellRing size={20} className="text-terracotta"/> Notification Preferences
                                    </h3>
                                    <div className="space-y-6">
                                        <label className="flex flex-row items-center justify-between cursor-pointer group">
                                            <div>
                                                <span className="font-bold text-text-main block mb-1">Application Deadlines</span>
                                                <span className="text-xs text-text-muted font-medium block pr-4">Get emails 48 hours before an application closes.</span>
                                            </div>
                                            <div className="relative shrink-0">
                                                <input type="checkbox" className="peer sr-only" defaultChecked />
                                                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/10 cursor-pointer shadow-inner"></div>
                                            </div>
                                        </label>

                                        <label className="flex flex-row items-center justify-between cursor-pointer group">
                                            <div>
                                                <span className="font-bold text-text-main block mb-1">Mentor Call Reminders</span>
                                                <span className="text-xs text-text-muted font-medium block pr-4">Receive alerts 1 hour before scheduled 1:1 calls.</span>
                                            </div>
                                            <div className="relative shrink-0">
                                                <input type="checkbox" className="peer sr-only" defaultChecked />
                                                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta border border-white/10 cursor-pointer shadow-inner"></div>
                                            </div>
                                        </label>

                                        <label className="flex flex-row items-center justify-between cursor-pointer group">
                                            <div>
                                                <span className="font-bold text-text-main block mb-1">Marketing & News</span>
                                                <span className="text-xs text-text-muted font-medium block pr-4">Promotional updates and new feature drops.</span>
                                            </div>
                                            <div className="relative shrink-0">
                                                <input type="checkbox" className="peer sr-only" />
                                                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/10 cursor-pointer shadow-inner"></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                            <div className="pt-8 mb-4 border-t border-white/10 flex justify-end">
                                <button className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl font-black transition-all shadow-lg active:scale-95 text-lg flex items-center gap-2 ring-4 ring-primary/20">
                                    <ShieldCheck size={20} /> Save All Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'tracker' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div>
                                <h1 className="text-3xl font-heading font-black text-text-main mb-1">Progress Tracker</h1>
                                <p className="text-text-muted">Monitor your coding journey and skill development.</p>
                            </div>
                            <button className="flex items-center justify-center gap-2 bg-surface hover:bg-white/5 border border-white/10 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm group text-sm self-stretch md:self-auto focus:ring-2 focus:ring-primary/50">
                                <RefreshCw size={16} className="text-primary group-hover:rotate-180 transition-transform duration-500" /> Sync Latest Progress
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LeetCode Stats */}
                            <div className="clay-card p-6 bg-[#1a1a1a] border border-[#ffa116]/20 relative overflow-hidden group flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffa116] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div>
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#282828] flex items-center justify-center text-[#ffa116]">
                                                <Code size={20} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">LeetCode</h3>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Connected
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                                        <div className="bg-[#282828] p-4 rounded-xl border border-white/5 text-center">
                                            <p className="text-[#ffa116] font-black text-2xl mb-1 mt-1">1,204</p>
                                            <p className="text-xs font-semibold text-gray-400">Global Rank</p>
                                        </div>
                                        <div className="bg-[#282828] p-4 rounded-xl border border-white/5 text-center">
                                            <p className="text-white font-black text-2xl mb-1 mt-1">245</p>
                                            <p className="text-xs font-semibold text-gray-400">Solved</p>
                                        </div>
                                        <div className="bg-[#282828] p-4 rounded-xl border border-white/5 text-center">
                                            <p className="text-white font-black text-2xl mb-1 mt-1 flex items-center justify-center gap-1"><Zap size={16} className="text-amber-400"/> 14</p>
                                            <p className="text-xs font-semibold text-gray-400">Day Streak</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-[#282828] hover:bg-[#333333] border border-white/5 rounded-xl text-xs font-bold text-white transition-colors relative z-10">Disconnect Account</button>
                            </div>

                            {/* HackerRank Stats */}
                            <div className="clay-card p-6 bg-[#1a1a1a] border border-[#00ea64]/20 relative overflow-hidden group flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ea64] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div>
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#282828] flex items-center justify-center text-[#00ea64]">
                                                <Terminal size={20} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">HackerRank</h3>
                                        </div>
                                        <button className="text-xs font-bold text-[#00ea64] bg-[#00ea64]/10 hover:bg-[#00ea64]/20 px-4 py-2 rounded-lg border border-[#00ea64]/30 transition-colors flex items-center gap-2">
                                            <Plus size={14} /> Connect Account
                                        </button>
                                    </div>
                                    <div className="bg-[#282828] p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center opacity-70 mb-6 py-[42px] relative z-10">
                                         <Terminal size={32} className="text-[#00ea64]/40 mb-3" />
                                         <p className="text-white font-bold text-sm">Account Not Connected</p>
                                         <p className="text-xs text-gray-400 max-w-[200px] mt-1">Connect your HackerRank profile to sync badges and problem rank.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GitHub Activity Graph (Progress Chart) */}
                        <div className="clay-card p-6 bg-bg-card border border-white/5 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                                    <Github size={20} className="text-white"/> Contribution Activity
                                </h3>
                                <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">428 contributions in the last year</div>
                            </div>
                            
                            <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex gap-1.5 min-w-max p-1">
                                    {/* Generate mock git graph columns */}
                                    {Array.from({ length: 52 }).map((_, colIndex) => (
                                        <div key={colIndex} className="flex flex-col gap-1.5">
                                            {Array.from({ length: 7 }).map((_, rowIndex) => {
                                                const intensity = Math.random();
                                                let bgColor = 'bg-surface'; // 0
                                                let hoverColor = 'hover:ring-white/20';
                                                if (intensity > 0.8) { bgColor = 'bg-primary shadow-[0_0_8px_rgba(151,186,164,0.4)]'; hoverColor = 'hover:ring-primary'; }
                                                else if (intensity > 0.6) { bgColor = 'bg-primary/70'; hoverColor = 'hover:ring-primary/80'; }
                                                else if (intensity > 0.3) { bgColor = 'bg-primary/40'; hoverColor = 'hover:ring-primary/60'; }
                                                else if (intensity > 0.1) { bgColor = 'bg-primary/20'; hoverColor = 'hover:ring-primary/40'; }
                                                
                                                return <div key={`${colIndex}-${rowIndex}`} className={`w-3.5 h-3.5 rounded-[3px] ${bgColor} hover:ring-1 ${hoverColor} transition-all cursor-pointer`} title={`${Math.floor(intensity*10)} contributions`}></div>
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-2 text-xs font-semibold text-text-muted mt-2">
                                <span>Less</span>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-[3px] bg-surface"></div>
                                    <div className="w-3 h-3 rounded-[3px] bg-primary/20"></div>
                                    <div className="w-3 h-3 rounded-[3px] bg-primary/40"></div>
                                    <div className="w-3 h-3 rounded-[3px] bg-primary/70"></div>
                                    <div className="w-3 h-3 rounded-[3px] bg-primary"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Course Completions */}
                            <div className="clay-card p-6 bg-bg-card border border-white/5 flex flex-col">
                                <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                    <BookOpen size={20} className="text-blue-400"/> Course Completions
                                </h3>
                                <div className="space-y-4 flex-grow">
                                    <div className="bg-surface border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-blue-500/30 transition-colors cursor-pointer">
                                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex flex-shrink-0 items-center justify-center shadow-inner group-hover:bg-blue-500/20 transition-colors">
                                            <Code size={24} className="text-blue-400" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-text-main group-hover:text-blue-400 transition-colors">Advanced React Patterns</h4>
                                            <p className="text-xs font-semibold text-text-muted mt-0.5">Frontend Masters • Mar 2026</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-surface border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-yellow-500/30 transition-colors cursor-pointer">
                                        <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex flex-shrink-0 items-center justify-center shadow-inner group-hover:bg-yellow-500/20 transition-colors">
                                            <Terminal size={24} className="text-yellow-400" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-text-main group-hover:text-yellow-400 transition-colors">JavaScript: The Hard Parts</h4>
                                            <p className="text-xs font-semibold text-text-muted mt-0.5">Codecademy • Jan 2026</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                    
                                    <button className="w-full py-4 mt-2 bg-surface hover:bg-white/5 border border-white/5 border-dashed rounded-xl text-sm font-bold text-text-muted hover:text-text-main transition-colors flex items-center justify-center gap-2">
                                        <Plus size={16} /> Add Certificate
                                    </button>
                                </div>
                            </div>
                            
                            {/* Skill Badges */}
                            <div className="clay-card p-6 bg-bg-card border border-white/5">
                                <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                    <Award size={20} className="text-purple-400"/> Earned Skill Badges
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="bg-surface border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group hover:border-emerald-500/30">
                                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                                            <Code size={24} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-text-main group-hover:text-emerald-400 transition-colors">Data Structures</h4>
                                            <p className="text-[10px] items-center justify-center gap-1 font-semibold text-emerald-400 uppercase mt-1 tracking-wider flex"><Star size={10} className="fill-emerald-400" /> Mastery</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-surface border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group hover:border-blue-500/30">
                                        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                            <Terminal size={24} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-text-main group-hover:text-blue-400 transition-colors">Algorithms</h4>
                                            <p className="text-[10px] items-center justify-center gap-1 font-semibold text-blue-400 uppercase mt-1 tracking-wider flex"><Star size={10} className="fill-blue-400" /> Advanced</p>
                                        </div>
                                    </div>

                                    <div className="bg-surface border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group hover:border-purple-500/30">
                                        <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                                            <CheckCircle size={24} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-text-main group-hover:text-purple-400 transition-colors">System Design</h4>
                                            <p className="text-[10px] items-center justify-center gap-1 font-semibold text-purple-400 uppercase mt-1 tracking-wider flex"><Star size={10} className="fill-purple-400" /> Advanced</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-surface border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 border-dashed hover:bg-white/5 transition-colors cursor-pointer opacity-80 col-span-2 md:col-span-3 hover:opacity-100">
                                        <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-inner">
                                            <Plus size={20} className="text-text-muted" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-text-main">Sync Additional Badges</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}

                {activeTab === 'calendar' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-heading font-black text-text-main mb-1">Personal Calendar</h1>
                                <p className="text-text-muted">Stay on top of your upcoming hackathons, workshops, and deadlines.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {mockUpcomingEvents.map(event => (
                                <div key={event.id} className="clay-card p-6 bg-bg-card border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                                    <div className="flex-grow flex items-start gap-4">
                                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-surface border border-white/10 flex flex-col items-center justify-center overflow-hidden">
                                            <div className="bg-terracotta w-full py-0.5 text-center text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                                                {event.date.split(' ')[0]}
                                            </div>
                                            <div className="text-lg font-black text-text-main leading-tight pt-1">
                                                {event.date.split(' ')[1].replace(',', '')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${event.type === 'hackathon' ? 'bg-rose-900/30 text-rose-300' : 'bg-amber-900/30 text-amber-300'}`}>
                                                    {event.type}
                                                </span>
                                                {event.daysLeft <= 7 && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-terracotta/20 text-terracotta uppercase">
                                                        Next Week
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-text-main mb-1">{event.title}</h3>
                                            <p className="text-sm text-text-muted flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Clock size={14} className="text-primary"/> {event.time}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                        <button 
                                            onClick={() => toggleReminder(event.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${reminders[event.id] ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(138,154,91,0.2)]' : 'bg-surface text-text-muted border border-white/10 hover:text-text-main'}`}
                                        >
                                            {reminders[event.id] ? <BellRing size={16} className="animate-pulse text-primary" /> : <Bell size={16} />}
                                            {reminders[event.id] ? 'Reminder Set' : 'Set Reminder'}
                                        </button>
                                        <a href="#" className="text-xs font-semibold text-text-muted hover:text-white underline underline-offset-4">
                                            Export to Google Calendar
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'mentorship' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-heading font-black text-text-main mb-1">Alumni Mentorship</h1>
                                <p className="text-text-muted">Connect with experienced professionals for 1-on-1 guidance.</p>
                            </div>
                            <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                <Sparkles size={18} /> Request a Mentor
                            </button>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, role, or company..." 
                                    className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                            <div className="flex gap-4">
                                <select className="px-4 py-3 bg-surface border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none min-w-[140px] hover:border-white/20">
                                    <option value="" className="bg-zinc-900">All Roles</option>
                                    <option value="swe" className="bg-zinc-900">Software Engineer</option>
                                    <option value="pm" className="bg-zinc-900">Product Manager</option>
                                    <option value="design" className="bg-zinc-900">Product Designer</option>
                                </select>
                                <select className="px-4 py-3 bg-surface border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none min-w-[140px] hover:border-white/20">
                                    <option value="" className="bg-zinc-900">All Companies</option>
                                    <option value="google" className="bg-zinc-900">Google</option>
                                    <option value="meta" className="bg-zinc-900">Meta</option>
                                    <option value="stripe" className="bg-zinc-900">Stripe</option>
                                </select>
                            </div>
                        </div>

                        {/* Suggested Mentors Grid */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                                <Users size={20} className="text-primary"/> Available Mentors
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {mockSuggestedMentors.map(mentor => (
                                    <div key={mentor.id} className="clay-card p-6 bg-bg-card border border-white/5 flex flex-col gap-4 hover:border-primary/30 transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-primary to-sage flex items-center justify-center text-xl font-bold text-white shadow-inner border border-white/10">
                                                {mentor.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-text-main leading-tight">{mentor.name}</h4>
                                                        <p className="text-sm font-medium text-text-muted mt-0.5">{mentor.role} @ <span className="text-primary">{mentor.company}</span></p>
                                                    </div>
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 uppercase tracking-wide border border-emerald-500/20 whitespace-nowrap">
                                                        {mentor.match} Match
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 text-text-muted border border-white/10">React</span>
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 text-text-muted border border-white/10">System Design</span>
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 text-text-muted border border-white/10">Career Advice</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 mt-2 border-t border-white/5 pt-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-text-muted ml-1 flex items-center gap-1"><BookOpen size={12}/> Topic</label>
                                                <select className="w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none hover:border-white/20">
                                                    <option value="resume" className="bg-zinc-900">Resume Review</option>
                                                    <option value="interview" className="bg-zinc-900">Mock Interview</option>
                                                    <option value="career" className="bg-zinc-900">Career Guidance</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-text-muted ml-1 flex items-center gap-1"><Clock size={12}/> Availability</label>
                                                <select className="w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none hover:border-white/20">
                                                    <option value="tue_10" className="bg-zinc-900">Tue, 10:00 AM</option>
                                                    <option value="tue_14" className="bg-zinc-900">Tue, 2:00 PM</option>
                                                    <option value="wed_11" className="bg-zinc-900">Wed, 11:30 AM</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <button className="w-full mt-2 py-3 rounded-xl border border-primary/50 bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-[0_0_15px_rgba(138,154,91,0.2)]">
                                            <Video size={18} /> Request Meeting
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Past Meetings List */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-text-main flex items-center gap-2 mt-8">
                                <History size={20} className="text-terracotta"/> Past Meetings
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {mockPastMeetings.map(meeting => (
                                    <div key={meeting.id} className="clay-card p-5 bg-surface border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted font-bold">
                                                {meeting.mentor.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-text-main text-lg">{meeting.mentor}</h4>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-text-muted border border-white/10">
                                                        {meeting.date}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-muted font-medium flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span> {meeting.topic} <span className="mx-1 text-white/20">•</span> {meeting.duration}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                                            <div className="flex flex-col items-start md:items-end">
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Rate Session</span>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={16} className={i < 4 ? "fill-amber-400 text-amber-400 cursor-pointer hover:scale-110 transition-transform" : "text-white/20 cursor-pointer hover:text-amber-400 hover:scale-110 transition-transform"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-text-main transition-colors">
                                                View Notes
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
