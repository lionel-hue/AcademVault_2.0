// client/src/app/dashboard/page.jsx - FIXED VERSION
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
  const [isMobile, setIsMobile] = useState(false);

  // Default stats
  const defaultStats = {
    documents: 0,
    categories: 0,
    collections: 0,
    discussions: 0,
    bookmarks: 0,
    friends: 0,
    storage: '0 MB'
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const loggedIn = AuthService.isLoggedIn();
        if (!loggedIn) {
          await alert({
            title: 'Session Expired',
            message: 'Please login to continue',
            variant: 'warning'
          });
          router.push('/login');
          return;
        }

        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          await alert({
            title: 'Session Error',
            message: 'Please login again',
            variant: 'danger'
          });
          router.push('/login');
          return;
        }

        setUser(currentUser);
        await loadStats();
        await loadActivities();
        await loadRecentDocuments();
        await loadFavorites();
        await loadNotifications();
        await loadSearchHistory();
        setLoading(false);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router, alert]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await AuthService.fetchDashboardStats();
      if (response.success) {
        setStats(response.stats);
      } else {
        setStats(defaultStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error.message);
      setStats(defaultStats);
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
      console.error('Error loading activities:', error.message);
      setActivities([]);
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
      console.error('Error loading recent documents:', error.message);
      setRecentDocuments([]);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await AuthService.fetchFavoriteDocuments();
      if (response.success) {
        setFavorites(response.favorites || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error.message);
      setFavorites([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await AuthService.fetchNotifications();
      if (response.success) {
        setNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error.message);
      setNotifications([]);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await AuthService.fetchSearchHistory();
      if (response.success) {
        setSearchHistory(response.search_history || []);
      }
    } catch (error) {
      console.error('Error loading search history:', error.message);
      setSearchHistory([]);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Recently';
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
      case 'history': return action === 'viewed' ? 'fas fa-eye' : 'fas fa-download';
      case 'discussion': return 'fas fa-comment';
      case 'bookmark': return 'fas fa-bookmark';
      default: return 'fas fa-bell';
    }
  };

  const getActivityColor = (source) => {
    switch (source) {
      case 'history': return 'text-blue-400';
      case 'discussion': return 'text-green-400';
      case 'bookmark': return 'text-yellow-400';
      default: return 'text-purple-400';
    }
  };

  const getDocumentIcon = (type) => {
    if (!type) return 'fas fa-file text-gray-400';
    switch (type.toLowerCase()) {
      case 'pdf': return 'fas fa-file-pdf text-red-400';
      case 'video': return 'fas fa-video text-blue-400';
      case 'article_link': return 'fas fa-link text-green-400';
      case 'presentation': return 'fas fa-presentation text-purple-400';
      default: return 'fas fa-file text-gray-400';
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'upload-document': router.push('/documents/upload'); break;
      case 'create-category': router.push('/categories/new'); break;
      case 'start-discussion': router.push('/discussions/new'); break;
      case 'invite-friend': router.push('/friends/invite'); break;
      case 'create-collection': router.push('/collections/new'); break;
      case 'view-profile': router.push('/profile'); break;
      default: break;
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      await loadStats();
      await loadActivities();
      await loadRecentDocuments();
      await loadFavorites();
      await loadNotifications();
      await loadSearchHistory();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setLoading(false);
    }
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

  const statItems = [
    { title: 'Documents', value: stats?.documents || 0, icon: 'fas fa-file-alt', color: 'from-blue-500 to-cyan-500', link: '/documents' },
    { title: 'Categories', value: stats?.categories || 0, icon: 'fas fa-folder', color: 'from-green-500 to-emerald-500', link: '/categories' },
    { title: 'Collections', value: stats?.collections || 0, icon: 'fas fa-layer-group', color: 'from-purple-500 to-pink-500', link: '/collections' },
    { title: 'Discussions', value: stats?.discussions || 0, icon: 'fas fa-comments', color: 'from-indigo-500 to-blue-500', link: '/discussions' },
    { title: 'Bookmarks', value: stats?.bookmarks || 0, icon: 'fas fa-bookmark', color: 'from-yellow-500 to-orange-500', link: '/bookmarks' },
    { title: 'Friends', value: stats?.friends || 0, icon: 'fas fa-users', color: 'from-red-500 to-pink-500', link: '/friends' },
    { title: 'Storage Used', value: stats?.storage || '0 MB', icon: 'fas fa-database', color: 'from-gray-600 to-gray-800', link: '/storage' },
    { title: 'Active Now', value: '3', icon: 'fas fa-bolt', color: 'from-green-500 to-yellow-500', link: '/activity' },
  ];

  return (
    <MainLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-gray-800 rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'Researcher'}! 👋
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              {user?.type === 'teacher' ? 'Professor' : 'Student'} at {user?.institution || 'AcademVault'}
              {user?.department && ` • ${user.department}`}
            </p>
          </div>
          <div className="flex gap-2 md:gap-3 mt-3 md:mt-0">
            <button
              onClick={refreshDashboard}
              className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg md:rounded-xl text-white font-medium transition-colors text-sm md:text-base"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
            <button
              onClick={() => handleQuickAction('upload-document')}
              className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg md:rounded-xl text-white font-medium transition-all text-sm md:text-base"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - MOBILE OPTIMIZED */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        {statsLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-900/50 rounded-lg md:rounded-xl p-2 md:p-3 animate-pulse">
              <div className="h-6 md:h-8 bg-gray-800 rounded mb-1 md:mb-2"></div>
              <div className="h-3 md:h-4 bg-gray-800 rounded"></div>
            </div>
          ))
        ) : (
          statItems.map((stat, index) => (
            <Link
              key={`stat-${index}`}
              href={stat.link}
              className="bg-gray-900/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 border border-gray-800 hover:border-gray-700 hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-white text-xs md:text-sm`}></i>
                </div>
                <div className="text-right">
                  <p className="text-base md:text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs md:text-sm text-gray-400">{stat.title}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Left Column - Activity & Recent Documents */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-history text-blue-400"></i>
                Recent Activity
              </h3>
              <button
                onClick={loadActivities}
                className="text-xs md:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <i className="fas fa-sync-alt text-xs"></i>
                Refresh
              </button>
            </div>
            {activitiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`activity-skeleton-${index}`} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-800 rounded mb-2"></div>
                      <div className="h-2 bg-gray-800 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity, index) => (
                  <div
                    key={`activity-${activity.id || index}`}
                    className="flex items-center gap-3 p-2 md:p-3 hover:bg-gray-800/30 rounded-lg md:rounded-xl transition-colors group"
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.source)} bg-opacity-10`}>
                      <i className={`${getActivityIcon(activity.source, activity.action)} ${getActivityColor(activity.source)} text-sm md:text-base`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm md:text-base truncate">
                        <span className="font-medium capitalize">{activity.action}</span>{' '}
                        <span className="text-blue-400">{activity.title || 'Item'}</span>
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">{formatTime(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 md:py-6">
                <i className="fas fa-history text-gray-600 text-2xl md:text-3xl mb-2 md:mb-3"></i>
                <p className="text-gray-500 text-sm md:text-base">No recent activity</p>
                <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">Start by uploading a document or browsing resources</p>
              </div>
            )}
          </div>

          {/* Recent Documents */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-file-alt text-green-400"></i>
                Recent Documents
              </h3>
              <button
                onClick={loadRecentDocuments}
                className="text-xs md:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <i className="fas fa-sync-alt text-xs"></i>
                Refresh
              </button>
            </div>
            {recentDocuments.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {recentDocuments.slice(0, 4).map((doc, index) => (
                  <div
                    key={`doc-${doc.id || index}`}
                    className="flex items-center gap-3 p-2 md:p-3 bg-gray-800/20 rounded-lg md:rounded-xl hover:bg-gray-800/40 transition-colors group"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                      <i className={`${getDocumentIcon(doc.type)} text-base md:text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm md:text-base truncate">{doc.title || 'Untitled Document'}</h4>
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500">
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
                        <span>{formatTime(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 md:py-6">
                <i className="fas fa-file text-gray-600 text-2xl md:text-3xl mb-2 md:mb-3"></i>
                <p className="text-gray-500 text-sm md:text-base">No documents found</p>
                <button
                  onClick={() => handleQuickAction('upload-document')}
                  className="mt-3 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs md:text-sm"
                >
                  <i className="fas fa-plus mr-1 md:mr-2"></i>
                  Upload Your First Document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions & Notifications */}
        <div className="space-y-4 md:space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-800">
            <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
              <i className="fas fa-bolt text-yellow-400"></i>
              Quick Actions
            </h3>
            <div className="space-y-2 md:space-y-3">
              {[
                { icon: 'fas fa-upload', color: 'blue', label: 'Upload Document', action: 'upload-document', desc: 'Add research materials' },
                { icon: 'fas fa-folder-plus', color: 'green', label: 'Create Category', action: 'create-category', desc: 'Organize your research' },
                { icon: 'fas fa-comment-medical', color: 'purple', label: 'Start Discussion', action: 'start-discussion', desc: 'Discuss with peers' },
                { icon: 'fas fa-user-plus', color: 'orange', label: 'Invite Friend', action: 'invite-friend', desc: 'Collaborate with others' },
                { icon: 'fas fa-layer-group', color: 'indigo', label: 'Create Collection', action: 'create-collection', desc: 'Group related documents' },
              ].map((action, index) => (
                <button
                  key={`action-${index}`}
                  onClick={() => handleQuickAction(action.action)}
                  className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-800/20 hover:bg-gray-800/40 border border-gray-700 rounded-lg md:rounded-xl transition-all hover:scale-[1.02] group"
                >
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center bg-${action.color}-500/20`}>
                    <i className={`${action.icon} text-${action.color}-400 text-sm md:text-base`}></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white text-sm md:text-base">{action.label}</p>
                    <p className="text-xs md:text-sm text-gray-400">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-bell text-red-400"></i>
                Notifications
                {notifications.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </h3>
              <button
                onClick={loadNotifications}
                className="text-xs md:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <i className="fas fa-sync-alt text-xs"></i>
              </button>
            </div>
            <div className="space-y-2 md:space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification, index) => (
                  <div
                    key={`notif-${notification.id || index}`}
                    className="p-2 md:p-3 bg-gray-800/20 rounded-lg md:rounded-xl hover:bg-gray-800/40 transition-colors"
                  >
                    <p className="text-white text-xs md:text-sm mb-1">{notification.message || notification.title}</p>
                    <p className="text-xs text-gray-500">{formatTime(notification.created_at)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 md:py-4">
                  <i className="fas fa-bell-slash text-gray-600 text-xl md:text-2xl mb-1 md:mb-2"></i>
                  <p className="text-gray-500 text-sm md:text-base">No new notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Research Stats */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-800">
            <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
              <i className="fas fa-chart-line text-green-400"></i>
              Research Stats
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-400">Documents Added</span>
                  <span className="text-white">{stats?.documents || 0} total</span>
                </div>
                <div className="w-full h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${Math.min((stats?.documents || 0) * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-400">Categories</span>
                  <span className="text-white">{stats?.categories || 0} created</span>
                </div>
                <div className="w-full h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${Math.min((stats?.categories || 0) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 md:gap-4 text-center">
              <div>
                <p className="text-lg md:text-xl font-bold text-white">{stats?.documents || 0}</p>
                <p className="text-xs text-gray-400">Docs</p>
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold text-white">{stats?.friends || 0}</p>
                <p className="text-xs text-gray-400">Friends</p>
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold text-white">{stats?.collections || 0}</p>
                <p className="text-xs text-gray-400">Collections</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search History & Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Search History */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-search-history text-blue-400"></i>
              Recent Searches
            </h3>
            {searchHistory.length > 0 && (
              <button
                onClick={clearSearchHistory}
                className="text-xs md:text-sm text-gray-400 hover:text-gray-300"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {searchHistory.length > 0 ? (
              searchHistory.map((search, index) => (
                <button
                  key={`search-${index}`}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(search)}`)}
                  className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-xs md:text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {search}
                </button>
              ))
            ) : (
              <div className="text-center py-3 md:py-4 w-full">
                <i className="fas fa-search text-gray-600 text-xl md:text-2xl mb-1 md:mb-2"></i>
                <p className="text-gray-500 text-sm md:text-base">No recent searches</p>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Resources */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-star text-yellow-400"></i>
              Favorite Resources
            </h3>
            <button
              onClick={loadFavorites}
              className="text-xs md:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <i className="fas fa-sync-alt text-xs"></i>
            </button>
          </div>
          {favorites.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {favorites.slice(0, 3).map((doc, index) => (
                <div
                  key={`fav-${doc.id || index}`}
                  className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-800/20 rounded-lg md:rounded-xl hover:bg-gray-800/40 transition-colors group"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                    <i className="fas fa-star text-yellow-400 text-sm md:text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm md:text-base truncate">{doc.title || 'Favorite Document'}</h4>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                      {doc.author && <span>{doc.author}</span>}
                      <span>{formatTime(doc.last_accessed_at || doc.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 md:py-4">
              <i className="fas fa-star text-gray-600 text-xl md:text-2xl mb-1 md:mb-2"></i>
              <p className="text-gray-500 text-sm md:text-base">No favorite resources yet</p>
              <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">Bookmark documents to see them here</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}