import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Globe, Mail, Phone, Upload, AlignLeft, User, Shield, CheckCircle2, Bell, Settings, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProfileSettings = () => {
    const { role } = useAuth();

    if (role !== 'ORGANIZER') {
        return <Navigate to="/" replace />;
    }

    const [formData, setFormData] = useState({
        orgName: 'TechEvents India',
        orgType: 'EdTech Company',
        website: 'www.techevents.com',
        contactEmail: 'events@techevents.com',
        contactPhone: '+91 98765 43210',
        description: 'We organize tech workshops across India',
        ownerName: 'Rahul Mehta',
        accountEmail: 'rahul@techevents.com',
        notifyApps: true,
        notifyWeekly: true,
        notifySignups: false
    });

    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="container mx-auto px-4 lg:px-8 py-12 mt-16 max-w-4xl min-h-screen">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-heading font-black text-text-main mb-3 flex items-center justify-center md:justify-start gap-3">
                    <Settings className="text-primary" size={36} /> Profile Settings
                </h1>
                <p className="text-text-muted text-lg font-medium">Manage your account and organization details</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* ORGANIZATION INFORMATION */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="clay-card p-6 md:p-8 bg-surface border border-white/5"
                >
                    <h3 className="text-xl font-bold text-text-main mb-6 border-b border-white/10 pb-4 flex items-center gap-2 uppercase tracking-wide">
                        <Building size={20} className="text-blue-400"/> Organization Information
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Organization Name</label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                    <input 
                                        type="text" name="orgName" value={formData.orgName} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Organization Type</label>
                                <div className="relative">
                                    <select 
                                        name="orgType" value={formData.orgType} onChange={handleChange}
                                        className="w-full pl-4 pr-10 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 hover:border-white/20 transition-all font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="College / University" className="bg-[#1a2a1a]">College / University</option>
                                        <option value="Student Club" className="bg-[#1a2a1a]">Student Club</option>
                                        <option value="EdTech Company" className="bg-[#1a2a1a]">EdTech Company</option>
                                        <option value="Corporate" className="bg-[#1a2a1a]">Corporate</option>
                                        <option value="Event Organizer" className="bg-[#1a2a1a]">Event Organizer</option>
                                        <option value="Non-Profit" className="bg-[#1a2a1a]">Non-Profit</option>
                                        <option value="Individual" className="bg-[#1a2a1a]">Individual</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                        <span className="text-[10px]">▼</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                    <input 
                                        type="text" name="website" value={formData.website} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1 flex justify-between items-center">
                                    <span>Logo Upload</span>
                                </label>
                                <div className="relative flex items-center justify-center w-full h-[46px] px-4 bg-bg-card border border-white/10 border-dashed rounded-xl cursor-pointer hover:border-primary/50 group overflow-hidden">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    <div className="flex items-center gap-2 text-text-muted group-hover:text-primary transition-colors">
                                        <Upload size={16} /> <span className="text-sm font-medium">Choose file</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Contact Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                    <input 
                                        type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Contact Phone <span className="text-white/30 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                    <input 
                                        type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-muted ml-1">Description</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-4 top-4 text-white/30" size={18} />
                                <textarea 
                                    name="description" value={formData.description} onChange={handleChange} rows="3"
                                    className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-y"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ACCOUNT INFORMATION */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="clay-card p-6 md:p-8 bg-surface border border-white/5"
                >
                    <h3 className="text-xl font-bold text-text-main mb-6 border-b border-white/10 pb-4 flex items-center gap-2 uppercase tracking-wide">
                        <User size={20} className="text-emerald-400"/> Account Information
                    </h3>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Account Owner Name</label>
                                <input 
                                    type="text" name="ownerName" value={formData.ownerName} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Account Email (Login)</label>
                                <input 
                                    type="email" name="accountEmail" value={formData.accountEmail} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <h4 className="text-sm font-bold text-text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Shield size={16} className="text-emerald-400"/> Verification Status
                            </h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle2 className="text-emerald-400" size={24} />
                                    <span className="text-lg font-bold text-emerald-400">Your account is verified</span>
                                </div>
                                <p className="text-sm text-text-muted mb-6 ml-9">Verified with: <span className="text-white font-medium">{formData.accountEmail}</span></p>
                                
                                <div className="ml-9">
                                    <p className="text-sm font-bold text-white mb-3">Verified organizers get:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm text-text-muted">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Higher visibility in search
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-text-muted">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Trust badge on event posts
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-text-muted">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Priority support
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="button" className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-text-main font-bold transition-all flex items-center justify-center gap-2">
                                <Shield size={18} /> Change Password
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* PREFERENCES */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="clay-card p-6 md:p-8 bg-surface border border-white/5 relative overflow-hidden"
                >
                    <h3 className="text-xl font-bold text-text-main mb-6 border-b border-white/10 pb-4 flex items-center gap-2 uppercase tracking-wide">
                        <Bell size={20} className="text-terracotta"/> Preferences
                    </h3>

                    <div className="space-y-4">
                        <label className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                            <input type="checkbox" name="notifyApps" checked={formData.notifyApps} onChange={handleChange} className="w-5 h-5 accent-primary rounded bg-bg-card border-white/20" />
                            <span className="text-text-main font-medium">Email when someone applies to my event</span>
                        </label>
                        <label className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                            <input type="checkbox" name="notifyWeekly" checked={formData.notifyWeekly} onChange={handleChange} className="w-5 h-5 accent-primary rounded bg-bg-card border-white/20" />
                            <span className="text-text-main font-medium">Send weekly analytics report</span>
                        </label>
                        <label className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                            <input type="checkbox" name="notifySignups" checked={formData.notifySignups} onChange={handleChange} className="w-5 h-5 accent-primary rounded bg-bg-card border-white/20" />
                            <span className="text-text-main font-medium">New student sign-up alerts</span>
                        </label>
                    </div>
                </motion.div>

                {/* ACTION BUTTONS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4"
                >
                    {isSaved && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-400 font-bold flex items-center gap-2">
                            <CheckCircle2 size={18} /> Settings Saved
                        </motion.span>
                    )}
                    <button type="button" className="w-full sm:w-auto px-8 py-3 bg-transparent text-text-muted hover:text-white font-bold transition-all flex items-center justify-center gap-2">
                        <X size={18} /> Cancel
                    </button>
                    <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </motion.div>
                
            </form>
        </div>
    );
};

export default ProfileSettings;
