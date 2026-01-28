"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import { MobileCard, useIsMobile } from '@/app/components/UI/MobileOptimized';

export default function DiscussionsPage() {
    const router = useRouter();
    const { alert, confirm, prompt } = useModal();
    const isMobile = useIsMobile();

    const [activeTab, setActiveTab] = useState('my-discussions');
    const [loading, setLoading] = useState(true);
    const [discussions, setDiscussions] = useState([]);
    const [stats, setStats] = useState({
        total_discussions: 0,
        active_discussions: 0,
        total_messages: 0
    });
    const [creatingDiscussion, setCreatingDiscussion] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joiningDiscussion, setJoiningDiscussion] = useState(false);
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        description: '',
        type: 'general',
        privacy: 'private',
        tags: []
    });

    useEffect(() => {
        loadDiscussions();
        loadStats();
    }, [activeTab]);

    const loadDiscussions = async () => {
        try {
            setLoading(true);
            const response = await AuthService.fetchDiscussions();
            if (response.success) {
                setDiscussions(response.data || []);
            } else {
                setDiscussions([]);
            }
        } catch (error) {
            console.error('Error loading discussions:', error);
            setDiscussions([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await AuthService.getDiscussionStats();
            if (response.success) {
                setStats(response.data || {
                    total_discussions: 0,
                    active_discussions: 0,
                    total_messages: 0
                });
            }
        } catch (error) {
            console.error('Error loading discussion stats:', error);
        }
    };

    const handleCreateDiscussion = async () => {
        if (!newDiscussion.title.trim()) {
            await alert({
                title: 'Validation Error',
                message: 'Please enter a title for the discussion',
                variant: 'warning'
            });
            return;
        }

        setCreatingDiscussion(true);
        try {
            const response = await AuthService.createDiscussion(newDiscussion);
            if (response.success) {
                await alert({
                    title: 'Discussion Created',
                    message: `Discussion created successfully! Invite code: ${response.data.invite_code}`,
                    variant: 'success'
                });
                setShowCreateModal(false);
                setNewDiscussion({
                    title: '',
                    description: '',
                    type: 'general',
                    privacy: 'private',
                    tags: []
                });
                await loadDiscussions();
                await loadStats();
            }
        } catch (error) {
            console.error('Error creating discussion:', error);
            await alert({
                title: 'Error',
                message: error.message || 'Failed to create discussion',
                variant: 'danger'
            });
        } finally {
            setCreatingDiscussion(false);
        }
    };

    const handleJoinDiscussion = async (discussionId) => {
        try {
            const response = await AuthService.joinDiscussion(discussionId);
            if (response.success) {
                await alert({
                    title: 'Joined Discussion',
                    message: 'You have successfully joined the discussion',
                    variant: 'success'
                });
                await loadDiscussions();
            }
        } catch (error) {
            console.error('Error joining discussion:', error);
            await alert({
                title: 'Error',
                message: error.message || 'Failed to join discussion',
                variant: 'danger'
            });
        }
    };

    // Inside client/src/app/discussions/page.jsx

    const handleJoinByCode = async () => {
        if (!joinCode.trim()) {
            await alert({ title: 'Input Required', message: 'Please enter an invite code', variant: 'warning' });
            return;
        }

        setJoiningDiscussion(true);
        try {
            const response = await AuthService.joinDiscussionByCode(joinCode.trim());

            if (response.success) {
                await alert({
                    title: 'Welcome!',
                    message: `Successfully joined: ${response.data.title}`,
                    variant: 'success'
                });
                setShowJoinModal(false);
                setJoinCode('');
                router.push(`/discussions/${response.data.discussion_id}`);
            }
        } catch (error) {
            // This is where we catch the error from auth.js and show a Modal
            await alert({
                title: 'Invite Code Error',
                message: error.message || 'That code is invalid or has expired.',
                variant: 'danger'
            });
        } finally {
            setJoiningDiscussion(false);
        }
    };

    const handleLeaveDiscussion = async (discussionId, discussionTitle) => {
        const confirmed = await confirm({
            title: 'Leave Discussion',
            message: `Are you sure you want to leave "${discussionTitle}"?`,
            variant: 'warning'
        });

        if (!confirmed) return;

        try {
            const response = await AuthService.leaveDiscussion(discussionId);
            if (response.success) {
                await alert({
                    title: 'Left Discussion',
                    message: 'You have left the discussion',
                    variant: 'success'
                });
                await loadDiscussions();
                await loadStats();
            }
        } catch (error) {
            console.error('Error leaving discussion:', error);
            await alert({
                title: 'Error',
                message: error.message || 'Failed to leave discussion',
                variant: 'danger'
            });
        }
    };

    const handleDeleteDiscussion = async (discussionId, discussionTitle) => {
        const confirmed = await confirm({
            title: 'Delete Discussion',
            message: `Are you sure you want to delete "${discussionTitle}"? This action cannot be undone.`,
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await AuthService.deleteDiscussion(discussionId);
            if (response.success) {
                await alert({
                    title: 'Discussion Deleted',
                    message: 'Discussion deleted successfully',
                    variant: 'success'
                });
                await loadDiscussions();
                await loadStats();
            }
        } catch (error) {
            console.error('Error deleting discussion:', error);
            await alert({
                title: 'Error',
                message: error.message || 'Failed to delete discussion',
                variant: 'danger'
            });
        }
    };

    const getDiscussionIcon = (type) => {
        switch (type) {
            case 'document': return 'fas fa-file-alt';
            case 'group': return 'fas fa-users';
            case 'project': return 'fas fa-project-diagram';
            default: return 'fas fa-comments';
        }
    };

    const getDiscussionColor = (type) => {
        switch (type) {
            case 'document': return 'text-blue-400';
            case 'group': return 'text-green-400';
            case 'project': return 'text-purple-400';
            default: return 'text-yellow-400';
        }
    };

    const getPrivacyBadge = (privacy) => {
        switch (privacy) {
            case 'public':
                return <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Public</span>;
            case 'private':
                return <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Private</span>;
            case 'invite_only':
                return <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Invite Only</span>;
            default:
                return null;
        }
    };

    // Mobile tabs component
    const MobileTabs = ({ tabs, activeTab, onChange }) => (
        <div className="flex overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4">
            <div className="flex gap-2 min-w-max">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 min-h-[44px] ${activeTab === tab.id
                            ? `bg-${tab.color}-600 text-white shadow-lg`
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <i className={tab.icon}></i>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const tabs = [
        { id: 'my-discussions', label: 'My Discussions', icon: 'fas fa-comments', color: 'blue' },
        { id: 'public', label: 'Public', icon: 'fas fa-globe', color: 'green' },
        { id: 'archived', label: 'Archived', icon: 'fas fa-archive', color: 'gray' },
    ];

    const filteredDiscussions = discussions.filter(discussion => {
        if (activeTab === 'my-discussions') {
            return discussion.is_member || discussion.admin_name === AuthService.getCurrentUser()?.name;
        } else if (activeTab === 'public') {
            return discussion.privacy === 'public' && !discussion.is_archived;
        } else if (activeTab === 'archived') {
            return discussion.is_archived;
        }
        return true;
    });

    return (
        <MainLayout>
            <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6">
                {/* Header */}
                <div className="mb-4 md:mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                                Discussions
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm lg:text-base">
                                Collaborate and share ideas with researchers
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all hover:scale-105 min-h-[44px]"
                            >
                                <i className="fas fa-plus mr-2"></i>
                                Join Discussion
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all hover:scale-105 min-h-[44px]"
                            >
                                <i className="fas fa-plus mr-2"></i>
                                New Discussion
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                    <MobileCard className="p-3 md:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-400">Total Discussions</p>
                                <p className="text-lg md:text-xl font-bold text-white">{stats.total_discussions}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <i className="fas fa-comments text-white text-sm md:text-base"></i>
                            </div>
                        </div>
                    </MobileCard>
                    <MobileCard className="p-3 md:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-400">Active</p>
                                <p className="text-lg md:text-xl font-bold text-white">{stats.active_discussions}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <i className="fas fa-users text-white text-sm md:text-base"></i>
                            </div>
                        </div>
                    </MobileCard>
                    <MobileCard className="p-3 md:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-400">Total Messages</p>
                                <p className="text-lg md:text-xl font-bold text-white">{stats.total_messages}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <i className="fas fa-envelope text-white text-sm md:text-base"></i>
                            </div>
                        </div>
                    </MobileCard>
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
                                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                        ? `bg-${tab.color}-600 text-white shadow-lg`
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <i className={tab.icon}></i>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Discussions List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading discussions...</p>
                    </div>
                ) : filteredDiscussions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {filteredDiscussions.map((discussion) => (
                            <MobileCard key={discussion.id} className="p-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${getDiscussionColor(discussion.type).replace('text-', 'bg-').replace('-400', '-500/20')
                                        } flex items-center justify-center`}>
                                        <i className={`${getDiscussionIcon(discussion.type)} ${getDiscussionColor(discussion.type)
                                            } text-sm md:text-base`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-white text-sm md:text-base truncate">
                                                {discussion.title}
                                            </h3>
                                            {/* To this */}
                                            {!!discussion.is_pinned && (
                                                <i className="fas fa-thumbtack text-yellow-400 ml-2 flex-shrink-0"></i>
                                            )}
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-400 mt-1 line-clamp-2">
                                            {discussion.description || 'No description'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {getPrivacyBadge(discussion.privacy)}
                                            <span className="text-xs text-gray-500">
                                                <i className="fas fa-users mr-1"></i>
                                                {discussion.member_count}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                <i className="fas fa-comment mr-1"></i>
                                                {discussion.message_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                {discussion.tags && discussion.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {discussion.tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 bg-gray-800/50 text-gray-300 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Last Activity */}
                                {discussion.last_message_at && (
                                    <p className="text-xs text-gray-500 mb-3">
                                        Last activity: {new Date(discussion.last_message_at).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/discussions/${discussion.id}`)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px]"
                                    >
                                        <i className="fas fa-door-open mr-2"></i>
                                        Open
                                    </button>

                                    {discussion.is_member ? (
                                        <button
                                            onClick={() => handleLeaveDiscussion(discussion.id, discussion.title)}
                                            className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs md:text-sm transition-colors min-h-[44px]"
                                        >
                                            <i className="fas fa-sign-out-alt"></i>
                                        </button>
                                    ) : discussion.privacy === 'public' && discussion.admin_name !== AuthService.getCurrentUser()?.name ? (
                                        <button
                                            onClick={() => handleJoinDiscussion(discussion.id)}
                                            className="px-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs md:text-sm transition-colors min-h-[44px]"
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    ) : null}

                                    {discussion.admin_name === AuthService.getCurrentUser()?.name && (
                                        <button
                                            onClick={() => handleDeleteDiscussion(discussion.id, discussion.title)}
                                            className="px-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs md:text-sm transition-colors min-h-[44px]"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </MobileCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                        <i className="fas fa-comments text-4xl text-gray-600 mb-4"></i>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {activeTab === 'my-discussions' ? 'No Discussions Yet' :
                                activeTab === 'public' ? 'No Public Discussions' :
                                    'No Archived Discussions'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {activeTab === 'my-discussions' ? 'Create your first discussion to start collaborating' :
                                activeTab === 'public' ? 'No public discussions available at the moment' :
                                    'No archived discussions'}
                        </p>
                        {activeTab === 'my-discussions' && (
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowJoinModal(true)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Join Discussion
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Create Discussion
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Discussion Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-800">
                        <div className="p-4 md:p-6 border-b border-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-white">Create New Discussion</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={newDiscussion.title}
                                        onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                                        placeholder="Enter discussion title"
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newDiscussion.description}
                                        onChange={(e) => setNewDiscussion({ ...newDiscussion, description: e.target.value })}
                                        placeholder="What is this discussion about?"
                                        rows="3"
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Type
                                        </label>
                                        <select
                                            value={newDiscussion.type}
                                            onChange={(e) => setNewDiscussion({ ...newDiscussion, type: e.target.value })}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                                        >
                                            <option value="general">General</option>
                                            <option value="document">Document</option>
                                            <option value="group">Group</option>
                                            <option value="project">Project</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Privacy
                                        </label>
                                        <select
                                            value={newDiscussion.privacy}
                                            onChange={(e) => setNewDiscussion({ ...newDiscussion, privacy: e.target.value })}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                                        >
                                            <option value="private">Private</option>
                                            <option value="public">Public</option>
                                            <option value="invite_only">Invite Only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-800 flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 md:py-3 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDiscussion}
                                disabled={creatingDiscussion || !newDiscussion.title.trim()}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white py-2 md:py-3 rounded-lg font-medium"
                            >
                                {creatingDiscussion ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Discussion'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Discussion Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-800">
                        <div className="p-4 md:p-6 border-b border-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-white">Join Discussion</h3>
                                <button
                                    onClick={() => {
                                        setShowJoinModal(false);
                                        setJoinCode('');
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Invite Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        placeholder="Enter 8-character invite code"
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base uppercase"
                                        maxLength={8}
                                        style={{ letterSpacing: '0.1em' }}
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        Enter the 8-character invite code provided by the discussion creator
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <p className="text-sm text-blue-300">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        You can also join public discussions directly from the "Public" tab
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-800 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowJoinModal(false);
                                    setJoinCode('');
                                }}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 md:py-3 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleJoinByCode}
                                disabled={joiningDiscussion || !joinCode.trim()}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white py-2 md:py-3 rounded-lg font-medium"
                            >
                                {joiningDiscussion ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Joining...
                                    </>
                                ) : (
                                    'Join Discussion'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}