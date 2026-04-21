import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Building, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SignUp = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    // UI state
    const [role, setRole] = useState('student'); // 'student' or 'organizer'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Convert UI role selection to matching backend ENUM
        const backendRole = role === 'organizer' ? 'ORGANIZER' : 'STUDENT';

        try {
            const data = await register({
                name,
                email,
                password,
                role: backendRole,
                profileData: {}
            });

            if (data.role === 'ORGANIZER') {
                navigate('/org-dashboard');
            } else {
                navigate('/dashboard'); // or '/'
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface relative">
            <div className="w-full h-full flex flex-col justify-center items-center p-8 text-text-main relative overflow-y-auto custom-scrollbar">
                <Link to="/" className="absolute top-8 left-8 p-2 rounded-full hover:bg-black/5 text-text-muted hover:text-text-main transition-colors">
                    <ArrowLeft size={24} />
                </Link>

                <div className="w-full max-w-md my-auto pt-16 pb-8">
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl font-heading font-bold text-text-main mb-2">Create an Account</h1>
                        <p className="text-text-muted">Tell us who you are to get started.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div 
                            onClick={() => setRole('student')}
                            className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                role === 'student' 
                                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(138,154,91,0.2)]' 
                                    : 'border-white/10 hover:border-black/5 hover:bg-black/5 bg-white shadow-sm'
                            }`}
                        >
                            <div className={`p-3 rounded-full ${role === 'student' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted'}`}>
                                <User size={24} />
                            </div>
                            <span className="font-bold text-sm">I am a Student</span>
                            <span className="text-xs text-text-muted text-center">Looking for opportunities</span>
                        </div>

                        <div 
                            onClick={() => setRole('organizer')}
                            className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                role === 'organizer' 
                                    ? 'border-terracotta bg-terracotta/10 shadow-[0_0_15px_rgba(226,114,91,0.2)]' 
                                    : 'border-white/10 hover:border-black/5 hover:bg-black/5 bg-white shadow-sm'
                            }`}
                        >
                            <div className={`p-3 rounded-full ${role === 'organizer' ? 'bg-terracotta text-white' : 'bg-surface-light text-text-muted'}`}>
                                <Building size={24} />
                            </div>
                            <span className="font-bold text-sm">I am an Organizer</span>
                            <span className="text-xs text-text-muted text-center">Posting events & hackathons</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-main ml-1">
                                {role === 'student' ? 'Full Name' : 'Organization Name'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                    {role === 'student' ? <User size={18} /> : <Building size={18} />}
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main placeholder:text-text-muted/50"
                                    placeholder={role === 'student' ? "John Doe" : "Tech Innovation Club"}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-main ml-1">
                                {role === 'student' ? 'Student Email Address' : 'Official/Work Email'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main placeholder:text-text-muted/50"
                                    placeholder={role === 'student' ? "student@university.edu" : "contact@organization.com"}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-main ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main placeholder:text-text-muted/50"
                                    placeholder="Create a strong password"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-3.5 mt-4 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                                isLoading
                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                : role === 'student' 
                                    ? 'bg-[#8A9A5B] hover:bg-[#76844d] shadow-[#8A9A5B]/20 hover:shadow-[#8A9A5B]/40' 
                                    : 'bg-terracotta hover:bg-[#c6604b] shadow-terracotta/20 hover:shadow-terracotta/40'
                            }`}
                        >
                            <UserPlus size={18} />
                            {isLoading ? 'Creating Account...' : `Create ${role === 'student' ? 'Student' : 'Organizer'} Account`}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-text-muted">
                        Already have an account? <Link to="/signin" className={`font-bold hover:underline ${role === 'student' ? 'text-primary' : 'text-terracotta'}`}>Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
