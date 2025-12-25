// client/src/app/login/page.jsx - UPDATED WITHOUT FRAMER-MOTION
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';

export default function LoginPage() {
    const router = useRouter();
    const { alert, confirm, prompt } = useModal();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await AuthService.login(formData.email, formData.password);
            if (result.success) {
                await alert({
                    title: 'Welcome Back!',
                    message: 'Successfully signed in to AcademVault.',
                    variant: 'success',
                    confirmText: 'Continue'
                });
                router.push('/dashboard');
            }
        } catch (err) {
            await alert({
                title: 'Sign In Failed',
                message: err.message || 'Invalid credentials. Please try again.',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        const confirmed = await confirm({
            title: `Sign in with ${provider}`,
            message: `This will redirect you to ${provider} authentication. Continue?`,
            variant: 'default'
        });
        
        if (confirmed) {
            await alert({
                title: 'Coming Soon',
                message: `${provider} authentication will be available soon.`,
                variant: 'info'
            });
        }
    };

    const handleForgotPassword = async () => {
        const email = await prompt({
            title: 'Reset Password',
            message: 'Enter your email to receive a reset link:',
            placeholder: 'you@university.edu',
            variant: 'default'
        });
        
        if (email) {
            await alert({
                title: 'Reset Link Sent',
                message: `Instructions have been sent to ${email}.`,
                variant: 'success'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative container mx-auto px-4 py-8 md:py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content (Now on left) */}
                    <div className="order-2 lg:order-1 animate-fade-in">
                        {/* Header */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md"></div>
                                    <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl">
                                        <i className="fas fa-graduation-cap text-white text-xl"></i>
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    AcademVault
                                </h1>
                            </div>
                            
                            <h2 className="text-4xl font-bold text-white mb-4">
                                Welcome Back
                                <div className="text-lg font-normal text-gray-400 mt-2">
                                    Sign in to continue your research
                                </div>
                            </h2>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                    <i className="fas fa-envelope text-blue-400"></i>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="you@university.edu"
                                        className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-4 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                        required
                                    />
                                    <i className="fas fa-user-graduate absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                        <i className="fas fa-lock text-blue-400"></i>
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-4 px-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                        required
                                    />
                                    <i className="fas fa-key absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border ${formData.rememberMe ? 'bg-blue-500 border-blue-500' : 'border-gray-600'} transition-colors`}>
                                            {formData.rememberMe && (
                                                <i className="fas fa-check text-white text-xs absolute inset-0 flex items-center justify-center"></i>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-300">Remember me</span>
                                </label>
                                
                                <div className="text-sm">
                                    <span className="text-gray-500">New to AcademVault? </span>
                                    <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                                        Create account
                                    </Link>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gray-900 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { provider: 'Google', icon: 'fab fa-google', color: 'hover:bg-red-500/10 border-red-500/20' },
                                    { provider: 'Microsoft', icon: 'fab fa-microsoft', color: 'hover:bg-blue-500/10 border-blue-500/20' },
                                    { provider: 'GitHub', icon: 'fab fa-github', color: 'hover:bg-gray-500/10 border-gray-500/20' },
                                ].map((social, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSocialLogin(social.provider)}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border ${social.color} bg-gray-900/30 backdrop-blur-sm text-gray-300 hover:text-white transition-all duration-300 hover:scale-105`}
                                    >
                                        <i className={`${social.icon}`}></i>
                                        <span className="text-sm font-medium">{social.provider}</span>
                                    </button>
                                ))}
                            </div>
                        </form>

                        {/* Terms */}
                        <p className="text-center text-sm text-gray-500 mt-8">
                            By signing in, you agree to our{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">Terms</a>{' '}
                            and{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                        </p>
                    </div>

                    {/* Right Column - Illustration (Now on right) */}
                    <div className="order-1 lg:order-2 animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
                            
                            {/* Main Illustration Container */}
                            <div className="relative bg-gray-900/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl overflow-hidden">
                                {/* Security Illustration */}
                                <div className="relative h-80 mb-8">
                                    {/* Shield */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative w-48 h-48">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                                            <div className="relative w-48 h-48">
                                                <svg viewBox="0 0 200 200" className="w-full h-full">
                                                    <defs>
                                                        <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#3b82f6" />
                                                            <stop offset="100%" stopColor="#8b5cf6" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path 
                                                        d="M100,40 L160,60 Q200,80 180,120 Q160,160 100,180 L40,160 Q20,120 40,80 Q60,40 100,40" 
                                                        fill="url(#shield-gradient)" 
                                                        fillOpacity="0.2"
                                                        stroke="url(#shield-gradient)"
                                                        strokeWidth="3"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Lock */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative w-20 h-20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl animate-pulse"></div>
                                            <i className="fas fa-lock absolute inset-0 flex items-center justify-center text-white text-2xl"></i>
                                        </div>
                                    </div>
                                    
                                    {/* Floating Keys */}
                                    <div className="absolute top-12 left-12 animate-float">
                                        <i className="fas fa-key text-blue-400 text-xl"></i>
                                    </div>
                                    <div className="absolute bottom-12 right-12 animate-float" style={{ animationDelay: '0.5s' }}>
                                        <i className="fas fa-fingerprint text-purple-400 text-xl"></i>
                                    </div>
                                </div>
                                
                                {/* Features List */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-shield-alt text-green-400"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Enterprise Security</h4>
                                            <p className="text-sm text-gray-400">Bank-level encryption for your research</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-sync-alt text-blue-400"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Real-time Sync</h4>
                                            <p className="text-sm text-gray-400">Access your work from any device</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-cloud text-purple-400"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Cloud Storage</h4>
                                            <p className="text-sm text-gray-400">Unlimited storage for your research</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}   