import React, { useState, useEffect } from 'react';
import OpportunityCard from '../../components/ui/OpportunityCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { getEvents } from '../../api/eventService';

const Contributions = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                const programs = data.filter(e => e.type && (e.type.toLowerCase() === 'open source' || e.type.toLowerCase() === 'contribution'));
                setEvents(programs);
            } catch (err) {
                setError('Failed to fetch open source programs from the server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const contributors = [
        { name: "Aditi S.", role: "GSoC @ TensorFlow", img: "https://i.pravatar.cc/150?u=aditi" },
        { name: "Rahul K.", role: "LFX Mentee", img: "https://i.pravatar.cc/150?u=rahul" },
        { name: "Sarah J.", role: "MLH Fellow", img: "https://i.pravatar.cc/150?u=sarah" },
        { name: "Mike T.", role: "Maintainer", img: "https://i.pravatar.cc/150?u=mike" },
    ];

    const mapEventProps = (event) => {
        const startDate = event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Rolling';
        return {
            id: event._id,
            title: event.title,
            org: event.organizerId?.name || 'Unknown Organizer',
            date: startDate,
            location: event.location || 'Remote',
            tags: event.tags || [],
            type: 'contribution',
            image: event.coverImage,
            link: event.link
        };
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-[80vh]">
            <div className="mb-12">
                <div className="clay-card border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden bg-bg-card">
                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

                    <div className="relative z-10">
                        <h1 className="text-4xl font-heading font-bold text-text-main mb-4">Open Source Contributions</h1>
                        <p className="text-text-muted text-lg max-w-xl leading-relaxed">
                            Contribute to real-world projects, learn from mentors, and get paid.
                            These programs are the best way to kickstart your open-source journey.
                        </p>
                    </div>
                    <button className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 relative z-10">
                        Start Contributing
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-primary">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="text-text-muted font-medium">Fetching open source programs...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col items-center justify-center text-center mb-16">
                    <AlertCircle size={48} className="mb-4" />
                    <h3 className="text-xl font-bold mb-2">Oops!</h3>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="mb-16">
                    {events.length === 0 ? (
                        <div className="text-center py-20 text-text-muted">
                            <h3 className="text-2xl font-bold mb-2">No programs found</h3>
                            <p>Check back later for new open source opportunities!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {events.map(prog => (
                                <OpportunityCard key={prog._id} {...mapEventProps(prog)} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Past Contributors Section */}
            <section>
                <h2 className="text-2xl font-heading font-bold text-text-main mb-6">Past Contributors & Mentors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {contributors.map((person, idx) => (
                        <div key={idx} className="clay-card p-4 rounded-xl border border-white/5 bg-bg-card flex items-center gap-4 hover:bg-white/5 transition-colors shadow-sm">
                            <img src={person.img} alt={person.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
                            <div>
                                <h4 className="font-bold text-text-main">{person.name}</h4>
                                <p className="text-xs text-text-muted font-medium">{person.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Contributions;
