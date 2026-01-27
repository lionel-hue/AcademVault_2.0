"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import { MobileCard, useIsMobile } from '@/app/components/UI/MobileOptimized';

export default function FriendsPage() {
  const router = useRouter();
  const { alert, confirm, prompt } = useModal();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [stats, setStats] = useState({ total_friends: 0, pending_requests: 0, colleagues: 0, mentors: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // NEW: Toggle filter state
  const [filterType, setFilterType] = useState('all'); // 'all', 'friends', 'non-friends'
  const [friendFilterOn, setFriendFilterOn] = useState(false); // Toggle state

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFriends(),
        loadFriendRequests(),
        loadFriendStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const response = await AuthService.fetchFriends();
      if (response.success) {
        setFriends(response.data || []);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await AuthService.fetchFriendRequests();
      if (response.success) {
        setFriendRequests(response.data || []);
      } else {
        setFriendRequests([]);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
      setFriendRequests([]);
    }
  };

  const loadFriendStats = async () => {
    try {
      const response = await AuthService.getFriendStats();
      if (response.success) {
        setStats(response.data || { total_friends: 0, pending_requests: 0, colleagues: 0, mentors: 0 });
      }
    } catch (error) {
      console.error('Error loading friend stats:', error);
    }
  };

  // UPDATED: Modified search function to include friend filter
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await AuthService.searchUsers(searchQuery.trim(), friendFilterOn);
      console.log('Search response:', response);
      
      if (response.success) {
        let results = response.data || [];
        
        // Apply filter if needed
        if (friendFilterOn && filterType !== 'all') {
          if (filterType === 'friends') {
            // Filter to show only friends
            results = results.filter(user => user.is_friend === true);
          } else if (filterType === 'non-friends') {
            // Filter to show only non-friends
            results = results.filter(user => !user.is_friend);
          }
        }
        
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      await alert({
        title: 'Search Error',
        message: error.message || 'Failed to search users. Please try again.',
        variant: 'danger'
      });
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // NEW: Function to handle toggle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
    // If we have search results, re-filter them
    if (searchResults.length > 0 && searchQuery) {
      setSearchResults(prevResults => {
        if (type === 'all') return prevResults;
        if (type === 'friends') {
          return prevResults.filter(user => user.is_friend === true);
        }
        if (type === 'non-friends') {
          return prevResults.filter(user => !user.is_friend);
        }
        return prevResults;
      });
    }
  };

  // NEW: Toggle the friend filter
  const toggleFriendFilter = () => {
    setFriendFilterOn(!friendFilterOn);
    // If turning off the filter, show all results
    if (!friendFilterOn === false) {
      // Reset filter
      setFilterType('all');
      // Re-run search if there's a query
      if (searchQuery) {
        handleSearch(new Event('submit'));
      }
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await AuthService.acceptFriendRequest(requestId);
      if (response.success) {
        await alert({
          title: 'Friend Request Accepted',
          message: 'You are now friends!',
          variant: 'success'
        });
        await loadAllData();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to accept friend request',
        variant: 'danger'
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    const confirmed = await confirm({
      title: 'Reject Friend Request',
      message: 'Are you sure you want to reject this request?',
      variant: 'warning'
    });
    
    if (!confirmed) return;
    
    try {
      const response = await AuthService.rejectFriendRequest(requestId);
      if (response.success) {
        await loadFriendRequests();
        await loadFriendStats();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to reject friend request',
        variant: 'danger'
      });
    }
  };

  const handleSendRequest = async (userId) => {
    const message = await prompt({
      title: 'Send Friend Request',
      message: 'Add a personal message (optional):',
      placeholder: 'Hi! I would like to connect with you...',
      variant: 'default'
    });
    
    if (message === null) return;
    
    try {
      const response = await AuthService.sendFriendRequest(userId, message);
      if (response.success) {
        await alert({
          title: 'Request Sent',
          message: 'Friend request sent successfully!',
          variant: 'success'
        });
        // Update the search result to show pending status
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, is_friend: 'pending_sent' } : user
        ));
      }
    } catch (error) {
      console.error('Error sending request:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to send friend request',
        variant: 'danger'
      });
    }
  };

  const handleRemoveFriend = async (friendId) => {
    const confirmed = await confirm({
      title: 'Remove Friend',
      message: 'Are you sure you want to remove this friend?',
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      const response = await AuthService.removeFriend(friendId);
      if (response.success) {
        await alert({
          title: 'Friend Removed',
          message: 'Friend removed successfully',
          variant: 'success'
        });
        await loadFriends();
        await loadFriendStats();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to remove friend',
        variant: 'danger'
      });
    }
  };

  const handleStartChat = async (friend) => {
    try {
      // Create a one-on-one discussion
      const discussionData = {
        title: `Chat with ${friend.name}`,
        description: `Private conversation with ${friend.name}`,
        type: 'general',
        privacy: 'private',
        initial_members: [friend.id]
      };
      
      const response = await AuthService.createDiscussion(discussionData);
      if (response.success) {
        await alert({
          title: 'Discussion Created',
          message: `Started a conversation with ${friend.name}`,
          variant: 'success'
        });
        setShowUserModal(false);
        router.push(`/discussions/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      await alert({
        title: 'Error',
        message: 'Failed to start conversation. Please try again.',
        variant: 'danger'
      });
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getProfileImage = (user) => {
    if (!user) {
      return `https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=128`;
    }
    
    if (user.profile_image) {
      if (user.profile_image.startsWith('http://') || user.profile_image.startsWith('https://')) {
        return user.profile_image;
      }
      if (user.profile_image.startsWith('storage/') || user.profile_image.startsWith('profile_images/')) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        return `${apiUrl.replace('/api', '')}/storage/${user.profile_image}`;
      }
      return user.profile_image;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=fff&size=128`;
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 5) return 'Active now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };

  // NEW: Helper function to render friend status badge
  const renderFriendStatus = (user) => {
    if (user.is_friend === true || user.is_friend === 'accepted') {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
          <i className="fas fa-check mr-1 text-xs"></i>
          Friend
        </span>
      );
    } else if (user.is_friend === 'pending_sent') {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
          <i className="fas fa-clock mr-1 text-xs"></i>
          Request Sent
        </span>
      );
    } else if (user.is_friend === 'pending_received') {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
          <i className="fas fa-user-plus mr-1 text-xs"></i>
          Request Received
        </span>
      );
    }
    return null;
  };

  const MobileTabs = ({ tabs, activeTab, onChange }) => (
    <div className="flex overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4">
      <div className="flex gap-2 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 min-h-[44px] ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'all', label: 'All Friends', icon: 'fas fa-users', count: stats.total_friends },
    { id: 'requests', label: 'Requests', icon: 'fas fa-user-plus', count: stats.pending_requests },
    { id: 'search', label: 'Find', icon: 'fas fa-search', count: 0 },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
            Friends & Network
          </h1>
          <p className="text-gray-400 text-xs md:text-sm lg:text-base">
            Connect and collaborate with researchers worldwide
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 md:mb-6">
          {isMobile ? (
            <MobileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          ) : (
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Friends', value: stats.total_friends, icon: 'fas fa-users', color: 'from-blue-500 to-cyan-500' },
                { label: 'Pending', value: stats.pending_requests, icon: 'fas fa-clock', color: 'from-yellow-500 to-orange-500' },
                { label: 'Colleagues', value: stats.colleagues, icon: 'fas fa-briefcase', color: 'from-green-500 to-emerald-500' },
                { label: 'Mentors', value: stats.mentors, icon: 'fas fa-graduation-cap', color: 'from-purple-500 to-pink-500' },
              ].map((stat, index) => (
                <MobileCard key={index} className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-400">{stat.label}</p>
                      <p className="text-lg md:text-xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <i className={`${stat.icon} text-white text-sm md:text-base`}></i>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>

            {/* Friends List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading friends...</p>
              </div>
            ) : friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {friends.map((friend) => (
                  <MobileCard key={friend.id} className="p-4">
                    <div 
                      className="flex items-start gap-3 mb-3 cursor-pointer"
                      onClick={() => handleViewProfile(friend)}
                    >
                      <div className="relative">
                        <img 
                          src={getProfileImage(friend)} 
                          alt={friend.name} 
                          className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-blue-500/50 object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm md:text-base truncate">
                          {friend.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400 truncate">
                          {friend.type === 'teacher' ? 'Professor' : 'Student'} • {friend.institution || 'No institution'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {friend.relationship_type && (
                            <span className="capitalize">{friend.relationship_type}</span>
                          )}
                          {friend.relationship_type && friend.accepted_at && ' • '}
                          {friend.accepted_at && `Friends since ${new Date(friend.accepted_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                        </p>
                      </div>
                    </div>

                    {/* Shared Interests */}
                    {friend.shared_interests && friend.shared_interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {friend.shared_interests.slice(0, 3).map((interest, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(friend)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px]"
                      >
                        <i className="fas fa-user mr-2"></i>
                        View Profile
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs md:text-sm transition-colors min-h-[44px]"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </div>
                  </MobileCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                <i className="fas fa-user-friends text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-bold text-white mb-2">No Friends Yet</h3>
                <p className="text-gray-400 mb-6">Start building your network</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  <i className="fas fa-search mr-2"></i>
                  Find Friends
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading friend requests...</p>
              </div>
            ) : friendRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {friendRequests.map((request) => (
                  <MobileCard key={request.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={getProfileImage(request)} 
                        alt={request.name} 
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-yellow-500/50 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm md:text-base truncate">
                          {request.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400 truncate">
                          {request.type === 'teacher' ? 'Professor' : 'Student'} • {request.institution || 'No institution'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.sent_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <p className="text-xs md:text-sm text-gray-300 mb-3 p-2 bg-gray-800/30 rounded">
                        "{request.message}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px]"
                      >
                        <i className="fas fa-check mr-2"></i>
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px]"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Reject
                      </button>
                    </div>
                  </MobileCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-bold text-white mb-2">No Pending Requests</h3>
                <p className="text-gray-400">You're all caught up!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            {/* Search Form - UPDATED with Toggle Filter */}
            <form onSubmit={handleSearch} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value === '') {
                        setSearchResults([]);
                      }
                    }}
                    placeholder="Search by name, email, or institution..."
                    className="w-full pl-10 pr-32 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setFilterType('all');
                        setFriendFilterOn(false);
                      }}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={searching || !searchQuery.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searching ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Searching...
                        </>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                </div>

                {/* NEW: Toggle Filter Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={friendFilterOn}
                          onChange={toggleFriendFilter}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          friendFilterOn ? 'bg-blue-600' : 'bg-gray-700'
                        }`}>
                          <div className={`bg-white w-3 h-3 rounded-full transform transition-transform duration-300 ${
                            friendFilterOn ? 'translate-x-5' : 'translate-x-0'
                          }`}></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-300">Filter by friend status</span>
                    </label>
                  </div>

                  {/* Filter Options (only visible when toggle is on) */}
                  {friendFilterOn && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleFilterChange('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          filterType === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        All Users
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFilterChange('friends')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          filterType === 'friends'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        Friends Only
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFilterChange('non-friends')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          filterType === 'non-friends'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        Non-Friends
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Search Results */}
            {searching ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                {/* Results Summary */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">
                    Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                    {friendFilterOn && filterType !== 'all' && (
                      <span className="ml-2 text-blue-400">
                        (Filtered: {filterType === 'friends' ? 'Friends Only' : 'Non-Friends Only'})
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {searchResults.map((user) => (
                    <MobileCard key={user.id} className="p-4">
                      <div 
                        className="flex items-start gap-3 mb-3 cursor-pointer"
                        onClick={() => handleViewProfile(user)}
                      >
                        <img 
                          src={getProfileImage(user)} 
                          alt={user.name} 
                          className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-700 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-white text-sm md:text-base truncate">
                                {user.name}
                              </h3>
                              <p className="text-xs md:text-sm text-gray-400 truncate">
                                {user.type === 'teacher' ? 'Professor' : 'Student'} • {user.institution || 'No institution'}
                              </p>
                            </div>
                            {renderFriendStatus(user)}
                          </div>
                          {user.mutual_friends > 0 && (
                            <p className="text-xs text-blue-400 mt-1">
                              {user.mutual_friends} mutual friend{user.mutual_friends !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendRequest(user.id)}
                        disabled={user.is_friend !== false}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px]"
                      >
                        {user.is_friend === true || user.is_friend === 'accepted' ? (
                          <>
                            <i className="fas fa-check mr-2"></i>
                            Friends
                          </>
                        ) : user.is_friend === 'pending_sent' ? (
                          <>
                            <i className="fas fa-clock mr-2"></i>
                            Request Sent
                          </>
                        ) : user.is_friend === 'pending_received' ? (
                          <>
                            <i className="fas fa-user-plus mr-2"></i>
                            Respond to Request
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus mr-2"></i>
                            Add Friend
                          </>
                        )}
                      </button>
                    </MobileCard>
                  ))}
                </div>
              </>
            ) : searchQuery ? (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                <i className="fas fa-search text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
                <p className="text-gray-400">
                  {friendFilterOn && filterType !== 'all' 
                    ? `No ${filterType === 'friends' ? 'friends' : 'non-friends'} found with that search term`
                    : 'Try a different search term'}
                </p>
                {friendFilterOn && filterType !== 'all' && (
                  <button
                    onClick={() => handleFilterChange('all')}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Show All Users
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                <i className="fas fa-users text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-bold text-white mb-2">Find New Friends</h3>
                <p className="text-gray-400 mb-6">
                  Search for researchers by name, email, or institution
                </p>
                {/* NEW: Quick filter suggestion */}
                <div className="space-y-3 max-w-md mx-auto">
                  <p className="text-sm text-gray-400">Quick filters:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSearchQuery('Professor');
                        setFriendFilterOn(false);
                      }}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                    >
                      <i className="fas fa-chalkboard-teacher mr-2"></i>
                      Find Professors
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('University');
                        setFriendFilterOn(false);
                      }}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                    >
                      <i className="fas fa-university mr-2"></i>
                      By University
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-800">
            <div className="p-4 md:p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-white">User Profile</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <img 
                  src={getProfileImage(selectedUser)} 
                  alt={selectedUser.name} 
                  className="w-24 h-24 rounded-full border-4 border-blue-500/50 object-cover mb-4"
                />
                <h4 className="text-xl font-bold text-white mb-2">{selectedUser.name}</h4>
                <p className="text-gray-400 mb-1">
                  {selectedUser.type === 'teacher' ? 'Professor' : 'Student'}
                </p>
                {selectedUser.institution && (
                  <p className="text-gray-400">
                    <i className="fas fa-university mr-2"></i>
                    {selectedUser.institution}
                  </p>
                )}
              </div>
              
              {/* NEW: Friend Status in Modal */}
              {renderFriendStatus(selectedUser) && (
                <div className="mb-4 text-center">
                  {renderFriendStatus(selectedUser)}
                </div>
              )}
              
              <div className="space-y-3">
                {selectedUser.department && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-building text-blue-400 w-5"></i>
                    <span className="text-gray-300">{selectedUser.department}</span>
                  </div>
                )}
                {selectedUser.email && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-envelope text-blue-400 w-5"></i>
                    <span className="text-gray-300">{selectedUser.email}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-800">
                  <p className="text-gray-400 text-sm mb-2">Actions:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartChat(selectedUser)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      <i className="fas fa-comment mr-2"></i>
                      Message
                    </button>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}