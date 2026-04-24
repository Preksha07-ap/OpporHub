import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getEvents } from '../../api/eventService';
import { ArrowRight, Search, MapPin, Calendar, Users, Star, ArrowUpRight, Code, Trophy, Target, Zap, Rocket, Globe, BookOpen, Briefcase, Mic, Wrench, GitBranch } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import BentoGrid from '../../components/ui/BentoGrid';
import TrendingMarquee from '../../components/ui/TrendingMarquee';
import OpportunityCard from '../../components/ui/OpportunityCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for consolidating classes
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
// Image paths from public folder
const conferenceImg = '/assets/images/conference.jpg';
const hackathonImg = '/assets/images/hackathon.jpg';
const workshopImg = '/assets/images/workshop.jfif';

const CountUp = ({ value, suffix = "" }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
    const [displayValue, setDisplayValue] = useState(0);

    React.useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    React.useEffect(() => {
        springValue.on("change", (latest) => {
            setDisplayValue(Math.floor(latest));
        });
    }, [springValue]);

    return <span ref={ref}>{displayValue}{suffix}</span>;
}

const Home = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'organizer') {
        return <Navigate to="/org-dashboard" replace />;
    }

    const categories = [
        {
            name: 'Conferences',
            icon: <Mic size={24} className="text-purple-300" />,
            color: 'bg-purple-900/40',
            bg: 'bg-purple-50',
            link: '/conferences',
            desc: 'Global summits & tech talks.',
            image: conferenceImg
        },
        {
            name: 'Events',
            icon: <Code size={24} className="text-rose-300" />,
            color: 'bg-rose-900/40',
            bg: 'bg-rose-50',
            link: '/events',
            desc: 'Hackathons, expos & ideathons.',
            image: hackathonImg
        },
        {
            name: 'Workshops',
            icon: <Wrench size={24} className="text-amber-300" />,
            color: 'bg-amber-900/40',
            bg: 'bg-amber-50',
            link: '/workshops',
            desc: 'Master new skills with experts.',
            image: workshopImg
        },
        {
            name: 'Contributions',
            icon: <GitBranch size={24} className="text-emerald-300" />,
            color: 'bg-emerald-900/40',
            bg: 'bg-emerald-50',
            link: '/contributions',
            desc: 'Open source contribution.',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'
        },
        {
            name: 'Internships',
            icon: <Briefcase size={24} className="text-blue-300" />,
            color: 'bg-blue-900/40',
            bg: 'bg-blue-50',
            link: '/internships',
            desc: 'Kickstart your career.',
            image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2070' // Office/Team image
        }
    ];

    const [trendingItems, setTrendingItems] = useState([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ opportunities: 0, partners: 0, states: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                setIsLoadingTrending(true);
                const data = await getEvents();
                if (data && data.length > 0) {
                    const formatted = data.map((ev, idx) => {
                        const colors = [
                            "text-purple-300 bg-purple-900/30",
                            "text-rose-300 bg-rose-900/30",
                            "text-emerald-300 bg-emerald-900/30",
                            "text-amber-300 bg-amber-900/30"
                        ];
                        return {
                            title: ev.title,
                            type: ev.type,
                            loc: ev.location || 'Remote',
                            date: ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'TBA',
                            color: colors[idx % colors.length],
                            image: ev.coverImage || "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80"
                        };
                    });
                    setTrendingItems(formatted.slice(0, 6)); 

                    const states = new Set(data.map(e => e.location).filter(Boolean)).size;
                    const partners = new Set(data.filter(e => e.organizerId).map(e => e.organizerId._id || e.organizerId)).size;
                    setStats({
                        opportunities: data.length,
                        partners: partners > 0 ? partners : 5,
                        states: states > 0 ? states : 3
                    });
                }
            } catch (err) {
                console.error("Failed to load trending events:", err);
            } finally {
                setIsLoadingTrending(false);
            }
        };

        fetchTrending();
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/events?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 50 }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="container mx-auto px-4 py-8 min-h-screen"
        >
            {/* Hero Section */}
            <section className="relative py-24 lg:py-36 flex flex-col items-center text-center overflow-hidden min-h-[80vh] justify-center">

                {/* Floating Content */}
                <motion.div 
                    variants={item} 
                    animate={{ 
                        filter: isSearchFocused ? 'blur(4px)' : 'blur(0px)',
                        opacity: isSearchFocused ? 0.4 : 1,
                        scale: isSearchFocused ? 0.98 : 1
                    }}
                    transition={{ duration: 0.4 }}
                    className="z-10 relative max-w-5xl px-4"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight mb-8 leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-terracotta">
                        A Unified hub <br />
                        for <br />
                        student growth
                    </h1>
                    <p className="text-lg md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                        Discover student-focused conferences, hackathons, workshops, and open-source programs to kickstart your tech journey.
                    </p>
                </motion.div>

                {/* Semantic Search Bar */}
                <motion.div 
                    variants={item}
                    className="z-20 relative w-full max-w-2xl mt-8 px-4"
                >
                    <div className={cn(
                        "relative flex items-center transition-all duration-500 rounded-2xl overflow-hidden border-2 shadow-2xl group",
                        isSearchFocused 
                            ? "border-emerald-500 bg-[#0a0a0a] scale-110 shadow-emerald-500/20" 
                            : "border-white/10 bg-[#121212] hover:border-white/20"
                    )}>
                        <Search className={cn(
                            "absolute left-6 transition-colors duration-300",
                            isSearchFocused ? "text-emerald-500" : "text-text-muted"
                        )} size={24} />
                        <input 
                            type="text"
                            placeholder="Search conferences, hackathons, skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="w-full pl-16 pr-32 py-6 bg-transparent text-white text-xl font-medium focus:outline-none placeholder:text-white/20"
                        />
                        <button 
                            onClick={handleSearch}
                            className="absolute right-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black px-6 py-3 rounded-xl transition-all active:scale-95 text-sm uppercase tracking-tighter"
                        >
                            Discovery
                        </button>
                    </div>
                </motion.div>

            </section>

            {/* Bento Grid Layout */}
            <motion.section
                variants={container}
                initial="hidden"
                animate="show"
                className="container mx-auto px-4 max-w-7xl"
            >
                <motion.div variants={item} className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-heading font-black text-text-main flex items-center gap-2">
                        <Zap className="text-muted-orange fill-muted-orange" size={28} /> Explore Categories
                    </h2>
                </motion.div>

                <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Categories Section (2/3 width on large screens) */}
                    <div className="lg:col-span-2">
                        <BentoGrid categories={categories} />
                    </div>

                    {/* Trending Sidebar (1/3 width, tall card) */}
                    <div className="lg:col-span-1 h-[30rem]">
                        <div className="clay-card h-full p-6 relative overflow-hidden flex flex-col bg-bg-card border-none">
                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                <span className="text-2xl animate-bounce">🔥</span>
                                <h3 className="text-2xl font-heading font-bold text-text-main">Trending Now</h3>
                            </div>

                            <div className="flex-grow relative overflow-hidden -mx-4 px-4">
                                {isLoadingTrending ? (
                                    <div className="space-y-4">
                                        <SkeletonCard />
                                        <SkeletonCard />
                                    </div>
                                ) : (
                                    <TrendingMarquee items={trendingItems} />
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 text-center relative z-10">
                                <Link to="/conferences" className="text-sm font-bold text-sage hover:text-terracotta flex items-center justify-center gap-2 transition-colors py-2 group">
                                    View all popular events <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats / Trust Section (Bottom Row of Bento) */}
                {/* Stats / Trust Section - Horizontal Bar */}
                <motion.div variants={item} className="mt-16 py-8 border-t border-b border-white/5 bg-black/20 backdrop-blur-sm rounded-3xl">
                    <div className="flex flex-wrap justify-around items-center gap-8 px-8">
                        {[
                            { label: 'Active Users', value: 1250, suffix: '+', icon: <Users size={18} className="text-primary" /> },
                            { label: 'Opportunities', value: stats.opportunities, suffix: '+', icon: <Star size={18} className="text-highlight" /> },
                            { label: 'Partners', value: stats.partners, suffix: '+', icon: <Trophy size={18} className="text-accent" /> },
                            { label: 'States', value: stats.states, suffix: '+', icon: <MapPin size={18} className="text-emerald-400" /> },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 group cursor-default">
                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                    {stat.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold font-heading text-text-main leading-none">
                                        <CountUp value={stat.value} suffix={stat.suffix} />
                                    </span>
                                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.section>
        </motion.div>
    );
};

export default Home;
