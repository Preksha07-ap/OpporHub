import React, { useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

// Utility for consolidating classes
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const ROTATION_RANGE = 25.5; // Degree of tilt
const HALF_ROTATION_RANGE = 25.5 / 2;

const ClayCard = ({ children, className, image }) => {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

    const transform = useMotionTemplate`perspective(1000px) rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMouseMove = (e) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
        const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

        const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
        const rY = mouseX / width - HALF_ROTATION_RANGE;

        x.set(rX);
        y.set(rY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: "preserve-3d", transform }}
            className={cn(
                "relative rounded-3xl overflow-hidden group clay-card",
                className
            )}
        >
            {/* Clay-like thick border effect */}
            <div className="absolute inset-0 rounded-3xl border-[3px] border-white/50 dark:border-white/5 pointer-events-none z-20" />

            {/* Cover Image */}
            {image && (
                <>
                    <img
                        src={image}
                        alt=""
                        style={{ transform: "translateZ(-50px)" }} // Push image back
                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/20 to-transparent opacity-90" />
                </>
            )}

            <div style={{ transform: "translateZ(30px)" }} className="absolute inset-4 z-10 flex flex-col justify-between h-[calc(100%-2rem)]">
                {children}
            </div>
        </motion.div>
    );
};

const BentoGrid = ({ categories }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[14rem]">
            {categories.map((cat) => {
                const isConference = cat.name === 'Conferences';
                const isEvent = cat.name === 'Events';
                const isInternships = cat.name === 'Internships';

                let spanClass = "col-span-1 row-span-1";
                if (isConference) spanClass = "md:col-span-2 md:row-span-1";
                if (isEvent) spanClass = "md:col-span-1 md:row-span-2";
                if (isInternships) spanClass = "md:col-span-2 md:row-span-1"; // Take up remaining space beautifully

                // Dynamic Icon Color based on theme (handled via CSS classes if needed, or inline styles using vars)
                // For now, using standard colors which will look good on Clay

                return (
                    <Link
                        to={cat.link}
                        key={cat.name}
                        className={spanClass}
                    >
                        <ClayCard className="h-full w-full" image={cat.image}>
                            <div className="flex justify-between items-start">
                                <div className={cn("p-3 rounded-2xl shadow-inner clay-inset bg-white/5 backdrop-blur-md", cat.color)}>
                                    {cat.icon}
                                </div>
                                <div className="p-2 rounded-full bg-black/20 hover:bg-white/10 transition-colors">
                                    <ExternalLink className="text-text-muted" size={20} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-3xl font-heading font-bold text-text-main mb-2 tracking-tight">{cat.name}</h3>
                                <p className="text-text-muted text-sm font-medium line-clamp-2">{cat.desc}</p>
                            </div>
                        </ClayCard>
                    </Link>
                );
            })}
        </div>
    );
};

export default BentoGrid;
