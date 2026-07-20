import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import TheEntity from './TheEntity';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useSessionStore();

    const handleDemoFill = () => {
        setEmail('admin@dev.com');
        setPassword('password');
        setIsLogin(true);
        setError('');
    };

    const validate = () => {
        if (!email) {
            setError('Email is required');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!password) {
            setError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (!isLogin && !name.trim()) {
            setError('Name is required for sign up');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            setLoading(false);
            try {
                login({ email, name: isLogin ? 'Demo Admin' : name }, 'mock-jwt-token-xyz');
            } catch (err) {
                setError('Authentication failed. Please try again.');
            }
        }, 850);
    };

    return (
        <div
            style={{ backgroundImage: 'radial-gradient(circle at center, #0a0d24 0%, #010103 100%)' }}
            className="relative min-h-screen w-screen text-zinc-100 flex flex-col lg:flex-row select-none overflow-x-hidden font-sans"
        >
            {/* Decorative Blob Ambient Gradients */}
            <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-700/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Left Column: The Entity Visuals */}
            <div className="relative w-full lg:w-1/2 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-zinc-900/60 bg-zinc-950/20 backdrop-blur-sm h-[360px] lg:h-auto py-12 lg:py-0">
                <TheEntity />
            </div>

            {/* Right Column: Card Forms */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-12 px-6 lg:p-16 relative">
                <div className="relative w-full max-w-md bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl transition-all duration-300">

                    {/* Brand/Detail Title Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/60 shadow-lg text-emerald-400 font-black text-xl mb-4 select-none">
                            A
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome to Mastra Studio</h2>
                        <p className="text-zinc-400 text-xs mt-1.5">Manage agents, workflows, and integrations seamlessly</p>
                    </div>

                    {/* Tab Toggle Switchers */}
                    <div className="grid grid-cols-2 bg-zinc-900/80 border border-zinc-800/50 p-1.5 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`py-2 text-xs font-semibold rounded-lg transition-all ${isLogin
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/40'
                                : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`py-2 text-xs font-semibold rounded-lg transition-all ${!isLogin
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/40'
                                : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Inline Error State Feedback */}
                    {error && (
                        <div className="mb-4 px-4 py-2.5 bg-red-950/20 border border-red-800/40 rounded-lg text-red-400 text-xs font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name Field (Sign Up only) */}
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                        <User size={14} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-900/60 border border-zinc-850 hover:border-zinc-755 focus:border-zinc-700 focus:outline-none rounded-xl text-zinc-100 placeholder-zinc-500 transition-all font-sans"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Input Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Mail size={14} />
                                </span>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-900/60 border border-zinc-850 hover:border-zinc-755 focus:border-zinc-700 focus:outline-none rounded-xl text-zinc-100 placeholder-zinc-550 transition-all font-sans"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Lock size={14} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2 text-sm bg-zinc-900/60 border border-zinc-850 hover:border-zinc-755 focus:border-zinc-700 focus:outline-none rounded-xl text-zinc-100 placeholder-zinc-550 transition-all font-sans"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-550 hover:text-zinc-350 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Action Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 select-none shadow-md mt-6"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Log In' : 'Sign Up'}
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social login options */}
                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-zinc-850/50" />
                            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">or continue with</span>
                            <div className="flex-1 h-px bg-zinc-850/50" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1.5">
                            <button
                                type="button"
                                onClick={() => login({ email: 'google@dev.com', name: 'Google User' }, 'google-token')}
                                className="py-2 px-3 border border-zinc-850 hover:border-zinc-755 hover:bg-zinc-900/40 text-xs font-semibold text-zinc-305 rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.89 5.89 0 0 1 8 12.628c0-3.238 2.612-5.86 5.86-5.86a5.79 5.79 0 0 1 4.135 1.705l3.14-3.14A9.94 9.94 0 0 0 13.86 2c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.385 0 9.873-4.249 9.873-9.873 0-.6-.056-1.19-.153-1.842H12.24Z" strokeWidth="0" />
                                </svg>
                                Google
                            </button>

                            <button
                                type="button"
                                onClick={() => login({ email: 'github@dev.com', name: 'Github User' }, 'github-token')}
                                className="py-2 px-3 border border-zinc-850 hover:border-zinc-755 hover:bg-zinc-900/40 text-xs font-semibold text-zinc-305 rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                GitHub
                            </button>
                        </div>
                    </div>

                </div>

                {/* Demo Helper Pill */}
                <button
                    type="button"
                    onClick={handleDemoFill}
                    className="mt-6 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-850 active:scale-[0.98] border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-405 transition-colors shadow-sm select-none"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Demo Login: <span className="text-zinc-300 font-semibold underline">admin@dev.com / password</span> (Click to auto-fill)
                </button>
            </div>

        </div>
    );
}
