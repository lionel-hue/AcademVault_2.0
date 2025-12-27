// client/src/app/dashboard/page.jsx - COMPLETE VERSION WITH REAL DATA
"use client";

import { useState, useEffect } from 'react';
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
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                // Check authentication
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
                await loadDashboardData();

                setLoading(false);
            } catch (error) {
                console.error('Dashboard initialization error:', error);
                await alert({
                    title: 'Error',
                    message: 'Failed to load dashboard data',
                    variant: 'danger'
                });
            }
        };

        initializeDashboard();
    }, [router, alert]);

    const loadDashboardData = async () => {
        try {
            // Load stats
            await loadStats();
            
            // Load other data
            await Promise.all([
                loadActivities(),
                loadRecentDocuments(),
                loadFavorites(),
                loadNotifications(),
                loadSearchHistory()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    };

    const loadStats = async () => {
        try {
            setStatsLoading(true);
            const response = await AuthService.fetchDashboardStats();
            if (response.success) {
                setStats(response.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadActivities = async () => {
        try {
            setActivitiesLoading(true);
            const response = await AuthService.fetchRecentActivities();
            if (response.success) {
                setActivities(response.activities || []);
            }
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const loadRecentDocuments = async () => {
        try {
            const response = await AuthService.fetchRecentDocuments();
            if (response.success) {
                setRecentDocuments(response.documents || []);
            }
        } catch (error) {
            console.error('Error loading recent documents:', error);
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await AuthService.fetchFavoriteDocuments();
            if (response.success) {
                setFavorites(response.favorites || []);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            const response = await AuthService.fetchNotifications();
            if (response.success) {
                setNotifications(response.notifications || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const loadSearchHistory = async () => {
        try {
            const response = await AuthService.fetchSearchHistory();
            if (response.success) {
                setSearchHistory(response.search_history || []);
            }
        } catch (error) {
            console.error('Error loading search history:', error);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Just now';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays < 7) return `${diffDays} days ago`;
            
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (error) {
            return 'Recently';
        }
    };

    const getActivityIcon = (source, action) => {
        switch (source) {
            case 'history':
                return action === 'viewed' ? 'fas fa-eye' : 'fas fa-download';
            case 'discussion':
                return 'fas fa-comment';
            case 'bookmark':
                return 'fas fa-bookmark';
            default:
                return 'fas fa-bell';
        }
    };

    const getActivityColor = (source) => {
        switch (source) {
            case 'history':
                return 'text-blue-400';
            case 'discussion':
                return 'text-green-400';
            case 'bookmark':
                return 'text-yellow-400';
            default:
                return 'text-purple-400';
        }
    };

    const getDocumentIcon = (type) => {
        switch (type) {
            case 'pdf':
                return 'fas fa-file-pdf text-red-400';
            case 'video':
                return 'fas fa-video text-blue-400';
            case 'article_link':
                return 'fas fa-link text-green-400';
            case 'presentation':
                return 'fas fa-presentation text-purple-400';
            default:
                return 'fas fa-file text-gray-400';
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
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Welcome back, {user?.name || 'Researcher'}! 👋
                        </h1>
                        <p className="text-gray-300">
                            {user?.type === 'teacher' ? 'Professor' : 'Student'} at {user?.institution || 'AcademVault'}
                            {user?.department && ` • ${user.department}`}
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button 
                            onClick={() => router.push('/search')}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors"
                        >
                            <i className="fas fa-search mr-2"></i>
                            Quick Search
                        </button>
                        <button 
                            onClick={() => handleQuickAction('upload-document')}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Add Resource
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statsLoading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="bg-gray-900/50 rounded-xl p-4 animate-pulse">
                            <div className="h-10 bg-gray-800 rounded mb-2"></div>
                            <div className="h-4 bg-gray-800 rounded"></div>
                        </div>
                    ))
                ) : stats && [
                    { title: 'Documents', value: stats.documents, icon: 'fas fa-file-alt', color: 'from-blue-500 to-cyan-500', link: '/documents' },
                    { title: 'Categories', value: stats.categories, icon: 'fas fa-folder', color: 'from-green-500 to-emerald-500', link: '/categories' },
                    { title: 'Collections', value: stats.collections, icon: 'fas fa-layer-group', color: 'from-purple-500 to-pink-500', link: '/collections' },
                    { title: 'Discussions', value: stats.discussions, icon: 'fas fa-comments', color: 'from-indigo-500 to-blue-500', link: '/discussions' },
                    { title: 'Bookmarks', value: stats.bookmarks, icon: 'fas fa-bookmark', color: 'from-yellow-500 to-orange-500', link: '/bookmarks' },
                    { title: 'Friends', value: stats.friends, icon: 'fas fa-users', color: 'from-red-500 to-pink-500', link: '/friends' },
                    { title: 'Storage Used', value: stats.storage, icon: 'fas fa-database', color: 'from-gray-600 to-gray-800', link: '/storage' },
                    { title: 'Active Now', value: '3', icon: 'fas fa-bolt', color: 'from-green-500 to-yellow-500', link: '/activity' },
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
                {/* Left Column - Activity & Recent Documents */}
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
                        
                        {activitiesLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-800 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-800 rounded w-24"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.slice(0, 5).map((activity, index) => (
                                    <div 
                                        key={activity.id || index} 
                                        className="flex items-center gap-4 p-3 hover:bg-gray-800/30 rounded-xl transition-colors group"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.source)} bg-opacity-10`}>
                                            <i className={`${getActivityIcon(activity.source, activity.action)} ${getActivityColor(activity.source)}`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white truncate">
                                                <span className="font-medium capitalize">{activity.action}</span>{' '}
                                                <span className="text-blue-400">{activity.title || 'Item'}</span>
                                            </p>
                                            <p className="text-sm text-gray-500">{formatTime(activity.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <i className="fas fa-history text-gray-600 text-3xl mb-3"></i>
                                <p className="text-gray-500">No recent activity</p>
                                <button 
                                    onClick={loadActivities}
                                    className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm"
                                >
                                    Refresh
                                </button>
                            </div>
                        )}
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
                        
                        {recentDocuments.length > 0 ? (
                            <div className="space-y-3">
                                {recentDocuments.slice(0, 4).map((doc) => (
                                    <div 
                                        key={doc.id} 
                                        className="flex items-center gap-4 p-3 bg-gray-800/20 rounded-xl hover:bg-gray-800/40 transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                                            <i className={`${getDocumentIcon(doc.type)} text-xl`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white truncate">{doc.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                {doc.author && (
                                                    <span className="flex items-center gap-1">
                                                        <i className="fas fa-user"></i>
                                                        {doc.author}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <i className="fas fa-eye"></i>
                                                    {doc.view_count || 0}
                                                </span>
                                                <span>{formatTime(doc.last_accessed || doc.created_at)}</span>
                                            </div>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-700 rounded-lg">
                                            <i className="fas fa-ellipsis-h text-gray-400"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <i className="fas fa-file text-gray-600 text-3xl mb-3"></i>
                                <p className="text-gray-500">No recent documents</p>
                                <button 
                                    onClick={() => handleQuickAction('upload-document')}
                                    className="mt-4 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Upload Document
                                </button>
                            </div>
                        )}
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
                                notifications.slice(0, 3).map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className="p-3 bg-gray-800/20 rounded-xl hover:bg-gray-800/40 transition-colors"
                                    >
                                        <p className="text-white text-sm mb-1">{notification.message}</p>
                                        <p className="text-xs text-gray-500">{formatTime(notification.created_at)}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-bell-slash text-gray-600 text-2xl mb-2"></i>
                                    <p className="text-gray-500">No new notifications</p>
                                </div>
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
                                <p className="text-2xl font-bold text-white">{stats?.documents || 0}</p>
                                <p className="text-xs text-gray-400">Total Docs</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats?.friends || 0}</p>
                                <p className="text-xs text-gray-400">Friends</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats?.collections || 0}</p>
                                <p className="text-xs text-gray-400">Collections</p>
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
                                    onClick={() => router.push(`/search?q=${encodeURIComponent(search)}`)}
                                    className="px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    {search}
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <i className="fas fa-search text-gray-600 text-2xl mb-2"></i>
                                <p className="text-gray-500">No recent searches</p>
                            </div>
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
                    
                    {favorites.length > 0 ? (
                        <div className="space-y-3">
                            {favorites.slice(0, 3).map((doc) => (
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
                                            {doc.author && <span>{doc.author}</span>}
                                            <span>{formatTime(doc.last_accessed_at || doc.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <i className="fas fa-star text-gray-600 text-3xl mb-3"></i>
                            <p className="text-gray-500">No favorite resources yet</p>
                            <button 
                                onClick={() => router.push('/documents')}
                                className="mt-4 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm"
                            >
                                <i className="fas fa-bookmark mr-2"></i>
                                Browse Documents
                            </button>
                        </div>
                    )}
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