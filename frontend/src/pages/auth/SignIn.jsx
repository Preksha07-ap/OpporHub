import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SignIn = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    // UI State
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const data = await login(email, password);
            
            // Check if returned user role matches selected tab role (optional logic but good UX)
            // Even if it doesn't match perfectly, we navigate based on what they actually are
            if (data.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (data.role === 'ORGANIZER') {
                navigate('/org-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
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

                <div className="w-full max-w-sm">
                    <div className="mb-6">
                        <h1 className="text-3xl font-heading font-bold text-text-main mb-2">
                            {role === 'student' ? 'Student Sign In' : 'Organizer Sign In'}
                        </h1>
                        <p className="text-text-muted">Welcome back! Please enter your details.</p>
                    </div>

                    <div className="flex bg-black/5 p-1 rounded-xl mb-6 border border-black/5">
                        <button 
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'student' ? 'bg-white shadow-sm text-black border border-black/5' : 'text-text-muted hover:text-text-main hover:bg-black/5'}`}
                        >
                            Student
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('organizer')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'organizer' ? 'bg-white shadow-sm text-black border border-black/5' : 'text-text-muted hover:text-text-main hover:bg-black/5'}`}
                        >
                            Organizer
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-main ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black placeholder:text-gray-500"
                                    placeholder="name@example.com"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black placeholder:text-gray-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex justify-end">
                                <a href="#" className="text-xs font-semibold text-primary hover:text-primary-hover">Forgot Password?</a>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] ${
                                isLoading 
                                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                                : 'bg-[#8A9A5B] hover:bg-[#76844d] shadow-[#8A9A5B]/20 hover:shadow-[#8A9A5B]/40'
                            }`}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-text-muted">
                        Don't have an account? <Link to="/signup" className="font-bold text-primary hover:underline">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
