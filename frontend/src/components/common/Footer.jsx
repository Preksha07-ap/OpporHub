import React from 'react';
import { Github, Twitter, Linkedin, Rocket } from 'lucide-react';
const Logo = '/assets/images/logo.png';

const Footer = () => {
    return (
        <footer className="bg-bg-card border-t border-white/5 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">

                    {/* Column 1: Brand */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={Logo} alt="OpporHub Logo" className="w-8 h-8 rounded-md" />
                            <span className="text-xl font-heading font-black text-text-main tracking-tight">OpporHub</span>
                        </div>
                        <p className="text-text-muted text-sm font-medium">
                            Built for the community, by the community 💜
                        </p>
                    </div>

                    {/* Column 2: Company Links (Horizontal) */}
                    <ul className="flex flex-wrap justify-center gap-6 text-sm text-text-muted font-medium">
                        <li><a href="#" className="hover:text-terracotta transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-terracotta transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-terracotta transition-colors">Privacy</a></li>
                        <li><a href="#" className="hover:text-terracotta transition-colors">Terms</a></li>
                        <li><a href="#" className="hover:text-terracotta transition-colors">Contact</a></li>
                    </ul>

                    {/* Column 3: Social Icons */}
                    <div className="flex gap-4">
                        <SocialIcon icon={<Twitter size={18} />} />
                        <SocialIcon icon={<Github size={18} />} />
                        <SocialIcon icon={<Linkedin size={18} />} />
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center mt-12 pt-8 border-t border-white/5 text-xs text-text-muted/50">
                    <p>© {new Date().getFullYear()} OpporHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon }) => (
    <a href="#" className="w-9 h-9 rounded-full bg-surface/50 border border-white/5 flex items-center justify-center text-text-muted hover:bg-terracotta hover:text-white hover:border-terracotta hover:scale-110 transition-all shadow-sm">
        {icon}
    </a>
);

export default Footer;
