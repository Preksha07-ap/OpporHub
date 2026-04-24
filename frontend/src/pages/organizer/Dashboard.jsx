import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { BarChart3, Users, Activity, Eye, Edit, Share2, Plus, Calendar, MapPin, ExternalLink, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrganizerAnalytics } from '../../api/analyticsService';

const OrganizerDashboard = () => {
    const { user, role } = useAuth();

    if (role !== 'ORGANIZER') {
        return <Navigate to="/" replace />;
    }

    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (role !== 'ORGANIZER') return;
            try {
                const data = await getOrganizerAnalytics();
                setAnalytics(data);
            } catch (err) {
                console.error("Failed fetching analytics:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [role]);

    const totalViewsFallback = analytics ? analytics.totalEvents * 142 : 0;
    const avgEngagementFallback = analytics && analytics.totalEvents > 0 ? "89%" : "0%";

    const stats = [
        { title: "Events Live", value: analytics?.totalEvents?.toString() || "0", icon: <Calendar size={24} className="text-emerald-400" />, trend: "Active" },
        { title: "Total Applications", value: analytics?.totalRegistrations?.toString() || "0", icon: <Users size={24} className="text-blue-400" />, trend: "All Time" },
        { title: "Avg Engagement", value: avgEngagementFallback, icon: <Activity size={24} className="text-terracotta" />, trend: "Est." }
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-primary" size={64} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-20 max-w-6xl min-h-screen">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-4xl font-heading font-black text-text-main mb-2">
                    Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{user?.name ? user.name.split(' ')[0] : 'Organizer'}!</span>
                </h1>
                <p className="text-text-muted text-lg">Here's a snapshot of your community impact.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="clay-card p-6 border border-white/5 bg-surface hover:bg-surface-light transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-inner">
                                {stat.icon}
                            </div>
                            <div className="text-xs font-bold text-text-muted bg-white/5 px-2 py-1 rounded-md">
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-text-main mb-1">{stat.value}</h3>
                        <p className="text-sm font-semibold text-text-muted">{stat.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions (Centered Prominent Button) */}
            <div className="flex justify-center mb-12 mt-8">
                <Link to="/post">
                    <button className="bg-primary hover:bg-primary-hover text-white px-10 py-4 text-xl rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(138,154,91,0.3)] hover:shadow-[0_0_30px_rgba(138,154,91,0.5)] active:scale-95">
                        <Plus size={24} /> Post Opportunity
                    </button>
                </Link>
            </div>
            
            {/* View Full Analytics Link */}
            <div className="mt-8 text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col sm:flex-row items-center justify-center gap-4">
                <p className="text-text-muted font-medium">Need more details?</p>
                <Link to="/analytics" className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1 group">
                    View Full Analytics <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
