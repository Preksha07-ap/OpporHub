import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getEvents } from '../../api/eventService';
import OpportunityCard from '../../components/ui/OpportunityCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { Search, Filter, AlertCircle, ArrowLeft, Zap, Sparkles } from 'lucide-react';

const GlobalSearch = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const data = await getEvents();
                setItems(data);
            } catch (err) {
                setError('Failed to fetch opportunities.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filteredItems = useMemo(() => {
        if (!query) return items;
        const searchLower = query.toLowerCase();
        return items.filter(ev => {
            const matchesTitle = ev.title?.toLowerCase()?.includes(searchLower);
            const matchesOrg = (ev.organizerId?.name || ev.org)?.toLowerCase()?.includes(searchLower);
            const matchesTags = ev.tags?.some(tag => tag.toLowerCase().includes(searchLower));
            const matchesType = ev.type?.toLowerCase()?.includes(searchLower);
            return matchesTitle || matchesOrg || matchesTags || matchesType;
        });
    }, [items, query]);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <Link to="/" className="text-text-muted hover:text-primary flex items-center gap-2 mb-6 transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>
                <h1 className="text-4xl md:text-5xl font-heading font-black text-text-main mb-4">
                    Search Results for <span className="text-primary">"{query}"</span>
                </h1>
                <p className="text-text-muted text-lg">
                    Found {filteredItems.length} matching opportunities across all categories.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Error</h3>
                    <p>{error}</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-24 clay-card border-dashed border-white/10 bg-white/5">
                    <Search size={64} className="mx-auto mb-6 text-text-muted opacity-20" />
                    <h3 className="text-2xl font-bold text-text-main mb-2">No matches found</h3>
                    <p className="text-text-muted max-w-md mx-auto">
                        We couldn't find anything matching "{query}". Try checking your spelling or using more general keywords.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <OpportunityCard 
                            key={item._id} 
                            {...{
                                id: item._id,
                                title: item.title,
                                org: item.organizerId?.name || 'Unknown Organizer',
                                date: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'TBA',
                                location: item.location,
                                tags: item.tags || [],
                                type: item.type,
                                image: item.coverImage,
                                link: item.link
                            }} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
