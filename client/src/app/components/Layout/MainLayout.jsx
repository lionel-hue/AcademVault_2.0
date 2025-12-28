// client/src/app/components/Layout/MainLayout.jsx - UPDATED VERSION
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth';
import Link from 'next/link';

export default function MainLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // ADD THIS STATE

    const userDropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const loggedIn = AuthService.isLoggedIn();

                if (!loggedIn) {
                    const token = localStorage.getItem('academvault_token');
                    const userStr = localStorage.getItem('academvault_user');

                    if (token && userStr) {
                        AuthService.token = token;
                        AuthService.user = JSON.parse(userStr);
                    } else {
                        router.push('/login');
                        return;
                    }
                }

                const currentUser = AuthService.getCurrentUser();
                setUser(currentUser);
                setLoading(false);
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/login');
            }
        };

        checkAuth();

        // Close dropdowns when clicking outside
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [router]);

    // ADD THIS FUNCTION FOR SEARCH
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // Redirect to search page with query
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery(''); // Clear the input
    };

    // ADD THIS FUNCTION FOR SEARCH ON ENTER KEY
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            const response = await AuthService.fetchNotifications();
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

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

    const navItems = [
        { icon: 'fas fa-home', label: 'Dashboard', href: '/dashboard' },
        { icon: 'fas fa-folder', label: 'Categories', href: '/categories', count: 12 },
        { icon: 'fas fa-file-alt', label: 'Documents', href: '/documents', count: 45 },
        { icon: 'fas fa-layer-group', label: 'Collections', href: '/collections', count: 8 },
        { icon: 'fas fa-comments', label: 'Discussions', href: '/discussions', count: 5 },
        { icon: 'fas fa-users', label: 'Friends', href: '/friends', count: 18 },
        { icon: 'fas fa-bookmark', label: 'Bookmarks', href: '/bookmarks', count: 23 },
        { icon: 'fas fa-chart-line', label: 'Analytics', href: '/analytics' },
        { icon: 'fas fa-cog', label: 'Settings', href: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo and Mobile Menu */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg md:hidden"
                            >
                                <i className="fas fa-bars text-xl"></i>
                            </button>

                            <Link href="/dashboard" className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md"></div>
                                    <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-xl">
                                        <i className="fas fa-graduation-cap text-white text-lg"></i>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        AcademVault
                                    </h1>
                                    <p className="text-gray-500 text-xs hidden sm:block">Research Platform</p>
                                </div>
                            </Link>
                        </div>

                        {/* Center: Search Bar (Desktop) - UPDATED */}
                        <div className="hidden md:block flex-1 max-w-2xl mx-8">
                            <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                                <form onSubmit={handleSearch} className="w-full">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Search documents, discussions, or users..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </form>
                                {searchQuery && (
                                    <button
                                        onClick={handleSearch}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-400 hover:text-blue-300"
                                    >
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right: User Actions */}
                        <div className="flex items-center gap-4">
                            {/* Desktop Search Button - UPDATED */}
                            <button
                                onClick={() => router.push('/search')}
                                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                            >
                                <i className="fas fa-search text-xl"></i>
                            </button>

                            {/* Notifications */}
                            <div className="relative" ref={notificationsRef}>
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                                >
                                    <i className="fas fa-bell text-xl"></i>
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>

                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-800">
                                            <h3 className="font-semibold text-white">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification) => (
                                                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-800/50">
                                                        <p className="text-white text-sm">{notification.message}</p>
                                                        <p className="text-gray-500 text-xs mt-1">
                                                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="px-4 py-8 text-center text-gray-500">No new notifications</p>
                                            )}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-800">
                                            <Link href="/notifications" className="text-blue-400 hover:text-blue-300 text-sm">
                                                View all notifications
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile */}
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <div className="relative">
                                        <img
                                            src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full border-2 border-blue-500/50"
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-white font-medium text-sm">{user?.name || 'User'}</p>
                                        <p className="text-gray-400 text-xs capitalize">{user?.type || 'Student'}</p>
                                    </div>
                                    <i className={`fas fa-chevron-down text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}></i>
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-800">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                                                    alt="Profile"
                                                    className="w-12 h-12 rounded-full border-2 border-blue-500/50"
                                                />
                                                <div>
                                                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                                                    <p className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">
                                                <i className="fas fa-user-circle w-5"></i>
                                                <span>Profile</span>
                                            </Link>
                                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">
                                                <i className="fas fa-cog w-5"></i>
                                                <span>Settings</span>
                                            </Link>
                                            <Link href="/help" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">
                                                <i className="fas fa-question-circle w-5"></i>
                                                <span>Help & Support</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-800 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <i className="fas fa-sign-out-alt w-5"></i>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Search Bar - UPDATED */}
            <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4">
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                    <form onSubmit={handleSearch} className="w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Search documents, discussions, or users..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </form>
                    {searchQuery && (
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-400 hover:text-blue-300"
                        >
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:block w-64 min-h-[calc(100vh-64px)] bg-gray-900/50 border-r border-gray-800 sticky top-16">
                    <div className="p-6">
                        {/* Quick Stats */}
                        <div className="mb-8 p-4 bg-gray-800/30 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm">Quick Stats</span>
                                <i className="fas fa-chart-bar text-blue-400"></i>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">Documents</span>
                                    <span className="text-white text-sm font-medium">45</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">Storage</span>
                                    <span className="text-white text-sm font-medium">245 MB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">Friends</span>
                                    <span className="text-white text-sm font-medium">18</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center justify-between px-3 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <i className={`${item.icon} w-5 text-gray-400 group-hover:text-blue-400`}></i>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.count !== undefined && (
                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                            {item.count}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Theme Toggle */}
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <i className="fas fa-moon text-gray-400"></i>
                                    <span className="text-gray-300 text-sm">Dark Mode</span>
                                </div>
                                <div className="relative">
                                    <div className="w-12 h-6 bg-gray-800 rounded-full"></div>
                                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-blue-500 rounded-full transition-transform"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    ></div>

                    <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 animate-slide-in">
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

                            {/* Mobile Navigation */}
                            <nav className="space-y-1 mb-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className="flex items-center justify-between px-3 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <i className={`${item.icon} w-5 text-gray-400`}></i>
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {item.count !== undefined && (
                                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                                {item.count}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </nav>

                            {/* User Info */}
                            <div className="p-4 bg-gray-800/30 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full border-2 border-blue-500/50"
                                    />
                                    <div>
                                        <p className="text-white font-medium">{user?.name || 'User'}</p>
                                        <p className="text-gray-400 text-xs">{user?.email || 'user@example.com'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium"
                                >
                                    <i className="fas fa-sign-out-alt mr-2"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}