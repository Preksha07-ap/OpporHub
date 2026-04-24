import React from 'react';
import { Calendar, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for consolidating classes
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const TrendingCard = ({ item }) => (
    <div className="group flex items-center gap-4 p-3 rounded-2xl bg-surface/50 border border-white/5 hover:bg-surface hover:border-white/10 transition-all cursor-pointer clay-card shadow-sm hover:shadow-lg hover:-translate-y-1">

        {/* Thumbnail */}
        <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-black/20 clay-inset border border-white/5 relative">
            <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            {item.live && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-1 ring-white/20"></span>
                </span>
            )}
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0 flex-grow">
            <div className="flex justify-between items-start mb-1">
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1", item.color)}>
                    {item.type}
                </span>
                <span className="text-[10px] text-text-muted flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                    <Calendar size={10} /> {item.date}
                </span>
            </div>

            <h4 className="text-sm font-bold text-text-main group-hover:text-terracotta transition-colors truncate">
                {item.title}
            </h4>

            <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{item.loc}</span>
                </div>
                {item.trendingScore && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 whitespace-nowrap">
                        <ArrowUpRight size={10} />
                        {item.trendingScore}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const TrendingMarquee = ({ items }) => {
    return (
        <div className="relative h-full w-full flex flex-col">
            {/* Scrollable Container */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col gap-3 pb-4">
                    {items.map((item, idx) => (
                        <TrendingCard key={`${item.title}-${idx}`} item={item} />
                    ))}
                    {/* Add more items to demonstrate scrolling if list is short */}
                    {items.map((item, idx) => (
                        <TrendingCard key={`${item.title}-dup-${idx}`} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendingMarquee;
