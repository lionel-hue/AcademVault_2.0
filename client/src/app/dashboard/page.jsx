// client/src/app/dashboard/page.jsx - COMPREHENSIVELY RESTRUCTURED
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import MainLayout from '@/app/components/Layout/MainLayout';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    const { alert } = useModal();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userDropdownRef = useRef(null);

    // Stats based on your database schema
    const [stats, setStats] = useState({
        documents: 0,
        categories: 0,
        collections: 0,
        discussions: 0,
        bookmarks: 0,
        friends: 0,
        storage: '0 MB'
    });

    // Sample data
    const [recentActivities, setRecentActivities] = useState([]);
    const [favoriteDocuments, setFavoriteDocuments] = useState([]);
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const loggedIn = AuthService.isLoggedIn();
                
                if (!loggedIn) {
                    const token = localStorage.getItem('academvault_token');
                    const userStr = localStorage.getItem('academvault_user');
                    
                    if (token && userStr) {
                        AuthService.token = token;
                        AuthService.user = JSON.parse(userStr);
                    } else {
                        await alert({
                            title: 'Session Expired',
                            message: 'Please login to continue',
                            variant: 'warning'
                        });
                        router.push('/login');
                        return;
                    }
                }

                const currentUser = AuthService.getCurrentUser();
                setUser(currentUser);

                // Load all dashboard data
                loadDashboardData();

            } catch (error) {
                console.error('Dashboard error:', error);
                await alert({
                    title: 'Error',
                    message: 'Failed to load dashboard',
                    variant: 'danger'
                });
                router.push('/login');
            }
        };

        checkAuth();

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [router, alert]);

    const loadDashboardData = async () => {
        try {
            // In a real app, these would be API calls
            // For now, we'll use mock data based on your schema
            
            // Mock stats
            setStats({
                documents: 45,
                categories: 12,
                collections: 8,
                discussions: 5,
                bookmarks: 23,
                friends: 18,
                storage: '245 MB'
            });

            // Mock activities
            setRecentActivities([
                {
                    id: 1,
                    icon: 'fas fa-file-upload',
                    action: 'Uploaded document',
                    title: 'Research Paper.pdf',
                    time: '2 hours ago',
                    color: 'text-blue-400',
                    type: 'document'
                },
                {
                    id: 2,
                    icon: 'fas fa-users',
                    action: 'Joined discussion',
                    title: 'Quantum Computing',
                    time: 'Yesterday',
                    color: 'text-green-400',
                    type: 'discussion'
                },
                {
                    id: 3,
                    icon: 'fas fa-comment',
                    action: 'Commented on',
                    title: 'AI Ethics Paper',
                    time: '2 days ago',
                    color: 'text-purple-400',
                    type: 'comment'
                },
                {
                    id: 4,
                    icon: 'fas fa-share',
                    action: 'Shared collection',
                    title: 'Machine Learning Resources',
                    time: '1 week ago',
                    color: 'text-yellow-400',
                    type: 'share'
                },
                {
                    id: 5,
                    icon: 'fas fa-bookmark',
                    action: 'Bookmarked',
                    title: 'Deep Learning Tutorial',
                    time: '2 weeks ago',
                    color: 'text-red-400',
                    type: 'bookmark'
                }
            ]);

            // Mock favorite documents
            setFavoriteDocuments([
                {
                    id: 1,
                    title: 'Artificial Intelligence Ethics',
                    type: 'pdf',
                    author: 'Dr. Smith',
                    category: 'AI',
                    date: '2024-12-01',
                    size: '2.4 MB'
                },
                {
                    id: 2,
                    title: 'Quantum Computing Basics',
                    type: 'video',
                    author: 'Prof. Johnson',
                    category: 'Physics',
                    date: '2024-11-25',
                    duration: '45:23'
                },
                {
                    id: 3,
                    title: 'Machine Learning Trends 2024',
                    type: 'article_link',
                    author: 'Tech Review',
                    category: 'ML',
                    date: '2024-11-20',
                    source: 'arXiv'
                }
            ]);

            // Mock recent documents
            setRecentDocuments([
                {
                    id: 1,
                    title: 'Neural Networks Overview',
                    type: 'pdf',
                    views: 124,
                    date: 'Today'
                },
                {
                    id: 2,
                    title: 'Blockchain in Academia',
                    type: 'presentation',
                    views: 89,
                    date: 'Yesterday'
                },
                {
                    id: 3,
                    title: 'Climate Change Research',
                    type: 'article_link',
                    views: 256,
                    date: '3 days ago'
                },
                {
                    id: 4,
                    title: 'Bioinformatics Tutorial',
                    type: 'video',
                    views: 67,
                    date: '1 week ago'
                }
            ]);

            // Mock notifications
            setNotifications([
                { id: 1, type: 'friend_request', message: 'New friend request from Sarah', time: '5 min ago' },
                { id: 2, type: 'document_shared', message: 'Document shared with you', time: '1 hour ago' },
                { id: 3, type: 'discussion', message: 'New message in Quantum Computing', time: '2 hours ago' }
            ]);

            // Mock search history
            setSearchHistory([
                'machine learning algorithms',
                'quantum computing 2024',
                'artificial intelligence ethics',
                'neural networks tutorial',
                'blockchain research papers'
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'upload-document':
                router.push('/documents/upload');
                break;
            case 'create-category':
                router.push('/categories/new');
                break;
            case 'start-discussion':
                router.push('/discussions/new');
                break;
            case 'invite-friend':
                router.push('/friends/invite');
                break;
            case 'create-collection':
                router.push('/collections/new');
                break;
            case 'view-profile':
                router.push('/profile');
                break;
            default:
                break;
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

    const clearSearchHistory = () => {
        setSearchHistory([]);
        // In real app: API call to clear search history
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading dashboard...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Main Dashboard Header with Search */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Welcome Section */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {user?.name || 'Researcher'}! 👋
                        </h1>
                        <p className="text-gray-400">
                            {user?.type === 'teacher' ? 'Professor' : 'Student'} • {user?.institution || 'AcademVault'}
                            {user?.department && ` • ${user.department}`}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full lg:w-auto">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative">
                                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    placeholder="Search documents, discussions, or users..."
                                    className="w-full lg:w-96 pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                                >
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Based on database tables */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { 
                        title: 'Total Documents', 
                        value: stats.documents, 
                        icon: 'fas fa-file-alt', 
                        color: 'from-blue-500 to-cyan-500',
                        link: '/documents'
                    },
                    { 
                        title: 'Categories', 
                        value: stats.categories, 
                        icon: 'fas fa-folder', 
                        color: 'from-green-500 to-emerald-500',
                        link: '/categories'
                    },
                    { 
                        title: 'Collections', 
                        value: stats.collections, 
                        icon: 'fas fa-layer-group', 
                        color: 'from-purple-500 to-pink-500',
                        link: '/collections'
                    },
                    { 
                        title: 'Friends', 
                        value: stats.friends, 
                        icon: 'fas fa-users', 
                        color: 'from-orange-500 to-yellow-500',
                        link: '/friends'
                    },
                    { 
                        title: 'Discussions', 
                        value: stats.discussions, 
                        icon: 'fas fa-comments', 
                        color: 'from-indigo-500 to-blue-500',
                        link: '/discussions'
                    },
                    { 
                        title: 'Bookmarks', 
                        value: stats.bookmarks, 
                        icon: 'fas fa-bookmark', 
                        color: 'from-red-500 to-pink-500',
                        link: '/bookmarks'
                    },
                    { 
                        title: 'Storage Used', 
                        value: stats.storage, 
                        icon: 'fas fa-database', 
                        color: 'from-gray-600 to-gray-800',
                        link: '/storage'
                    },
                    { 
                        title: 'New Today', 
                        value: '3', 
                        icon: 'fas fa-bell', 
                        color: 'from-yellow-500 to-orange-500',
                        link: '/notifications'
                    },
                ].map((stat, index) => (
                    <Link 
                        key={index} 
                        href={stat.link}
                        className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 hover:border-gray-700 hover:transform hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <i className={`${stat.icon} text-white`}></i>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-gray-400">{stat.title}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left Column - Recent Activity & Recent Documents */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Activity */}
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <i className="fas fa-history text-blue-400"></i>
                                Recent Activity
                            </h3>
                            <Link 
                                href="/activity" 
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                View All
                                <i className="fas fa-arrow-right text-xs"></i>
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div 
                                    key={activity.id} 
                                    className="flex items-center gap-4 p-3 hover:bg-gray-800/30 rounded-xl transition-colors group"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color} bg-opacity-10`}>
                                        <i className={`${activity.icon} ${activity.color}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white truncate">
                                            <span className="font-medium">{activity.action}</span>{' '}
                                            <span className="text-blue-400">{activity.title}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">{activity.time}</p>
                                    </div>
                                    <i className="fas fa-chevron-right text-gray-500 group-hover:text-gray-400"></i>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Documents */}
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <i className="fas fa-file-alt text-green-400"></i>
                                Recent Documents
                            </h3>
                            <Link 
                                href="/documents" 
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                View All
                                <i className="fas fa-arrow-right text-xs"></i>
                            </Link>
                        </div>
                        
                        <div className="space-y-3">
                            {recentDocuments.map((doc) => (
                                <div 
                                    key={doc.id} 
                                    className="flex items-center gap-4 p-3 bg-gray-800/20 rounded-xl hover:bg-gray-800/40 transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                                        {doc.type === 'pdf' && <i className="fas fa-file-pdf text-red-400 text-xl"></i>}
                                        {doc.type === 'video' && <i className="fas fa-video text-blue-400 text-xl"></i>}
                                        {doc.type === 'presentation' && <i className="fas fa-presentation text-purple-400 text-xl"></i>}
                                        {doc.type === 'article_link' && <i className="fas fa-link text-green-400 text-xl"></i>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate">{doc.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-eye"></i>
                                                {doc.views}
                                            </span>
                                            <span>{doc.date}</span>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-700 rounded-lg">
                                        <i className="fas fa-ellipsis-h text-gray-400"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Quick Actions & Notifications */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <i className="fas fa-bolt text-yellow-400"></i>
                            Quick Actions
                        </h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleQuickAction('upload-document')}
                                className="w-full flex items-center gap-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all hover:scale-[1.02] group"
                            >
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fas fa-upload text-blue-400"></i>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">Upload Document</p>
                                    <p className="text-sm text-gray-400">Add research materials</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleQuickAction('create-category')}
                                className="w-full flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all hover:scale-[1.02] group"
                            >
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fas fa-folder-plus text-green-400"></i>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">Create Category</p>
                                    <p className="text-sm text-gray-400">Organize your research</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleQuickAction('start-discussion')}
                                className="w-full flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all hover:scale-[1.02] group"
                            >
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fas fa-comment-medical text-purple-400"></i>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">Start Discussion</p>
                                    <p className="text-sm text-gray-400">Discuss with peers</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleQuickAction('invite-friend')}
                                className="w-full flex items-center gap-3 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-all hover:scale-[1.02] group"
                            >
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fas fa-user-plus text-orange-400"></i>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">Invite Friend</p>
                                    <p className="text-sm text-gray-400">Collaborate with others</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleQuickAction('create-collection')}
                                className="w-full flex items-center gap-3 p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-all hover:scale-[1.02] group"
                            >
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fas fa-layer-group text-indigo-400"></i>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">Create Collection</p>
                                    <p className="text-sm text-gray-400">Group related documents</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <i className="fas fa-bell text-red-400"></i>
                                Notifications
                                {notifications.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        {notifications.length}
                                    </span>
                                )}
                            </h3>
                            <Link 
                                href="/notifications" 
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                Mark all as read
                            </Link>
                        </div>
                        
                        <div className="space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className="p-3 bg-gray-800/20 rounded-xl hover:bg-gray-800/40 transition-colors"
                                    >
                                        <p className="text-white text-sm mb-1">{notification.message}</p>
                                        <p className="text-xs text-gray-500">{notification.time}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No new notifications</p>
                            )}
                        </div>
                    </div>

                    {/* Research Stats */}
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <i className="fas fa-chart-line text-green-400"></i>
                            Research Stats
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Simple stats visualization */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Documents Added</span>
                                    <span className="text-white">12 this week</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Collaborations</span>
                                    <span className="text-white">8 active</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Research Time</span>
                                    <span className="text-white">24h this week</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '90%' }}></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-white">45</p>
                                <p className="text-xs text-gray-400">Total Docs</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">18</p>
                                <p className="text-xs text-gray-400">Friends</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">245</p>
                                <p className="text-xs text-gray-400">MB Used</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search History & Favorites */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search History */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <i className="fas fa-search-history text-blue-400"></i>
                            Recent Searches
                        </h3>
                        {searchHistory.length > 0 && (
                            <button 
                                onClick={clearSearchHistory}
                                className="text-sm text-gray-400 hover:text-gray-300"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {searchHistory.length > 0 ? (
                            searchHistory.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSearchQuery(search)}
                                    className="px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    {search}
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent searches</p>
                        )}
                    </div>
                </div>

                {/* Favorite Resources */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <i className="fas fa-star text-yellow-400"></i>
                            Favorite Resources
                        </h3>
                        <Link 
                            href="/bookmarks" 
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                            View All
                            <i className="fas fa-arrow-right text-xs"></i>
                        </Link>
                    </div>
                    
                    <div className="space-y-3">
                        {favoriteDocuments.map((doc) => (
                            <div 
                                key={doc.id} 
                                className="flex items-center gap-3 p-3 bg-gray-800/20 rounded-xl hover:bg-gray-800/40 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                                    <i className="fas fa-star text-yellow-400"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white truncate">{doc.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{doc.author}</span>
                                        <span className="text-xs px-2 py-1 bg-gray-800 rounded">{doc.category}</span>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-700 rounded-lg">
                                    <i className="fas fa-ellipsis-h text-gray-400"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Getting Started Section */}
            <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Complete Your Profile</h3>
                        <p className="text-gray-400">Add more details to get personalized recommendations</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-sm text-gray-400">Profile completeness</span>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: '65%' }}></div>
                                </div>
                                <span className="text-white font-medium">65%</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => router.push('/profile/edit')}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Complete Profile
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}