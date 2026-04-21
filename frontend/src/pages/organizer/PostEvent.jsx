import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, Tag, Type, AlignLeft, CheckCircle2, ArrowRight, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { createEvent } from '../../api/eventService';

const PostOpportunity = () => {
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Hackathon',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        deadline: '',
        link: '',
        tags: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('type', formData.type);
            data.append('description', formData.description);
            data.append('location', formData.location);
            data.append('startDate', formData.startDate);
            data.append('endDate', formData.endDate);
            data.append('deadline', formData.deadline);
            data.append('link', formData.link);
            data.append('tags', formData.tags);
            if (formData.image) {
                data.append('coverImage', formData.image);
            }

            await createEvent(data);
            setIsSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post opportunity');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="container mx-auto px-4 py-24 max-w-3xl min-h-[80vh] flex flex-col items-center justify-center text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-8 mx-auto"
                >
                    <CheckCircle2 size={48} />
                </motion.div>
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-heading font-black text-text-main mb-6"
                >
                    Event Published <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sage">Successfully!</span>
                </motion.h1>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.2 }}
                    className="text-lg text-text-muted mb-10 max-w-xl mx-auto"
                >
                    Your opportunity is now live on the global feed. Thousands of students will now be able to discover and apply for it.
                </motion.p>
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button 
                        onClick={() => navigate('/org-dashboard')}
                        className="bg-surface hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold border border-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        Go to Dashboard
                    </button>
                    <button 
                        onClick={() => { setIsSubmitted(false); setFormData({...formData, title: '', description: ''}); }}
                        className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        Post Another Event <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 lg:px-8 py-12 mt-16 max-w-5xl min-h-screen">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-heading font-black text-text-main mb-3 flex items-center justify-center md:justify-start gap-3">
                    <Sparkles className="text-terracotta" size={36} /> Post New Event
                </h1>
                <p className="text-text-muted text-lg font-medium">Create a high-impact opportunity. Reach the right students.</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-medium flex items-start gap-2">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Basic Details Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="clay-card p-6 md:p-8 bg-surface border border-white/5"
                >
                    <h3 className="text-xl font-bold text-text-main mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                        <Type size={20} className="text-primary"/> Basic Information
                    </h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Event Title <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Global React Hackathon 2026" 
                                    className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-white/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Event Type <span className="text-rose-500">*</span></label>
                                <select 
                                    name="type"
                                    required
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none hover:border-white/20"
                                >
                                    <option value="Conference" className="bg-[#1a2a1a]">Conference</option>
                                    <option value="Hackathon" className="bg-[#1a2a1a]">Hackathon</option>
                                    <option value="Workshop" className="bg-[#1a2a1a]">Workshop</option>
                                    <option value="Internship" className="bg-[#1a2a1a]">Internship</option>
                                    <option value="Open Source" className="bg-[#1a2a1a]">Open Source</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-muted ml-1">Description <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <AlignLeft className="absolute left-4 top-4 text-white/30" size={20} />
                                <textarea 
                                    name="description"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Describe the opportunity, expected outcomes, requirements, and any prize pools..." 
                                    className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-white/20 resize-y"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Logistics Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="clay-card p-6 md:p-8 bg-surface border border-white/5"
                >
                    <h3 className="text-xl font-bold text-text-main mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-terracotta"/> Location & Timing
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-muted ml-1">Location <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input 
                                    type="text" 
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Online, Hybrid, or Exact City (e.g., Bangalore, India)" 
                                    className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Start Date <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={20} />
                                    <input 
                                        type="date" 
                                        name="startDate"
                                        required
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium [&::-webkit-calendar-picker-indicator]:opacity-0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">End Date <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={20} />
                                    <input 
                                        type="date" 
                                        name="endDate"
                                        required
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium [&::-webkit-calendar-picker-indicator]:opacity-0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1 text-terracotta flex items-center gap-1"><AlertCircle size={14}/> App Deadline <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-terracotta/50 pointer-events-none" size={20} />
                                    <input 
                                        type="date" 
                                        name="deadline"
                                        required
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-bg-card border border-terracotta/30 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all font-medium [&::-webkit-calendar-picker-indicator]:opacity-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Additional Details Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="clay-card p-6 md:p-8 bg-surface border border-white/5"
                >
                    <h3 className="text-xl font-bold text-text-main mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                        <LinkIcon size={20} className="text-blue-400"/> Links & Assets
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-muted ml-1">Link to Apply / Official Website <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input 
                                    type="url" 
                                    name="link"
                                    required
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="https://example.com/apply" 
                                    className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1">Key Tags <span className="text-white/30 font-normal">(Comma separated)</span></label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                    <input 
                                        type="text" 
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder='e.g., "AI, Python, Web3"' 
                                        className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-white/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted ml-1 flex items-center justify-between">
                                    <span>Event Image / Cover <span className="text-white/30 font-normal">(Optional)</span></span>
                                    {formData.image && <CheckCircle2 size={16} className="text-emerald-400" />}
                                </label>
                                <div className="relative flex items-center justify-center w-full h-12 px-4 transition-all bg-bg-card border border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 hover:border-primary/50 overflow-hidden group">
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                    <div className="flex items-center gap-2 text-text-muted group-hover:text-primary transition-colors">
                                        <Upload size={18} />
                                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                            {formData.image ? formData.image.name : "Click to upload an image file"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Submit Action */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="flex justify-end pt-4"
                >
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full md:w-auto text-white px-12 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                            isSubmitting 
                            ? 'bg-gray-500 cursor-not-allowed shadow-none'
                            : 'bg-primary hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(138,154,91,0.4)]'
                        }`}
                    >
                        <Sparkles size={20} /> {isSubmitting ? 'Publishing...' : 'Publish Opportunity'}
                    </button>
                </motion.div>
                
            </form>
        </div>
    );
};

export default PostOpportunity;
