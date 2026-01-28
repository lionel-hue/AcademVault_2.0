"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import { MobileCard, MobileButton, useIsMobile } from '@/app/components/UI/MobileOptimized';

export default function DiscussionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { alert, confirm, prompt } = useModal();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(Date.now());
  const [pollingInterval, setPollingInterval] = useState(null);
  const [newMembers, setNewMembers] = useState([]);
  const [showNewMemberNotification, setShowNewMemberNotification] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(0);
  const messagesEndRef = useRef(null);
  const newMemberTimeoutRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (params.id) {
      loadDiscussion();
      startPolling();
    }

    return () => {
      stopPolling();
      if (newMemberTimeoutRef.current) {
        clearTimeout(newMemberTimeoutRef.current);
      }
    };
  }, [params.id]);

  const startPolling = () => {
    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Start new polling interval (every 3 seconds)
    const interval = setInterval(() => {
      pollNewMessages();
    }, 3000);

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const loadDiscussion = async () => {
    try {
      setLoading(true);
      const response = await AuthService.fetchDiscussion(params.id);

      if (response.success) {
        const { discussion, messages, members, is_admin } = response.data;

        setDiscussion(discussion);
        setMessages(messages || []);
        setMembers(members || []);
        setIsAdmin(is_admin || false);

        // Set last message ID for polling
        if (messages && messages.length > 0) {
          const latestMsg = messages.reduce((latest, current) =>
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
          );
          setLastMessageId(latestMsg.id || 0);
        }
      } else {
        await alert({
          title: 'Error',
          message: 'Discussion not found or access denied',
          variant: 'danger'
        });
        router.push('/discussions');
      }
    } catch (error) {
      console.error('Error loading discussion:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to load discussion',
        variant: 'danger'
      });
      router.push('/discussions');
    } finally {
      setLoading(false);
    }
  };

  const pollNewMessages = async () => {
    if (!discussion || !params.id) return;

    try {
      const response = await AuthService.makeRequest(`/discussions/${params.id}/recent-messages?last_message_id=${lastMessageId}`);

      if (response.success) {
        const { messages: newMessages, new_members, member_count, message_count, last_message_at } = response.data;

        if (newMessages && newMessages.length > 0) {
          // Add new messages to existing messages
          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.id));
            const filteredNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
            return [...prev, ...filteredNewMessages];
          });

          // Update last message ID
          if (newMessages.length > 0) {
            const latestNewMsg = newMessages.reduce((latest, current) =>
              current.id > latest.id ? current : latest
            );
            setLastMessageId(latestNewMsg.id);
          }

          // Update discussion stats
          if (discussion) {
            setDiscussion(prev => ({
              ...prev,
              message_count: message_count || prev.message_count,
              last_message_at: last_message_at || prev.last_message_at,
              member_count: member_count || prev.member_count
            }));
          }

          // Increment unread count if user is not at bottom
          setUnreadMessageCount(prev => prev + newMessages.length);
        }

        // Handle new members
        if (new_members && new_members.length > 0) {
          // Add new members to members list
          setMembers(prev => {
            const existingIds = new Set(prev.map(member => member.id));
            const filteredNewMembers = new_members.filter(member => !existingIds.has(member.id));
            return [...prev, ...filteredNewMembers];
          });

          // Show notification for new members
          if (new_members.length === 1) {
            setNewMembers([new_members[0]]);
          } else {
            setNewMembers(new_members.slice(0, 3)); // Show first 3 new members
          }

          setShowNewMemberNotification(true);

          // Auto-hide notification after 5 seconds
          if (newMemberTimeoutRef.current) {
            clearTimeout(newMemberTimeoutRef.current);
          }

          newMemberTimeoutRef.current = setTimeout(() => {
            setShowNewMemberNotification(false);
            setNewMembers([]);
          }, 5000);
        }

        setLastPollTime(Date.now());
      }
    } catch (error) {
      console.error('Error polling messages:', error);
      // If polling fails due to auth error, reload discussion
      if (error.message?.includes('Session expired') || error.message?.includes('Unauthorized')) {
        loadDiscussion();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await AuthService.sendMessage(params.id, {
        content: newMessage.trim()
      });

      if (response.success) {
        setNewMessage('');
        // Add new message to the beginning of the list (since messages are displayed reversed)
        setMessages(prev => [response.data, ...prev]);

        // Update discussion last message time
        if (discussion) {
          setDiscussion(prev => ({
            ...prev,
            last_message_at: new Date().toISOString(),
            message_count: prev.message_count + 1
          }));
        }

        // Update last message ID
        if (response.data.id) {
          setLastMessageId(response.data.id);
        }

        // Clear unread count since user just sent a message
        setUnreadMessageCount(0);

        // Scroll to bottom after sending
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to send message',
        variant: 'danger'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLeaveDiscussion = async () => {
    if (!discussion) return;

    const confirmed = await confirm({
      title: 'Leave Discussion',
      message: `Are you sure you want to leave "${discussion.title}"?`,
      variant: 'warning'
    });

    if (!confirmed) return;

    try {
      const response = await AuthService.leaveDiscussion(params.id);
      if (response.success) {
        await alert({
          title: 'Left Discussion',
          message: 'You have left the discussion',
          variant: 'success'
        });
        router.push('/discussions');
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

  const handleDeleteDiscussion = async () => {
    if (!discussion || !isAdmin) return;

    const confirmed = await confirm({
      title: 'Delete Discussion',
      message: `Are you sure you want to delete "${discussion.title}"? This action cannot be undone.`,
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      const response = await AuthService.deleteDiscussion(params.id);
      if (response.success) {
        await alert({
          title: 'Discussion Deleted',
          message: 'Discussion deleted successfully',
          variant: 'success'
        });
        router.push('/discussions');
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

  const handleInviteMember = async () => {
    const email = await prompt({
      title: 'Invite Member',
      message: 'Enter email address to invite:',
      placeholder: 'user@example.com',
      variant: 'default',
      type: 'email'
    });

    if (!email) return;

    try {
      // First search for user
      const searchResponse = await AuthService.searchUsers(email);

      if (searchResponse.success && searchResponse.data.length > 0) {
        const user = searchResponse.data[0];

        const confirmInvite = await confirm({
          title: 'Send Invitation',
          message: `Send invitation to ${user.name} (${user.email})?`,
          variant: 'default'
        });

        if (confirmInvite) {
          // Here you would call an invite endpoint
          // For now, we'll show success message
          await alert({
            title: 'Invitation Sent',
            message: `Invitation sent to ${user.email}`,
            variant: 'success'
          });
        }
      } else {
        await alert({
          title: 'User Not Found',
          message: 'No user found with that email address',
          variant: 'warning'
        });
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      await alert({
        title: 'Error',
        message: 'Failed to send invitation',
        variant: 'danger'
      });
    }
  };

  const handleCopyInviteLink = () => {
    if (!discussion?.invite_code) {
      // If no invite code, generate one or use direct link
      const inviteLink = `${window.location.origin}/discussions/join?discussion_id=${params.id}`;
      navigator.clipboard.writeText(inviteLink);
      alert({
        title: 'Link Copied',
        message: 'Discussion link copied to clipboard. User can request to join.',
        variant: 'success'
      });
    } else {
      // Use invite code for private discussions
      const inviteLink = `${window.location.origin}/discussions/join?code=${discussion.invite_code}`;
      navigator.clipboard.writeText(inviteLink);
      alert({
        title: 'Invite Link Copied',
        message: 'Invite link copied to clipboard',
        variant: 'success'
      });
    }
  };

  const handleEditDiscussion = async () => {
    if (!discussion || !isAdmin) return;

    const newTitle = await prompt({
      title: 'Edit Discussion',
      message: 'Enter new title:',
      placeholder: discussion.title,
      defaultValue: discussion.title,
      variant: 'default'
    });

    if (newTitle && newTitle !== discussion.title) {
      try {
        const response = await AuthService.updateDiscussion(params.id, {
          title: newTitle
        });

        if (response.success) {
          setDiscussion(prev => ({ ...prev, title: newTitle }));
          await alert({
            title: 'Updated',
            message: 'Discussion title updated',
            variant: 'success'
          });
        }
      } catch (error) {
        console.error('Error updating discussion:', error);
        await alert({
          title: 'Error',
          message: error.message || 'Failed to update discussion',
          variant: 'danger'
        });
      }
    }
  };

  const getProfileImage = (user) => {
    if (user.profile_image) {
      if (user.profile_image.startsWith('http://') || user.profile_image.startsWith('https://')) {
        return user.profile_image;
      }
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${user.profile_image}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=128`;
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 5) return 'Online now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return formatMessageTime(dateString);
  };

  const handleViewUnread = () => {
    scrollToBottom();
    setUnreadMessageCount(0);
  };

  const handleRefresh = () => {
    loadDiscussion();
    setUnreadMessageCount(0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading discussion...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!discussion) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Discussion Not Found</h1>
            <button
              onClick={() => router.push('/discussions')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Back to Discussions
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6">
        {/* Discussion Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => router.push('/discussions')}
                  className="text-gray-400 hover:text-white mr-2"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  {discussion.title}
                </h1>
                {!!discussion.is_pinned && (<i className="fas fa-thumbtack text-yellow-400"></i>)}
              </div>
              <p className="text-gray-400 text-sm md:text-base mb-3">
                {discussion.description || 'No description'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  {discussion.type.charAt(0).toUpperCase() + discussion.type.slice(1)}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                  <i className="fas fa-users mr-1"></i>
                  {discussion.member_count} members
                </span>
                <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                  <i className="fas fa-comment mr-1"></i>
                  {discussion.message_count} messages
                </span>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                  <i className="fas fa-sync-alt mr-1"></i>
                  Auto-refresh
                </span>
                {discussion.tags && discussion.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </button>
              {isAdmin ? (
                <button
                  onClick={handleDeleteDiscussion}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete
                </button>
              ) : (
                <button
                  onClick={handleLeaveDiscussion}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Leave
                </button>
              )}
            </div>
          </div>
        </div>

        {/* New Member Notification */}
        {showNewMemberNotification && newMembers.length > 0 && (
          <div className="mb-4 animate-fade-in">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fas fa-user-plus text-green-400"></i>
                  <span className="text-white text-sm">
                    {newMembers.length === 1
                      ? `${newMembers[0].name} joined the discussion`
                      : `${newMembers.length} new members joined`}
                  </span>
                </div>
                <button
                  onClick={() => setShowNewMemberNotification(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {newMembers.length <= 3 && (
                <div className="flex items-center gap-2 mt-2">
                  {newMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <img
                        src={getProfileImage(member)}
                        alt={member.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs text-gray-300">{member.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unread Messages Notification */}
        {unreadMessageCount > 0 && (
          <div className="mb-4 animate-fade-in">
            <button
              onClick={handleViewUnread}
              className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 hover:bg-blue-500/20 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <i className="fas fa-comment text-blue-400"></i>
                <span className="text-white text-sm">
                  {unreadMessageCount} new message{unreadMessageCount !== 1 ? 's' : ''}
                </span>
                <i className="fas fa-arrow-down text-blue-400 ml-2"></i>
              </div>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chat Messages - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <MobileCard className="p-4 h-[calc(100vh-300px)] flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length > 0 ? (
                  [...messages].reverse().map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <img
                        src={getProfileImage({
                          name: !!message.user_name,
                          profile_image: message.user_profile_image
                        })}
                        alt={message.user_name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">
                            {message.user_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(message.created_at)}
                          </span>
                          {!!message.is_edited && (
                            <span className="text-xs text-gray-500">(edited)</span>
                          )}
                          {message.message_type === 'system' && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded">
                              <i className="fas fa-cog mr-1"></i>
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        {message.document_title && (
                          <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                            <i className="fas fa-file-alt text-blue-400 mr-2"></i>
                            <span className="text-sm text-white">{message.document_title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-comments text-3xl text-gray-600 mb-3"></i>
                    <p className="text-gray-400">No messages yet</p>
                    <p className="text-gray-500 text-sm mt-1">Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-800 pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {sendingMessage ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                  <p className="text-xs text-gray-500">
                    <i className="fas fa-sync-alt mr-1"></i>
                    Auto-refreshing every 3s
                  </p>
                </div>
              </div>
            </MobileCard>
          </div>

          {/* Members Sidebar - 1/3 width on desktop */}
          <div className="space-y-4">
            <MobileCard className="p-4">
              <h3 className="font-semibold text-white mb-3">Discussion Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-user-shield text-blue-400 w-5"></i>
                  <span className="text-sm text-gray-300">Admin:</span>
                  <span className="text-sm text-white font-medium">{discussion.admin_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-lock text-gray-400 w-5"></i>
                  <span className="text-sm text-gray-300">Privacy:</span>
                  <span className="text-sm text-white capitalize">{discussion.privacy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar text-gray-400 w-5"></i>
                  <span className="text-sm text-gray-300">Created:</span>
                  <span className="text-sm text-white">
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </span>
                </div>
                {discussion.last_message_at && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-300">Last activity:</span>
                    <span className="text-sm text-white">
                      {formatMessageTime(discussion.last_message_at)}
                    </span>
                  </div>
                )}
              </div>
            </MobileCard>

            <MobileCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Members ({members.length})</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    <i className="fas fa-users mr-1"></i>
                    {discussion.member_count}
                  </span>
                  {/* Look for "Quick Actions" section in client/src/app/discussions/[id]/page.jsx */}
                  {isAdmin && (
                    <>
                      <button onClick={handleEditDiscussion} className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white" >
                        <i className="fas fa-edit"></i> Edit Discussion
                      </button>

                      {/* REPLACE THE REGENERATE BUTTON WITH THIS BLOCK */}
                      <button onClick={async () => {
                        const result = await prompt({
                          title: 'Update Invite Code',
                          message: 'Enter a custom code (4-12 chars) or leave empty to generate random:',
                          placeholder: 'e.g. MYCHAT01',
                          variant: 'warning'
                        });

                        if (result !== null) { // result is null if user clicks Cancel
                          try {
                            const response = await AuthService.updateDiscussion(params.id, {
                              regenerate_invite_code: true,
                              invite_code: result // This sends the text you typed in the prompt
                            });
                            if (response.success) {
                              await alert({ title: 'Code Updated', message: `New invite code: ${response.data.invite_code}`, variant: 'success' });
                              loadDiscussion(); // This refreshes the page data
                            }
                          } catch (error) {
                            alert({ title: 'Error', message: error.message, variant: 'danger' });
                          }
                        }
                      }} className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white" >
                        <i className="fas fa-key"></i> Regenerate Invite Code
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={getProfileImage(member)}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      {member.is_online && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {member.name}
                        {member.role === 'admin' && (
                          <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1 rounded">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {member.type === 'teacher' ? 'Professor' : 'Student'}
                        {member.last_seen && ` • ${formatLastSeen(member.last_seen)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>

            {/* Quick Actions */}
            <MobileCard className="p-4">
              <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/documents')}
                  className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white"
                >
                  <i className="fas fa-file-import"></i>
                  Share Document
                </button>
                <button
                  onClick={handleCopyInviteLink}
                  className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white"
                >
                  <i className="fas fa-link"></i>
                  Copy Invite Link
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={handleEditDiscussion}
                      className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white"
                    >
                      <i className="fas fa-edit"></i>
                      Edit Discussion
                    </button>
                    <button
                      onClick={async () => {
                        const newCode = await prompt({
                          title: 'Regenerate Invite Code',
                          message: 'Generate new invite code? Old links will stop working.',
                          variant: 'warning'
                        });
                        if (newCode) {
                          try {
                            const response = await AuthService.updateDiscussion(params.id, {
                              regenerate_invite_code: true
                            });
                            if (response.success) {
                              await alert({
                                title: 'Code Regenerated',
                                message: 'New invite code generated',
                                variant: 'success'
                              });
                              loadDiscussion();
                            }
                          } catch (error) {
                            alert({
                              title: 'Error',
                              message: 'Failed to regenerate code',
                              variant: 'danger'
                            });
                          }
                        }
                      }}
                      className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white"
                    >
                      <i className="fas fa-key"></i>
                      Regenerate Invite Code
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    const exportData = {
                      discussion,
                      messages: messages.slice(0, 100), // Limit to recent messages
                      members,
                      export_date: new Date().toISOString()
                    };
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                    const exportFileDefaultName = `${discussion.title.replace(/[^a-z0-9]/gi, '_')}_export.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white"
                >
                  <i className="fas fa-download"></i>
                  Export Discussion
                </button>
              </div>
            </MobileCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}