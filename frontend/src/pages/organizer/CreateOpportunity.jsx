import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Tag as TagIcon, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CreateOpportunity = () => {
    const navigate = useNavigate();
    const [tags, setTags] = useState(['In-Person', 'Beginner Friendly']);
    const [tagInput, setTagInput] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder for submitting to backend
        alert("Opportunity successfully created with tags: " + tags.join(", "));
        navigate('/events');
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-main transition-colors mb-8 font-medium">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side Info */}
                <div className="lg:col-span-1">
                    <h1 className="text-4xl font-heading font-black text-text-main mb-4 leading-tight">Post an <span className="text-primary">Opportunity.</span></h1>
                    <p className="text-text-muted mb-8 leading-relaxed">
                        Fill out the details below to publish your event. Make sure to add accurate tags so our recommendation engine can immediately match your event with the right students.
                    </p>

                    <div className="clay-card p-6 bg-surface-light border border-white/5 space-y-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="text-terracotta shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-text-main text-sm">AI Categorization</h4>
                                <p className="text-xs text-text-muted mt-1">Our engine uses the Tags you provide to instantly recommend this to relevant students.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="lg:col-span-2">
                    <div className="clay-card p-6 md:p-8 bg-bg-card border-none shadow-xl relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
                        
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            
                            {/* Title & Type Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main ml-1 tracking-wide">Opportunity Title</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main placeholder:text-text-muted/40 transition-all font-medium" placeholder="E.g., Global Hackathon 2026" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main ml-1 tracking-wide">Type</label>
                                    <select className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main transition-all font-medium appearance-none">
                                        <option value="hackathon" className="bg-[#1a2a1a]">Hackathon</option>
                                        <option value="conference" className="bg-[#1a2a1a]">Conference</option>
                                        <option value="workshop" className="bg-[#1a2a1a]">Workshop</option>
                                        <option value="internship" className="bg-[#1a2a1a]">Internship</option>
                                        <option value="open source" className="bg-[#1a2a1a]">Open Source</option>
                                        <option value="ideathon" className="bg-[#1a2a1a]">Ideathon</option>
                                        <option value="project expo" className="bg-[#1a2a1a]">Project Expo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Location & Date Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main ml-1 tracking-wide">Location</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main placeholder:text-text-muted/40 transition-all font-medium" placeholder="City, State OR 'Remote'" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main ml-1 tracking-wide">Date</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main placeholder:text-text-muted/40 transition-all font-medium" placeholder="E.g., Nov 15-16, 2026" />
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-main ml-1 tracking-wide flex items-center gap-2">
                                    <TagIcon size={14} className="text-primary" /> Tags For AI Recommendation
                                </label>
                                <div className="w-full p-2 rounded-xl border border-white/10 bg-surface focus-within:ring-2 focus-within:ring-primary/50 transition-all min-h-[52px] flex flex-wrap gap-2 items-center">
                                    {tags.map((tag, idx) => (
                                        <span key={idx} className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-grow bg-transparent border-none focus:outline-none text-text-main text-sm min-w-[120px] px-2"
                                        placeholder={tags.length === 0 ? "Type a tag and press Enter..." : "Add more..."}
                                    />
                                </div>
                                <p className="text-[10px] text-text-muted ml-2">Press Enter or comma to add a tag. Include relevant skills, domains, or eligibility.</p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-main ml-1 tracking-wide">Description</label>
                                <textarea required rows="4" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main placeholder:text-text-muted/40 transition-all font-medium custom-scrollbar" placeholder="Provide details about the opportunity..." />
                            </div>

                            <button type="submit" className="w-full bg-[#8A9A5B] hover:bg-[#76844d] text-white py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#8A9A5B]/20 hover:shadow-[#8A9A5B]/40 active:scale-[0.98]">
                                <Plus size={20} /> Publish Opportunity
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOpportunity;
