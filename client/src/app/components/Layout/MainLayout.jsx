// client/src/app/components/Layout/MainLayout.jsx - UPDATED
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth';

export default function MainLayout({ children }) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const loggedIn = AuthService.isLoggedIn();
                setIsLoggedIn(loggedIn);
                
                if (loggedIn) {
                    const currentUser = AuthService.getCurrentUser();
                    setUser(currentUser);
                    
                    // Optional: Fetch fresh user data from API
                    // await AuthService.getMe();
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
        
        // Listen for storage changes (other tabs)
        const handleStorageChange = () => {
            checkAuth();
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [router]);

    const handleLogout = async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggedIn(false);
            setUser(null);
            router.push('/login');
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If not logged in, just show children without dashboard layout
    if (!isLoggedIn) {
        return <>{children}</>;
    }

    // Dashboard layout (only shown when logged in)
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Dashboard Header */}
            <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur-md"></div>
                                <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 w-10 h-10 rounded-lg flex items-center justify-center shadow-xl">
                                    <i className="fas fa-graduation-cap text-white text-lg"></i>
                                </div>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                AcademVault
                            </h1>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                                    <p className="text-gray-400 text-sm capitalize">{user?.type || 'Student'}</p>
                                </div>
                                <div className="relative">
                                    <img 
                                        src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3b82f6&color=fff`}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full border-2 border-blue-500/50"
                                    />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <i className="fas fa-sign-out-alt text-gray-400"></i>
                                <span className="text-white text-sm hidden md:inline">Logout</span>
                            </button>
                            
                            <button 
                                className="md:hidden p-2 text-gray-400 hover:text-white"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <i className="fas fa-bars text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar for Mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    
                    {/* Sidebar */}
                    <div className="absolute right-0 top-0 h-full w-64 bg-gray-900 border-l border-gray-800 animate-slide-in">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 w-10 h-10 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-graduation-cap text-white"></i>
                                    </div>
                                    <h2 className="text-white font-bold">AcademVault</h2>
                                </div>
                                <button 
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-8 p-3 bg-gray-800/50 rounded-lg">
                                <img 
                                    src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3b82f6&color=fff`}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border-2 border-blue-500/50"
                                />
                                <div>
                                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                                    <p className="text-gray-400 text-sm capitalize">{user?.type || 'Student'}</p>
                                </div>
                            </div>
                            
                            <nav className="space-y-2">
                                <a href="/dashboard" className="flex items-center gap-3 p-3 text-white bg-blue-500/10 rounded-lg">
                                    <i className="fas fa-home w-5"></i>
                                    <span>Dashboard</span>
                                </a>
                                <a href="/categories" className="flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg">
                                    <i className="fas fa-folder w-5"></i>
                                    <span>Categories</span>
                                    <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">12</span>
                                </a>
                                <a href="/documents" className="flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg">
                                    <i className="fas fa-file-alt w-5"></i>
                                    <span>Documents</span>
                                    <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">45</span>
                                </a>
                                <a href="/profile" className="flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg">
                                    <i className="fas fa-user-circle w-5"></i>
                                    <span>Profile</span>
                                </a>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                                >
                                    <i className="fas fa-sign-out-alt w-5"></i>
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-gray-800 py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-700 w-8 h-8 rounded-lg flex items-center justify-center">
                                <i className="fas fa-graduation-cap text-white text-sm"></i>
                            </div>
                            <p className="text-gray-400 text-sm">© 2024 AcademVault. All rights reserved.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="/privacy" className="text-gray-500 hover:text-gray-400 text-sm">Privacy Policy</a>
                            <a href="/terms" className="text-gray-500 hover:text-gray-400 text-sm">Terms of Service</a>
                            <a href="/help" className="text-gray-500 hover:text-gray-400 text-sm">Help Center</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}