import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-bg-primary text-text-main font-sans selection:bg-terracotta selection:text-white overflow-x-hidden relative transition-colors duration-500">
            {/* Ambient Background Glow - Earth Tones */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta/10 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 z-10 relative mt-24">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default Layout;
