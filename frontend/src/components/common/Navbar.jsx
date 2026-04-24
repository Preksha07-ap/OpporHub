import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, ArrowLeft, Search, ChevronDown, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
const Logo = '/assets/images/logo.png';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const { user, role, logout } = useAuth();
  const userRole = role ? role.toLowerCase() : null;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate('/signin');
  };

  const isLoggedIn = !!user;

  const navLinks = [
    { name: 'Conferences', path: '/conferences' },
    { name: 'Events', path: '/events' },
    { name: 'Workshops', path: '/workshops' },
    { name: 'Contributions', path: '/contributions' },
    { name: 'Internships', path: '/internships' },
  ];

  const organizerNavLinks = [
    { name: 'My Events', path: '/my-events' },
    { name: 'Post Opportunity', path: '/post' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Profile Settings', path: '/profile-settings' },
  ];

  const adminNavLinks = [
    ...navLinks,
    { name: 'Approval Queue', path: '/admin-dashboard' },
  ];

  const activeLinks = userRole === 'admin' 
    ? adminNavLinks 
    : userRole === 'organizer' 
      ? organizerNavLinks 
      : navLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 glass-nav h-20 flex items-center`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group mr-8">
            {location.pathname !== '/' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
              >
                <ArrowLeft size={20} />
              </motion.div>
            )}

            {location.pathname === '/' && (
              <img src={Logo} alt="OpporHub Logo" className="w-8 h-8 mr-2 rounded-md" />
            )}

            <motion.span
              layout
              className="text-lg md:text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-main to-primary group-hover:to-primary-light whitespace-nowrap overflow-hidden"
            >
              OpporHub
            </motion.span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {activeLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onMouseEnter={() => setHoveredLink(link.path)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${isActive(link.path) ? 'text-primary' : 'text-text-muted hover:text-text-main'
                      }`}
                  >
                    {/* Hover Blob */}
                    {hoveredLink === link.path && (
                      <motion.div
                        layoutId="nav-blob"
                        className="absolute inset-0 bg-white/5 rounded-full -z-10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {/* Active Indicator */}
                    {isActive(link.path) && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_currentColor]" />
                    )}

                    {link.name}
                  </Link>
                ))}
              </div>


          {/* Actions */}
          <div className="hidden md:flex items-center gap-4 ml-8">
            {isLoggedIn ? (
                <>
                    {/* Search Bar for Students */}
                    {userRole !== 'organizer' && (
                        <div className="relative group mr-2">
                            <Search 
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-primary transition-colors z-10 cursor-pointer" 
                                size={16} 
                                onClick={() => {
                                    const val = document.getElementById('nav-search')?.value;
                                    if(val) navigate(`/search?q=${encodeURIComponent(val)}`);
                                }}
                            />
                            <input 
                                id="nav-search"
                                type="text" 
                                placeholder="Search everything..." 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value) {
                                        navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                                        e.target.value = ''; // clear
                                    }
                                }}
                                className="w-40 lg:w-60 bg-surface/80 hover:bg-surface border border-white/5 hover:border-white/10 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-text-main placeholder:text-text-muted focus:bg-surface"
                            />
                        </div>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all focus:outline-none"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sage flex items-center justify-center text-sm font-bold text-white shadow-inner uppercase">
                                {user?.name ? user.name.charAt(0) : 'U'}
                            </div>
                            <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors flex items-center gap-1">
                                {user?.name || 'User'} <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </span>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-48 clay-card bg-bg-card border border-white/10 py-2 rounded-2xl shadow-xl flex flex-col z-50 overflow-hidden"
                                >
                                    <Link 
                                        to={userRole === 'admin' ? "/admin-dashboard" : userRole === 'organizer' ? "/org-dashboard" : "/dashboard"} 
                                        onClick={() => setIsProfileOpen(false)}
                                        className="px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                        <Rocket size={16} /> Dashboard
                                    </Link>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>


                </>
            ) : (
                <>
                    <Link to="/signin" className="text-sm font-bold text-text-main hover:text-primary transition-colors">
                        Sign In
                    </Link>
                    <Link to="/signup">
                    <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border border-white/10">
                        Sign Up
                    </button>
                    </Link>
                </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-text-muted p-2 hover:bg-white/5 rounded-full transition-colors ml-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="absolute top-full left-0 right-0 mt-3 clay-card p-4 flex flex-col gap-2 overflow-hidden border border-white/5 bg-bg-card"
            >
              {activeLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-lg font-medium transition-all ${isActive(link.path)
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2" />
              {isLoggedIn ? (
                  <>
                    {userRole !== 'organizer' && (
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="w-full bg-surface border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-text-main"
                            />
                        </div>
                    )}
                    <Link
                        to={userRole === 'admin' ? "/admin-dashboard" : userRole === 'organizer' ? "/org-dashboard" : "/dashboard"}
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-white/5 text-text-main font-bold hover:bg-white/5 flex items-center gap-3"
                    >
                        <Rocket size={18} /> Dashboard
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-xl border border-white/5 text-rose-400 font-bold hover:bg-rose-500/10 flex items-center gap-3"
                    >
                        <LogOut size={18} /> Logout
                    </button>

                  </>
              ) : (
                  <>
                    <Link
                        to="/signin"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center py-3 rounded-xl border border-white/10 text-text-main font-bold hover:bg-white/5"
                    >
                        Sign In
                    </Link>
                    <Link to="/signup" className="w-full">
                        <button className="w-full py-3 bg-white/10 text-white rounded-xl font-bold border border-white/10">
                        Sign Up
                        </button>
                    </Link>
                  </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
