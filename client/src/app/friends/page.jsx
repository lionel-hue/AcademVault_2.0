"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import { MobileTabs, MobileCard, useIsMobile } from '@/app/components/UI/MobileOptimized';

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

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockFriends = [
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@university.edu',
          type: 'student',
          institution: 'MIT',
          department: 'Computer Science',
          profile_image: null,
          mutual_friends: 12,
          shared_interests: ['AI', 'Machine Learning', 'Data Science'],
          status: 'accepted',
          relationship_type: 'colleague',
          last_active: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Bob Smith',
          email: 'bob@stanford.edu',
          type: 'teacher',
          institution: 'Stanford',
          department: 'Physics',
          profile_image: null,
          mutual_friends: 8,
          shared_interests: ['Quantum Computing', 'Physics'],
          status: 'accepted',
          relationship_type: 'mentor',
          last_active: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          name: 'Carol Williams',
          email: 'carol@harvard.edu',
          type: 'student',
          institution: 'Harvard',
          department: 'Mathematics',
          profile_image: null,
          mutual_friends: 15,
          shared_interests: ['Mathematics', 'Cryptography'],
          status: 'accepted',
          relationship_type: 'friend',
          last_active: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setFriends(mockFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      // TODO: Replace with actual API call
      const mockRequests = [
        {
          id: 4,
          name: 'David Chen',
          email: 'david@mit.edu',
          type: 'student',
          institution: 'MIT',
          department: 'Engineering',
          profile_image: null,
          message: 'Hi! I saw your research on neural networks. Would love to connect!',
          sent_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 5,
          name: 'Emma Davis',
          email: 'emma@oxford.edu',
          type: 'teacher',
          institution: 'Oxford',
          department: 'Computer Science',
          profile_image: null,
          message: 'Hello! I\'m working on similar projects. Let\'s collaborate!',
          sent_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      setFriendRequests(mockRequests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // TODO: Replace with actual API call
      const mockResults = [
        {
          id: 6,
          name: 'Frank Miller',
          email: 'frank@cambridge.edu',
          type: 'teacher',
          institution: 'Cambridge',
          department: 'Mathematics',
          profile_image: null,
          mutual_friends: 3,
          is_friend: false,
        },
      ];
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      // TODO: Replace with actual API call
      await alert({
        title: 'Friend Request Accepted',
        message: 'You are now friends!',
        variant: 'success',
      });
      loadFriends();
      loadFriendRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (friendId) => {
    const confirmed = await confirm({
      title: 'Reject Friend Request',
      message: 'Are you sure you want to reject this request?',
      variant: 'warning',
    });

    if (confirmed) {
      try {
        // TODO: Replace with actual API call
        loadFriendRequests();
      } catch (error) {
        console.error('Error rejecting request:', error);
      }
    }
  };

  const handleSendRequest = async (userId) => {
    const message = await prompt({
      title: 'Send Friend Request',
      message: 'Add a personal message (optional):',
      placeholder: 'Hi! I would like to connect with you...',
    });

    try {
      // TODO: Replace with actual API call
      await alert({
        title: 'Request Sent',
        message: 'Friend request sent successfully!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    const confirmed = await confirm({
      title: 'Remove Friend',
      message: 'Are you sure you want to remove this friend?',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        // TODO: Replace with actual API call
        loadFriends();
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    }
  };

  const getProfileImage = (friend) => {
    if (friend.profile_image) {
      return friend.profile_image;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=3b82f6&color=fff&size=128`;
  };

  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return 'Active now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const tabs = [
    { id: 'all', label: 'All Friends', icon: 'fas fa-users', count: friends.length },
    { id: 'requests', label: 'Requests', icon: 'fas fa-user-plus', count: friendRequests.length },
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
            <MobileTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
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
                { label: 'Friends', value: friends.length, icon: 'fas fa-users', color: 'from-blue-500 to-cyan-500' },
                { label: 'Pending', value: friendRequests.length, icon: 'fas fa-clock', color: 'from-yellow-500 to-orange-500' },
                { label: 'Colleagues', value: friends.filter(f => f.relationship_type === 'colleague').length, icon: 'fas fa-briefcase', color: 'from-green-500 to-emerald-500' },
                { label: 'Mentors', value: friends.filter(f => f.relationship_type === 'mentor').length, icon: 'fas fa-graduation-cap', color: 'from-purple-500 to-pink-500' },
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
                    <div className="flex items-start gap-3 mb-3">
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
                          {friend.type === 'teacher' ? 'Professor' : 'Student'} • {friend.institution}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatLastActive(friend.last_active)}
                        </p>
                      </div>
                    </div>

                    {/* Shared Interests */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {friend.shared_interests.slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/friends/${friend.id}`)}
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
            {friendRequests.length > 0 ? (
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
                          {request.type === 'teacher' ? 'Professor' : 'Student'} • {request.institution}
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
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or institution..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {searching ? <i className="fas fa-spinner fa-spin"></i> : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {searchResults.map((user) => (
                  <MobileCard key={user.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={getProfileImage(user)}
                        alt={user.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-700 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm md:text-base truncate">
                          {user.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400 truncate">
                          {user.type === 'teacher' ? 'Professor' : 'Student'} • {user.institution}
                        </p>
                        {user.mutual_friends > 0 && (
                          <p className="text-xs text-blue-400 mt-1">
                            {user.mutual_friends} mutual friends
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={user.is_friend}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px]"
                    >
                      {user.is_friend ? (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Already Friends
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
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}