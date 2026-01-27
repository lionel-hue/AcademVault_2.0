"use client";
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (params.id) {
      loadDiscussion();
    }
  }, [params.id]);

  const loadDiscussion = async () => {
    try {
      setLoading(true);
      const response = await AuthService.fetchDiscussion(params.id);
      if (response.success) {
        setDiscussion(response.data.discussion);
        setMessages(response.data.messages || []);
        setMembers(response.data.members || []);
        setIsAdmin(response.data.is_admin || false);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const response = await AuthService.sendMessage(params.id, {
        content: newMessage.trim()
      });
      
      if (response.success) {
        setNewMessage('');
        // Add new message to the beginning of the list
        setMessages(prev => [response.data, ...prev]);
        // Update discussion last message time
        if (discussion) {
          setDiscussion({
            ...discussion,
            last_message_at: new Date().toISOString(),
            message_count: discussion.message_count + 1
          });
        }
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                {discussion.is_pinned && (
                  <i className="fas fa-thumbtack text-yellow-400"></i>
                )}
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
                {discussion.tags && discussion.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
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
                          name: message.user_name,
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
                          {message.is_edited && (
                            <span className="text-xs text-gray-500">(edited)</span>
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
                <span className="text-xs text-gray-400">
                  <i className="fas fa-users mr-1"></i>
                  {discussion.member_count}
                </span>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <img
                      src={getProfileImage(member)}
                      alt={member.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {member.name}
                        {member.role === 'admin' && (
                          <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1 rounded">Admin</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {member.type === 'teacher' ? 'Professor' : 'Student'}
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
                  onClick={() => {
                    const inviteLink = `${window.location.origin}/discussions/${params.id}`;
                    navigator.clipboard.writeText(inviteLink);
                    alert({
                      title: 'Link Copied',
                      message: 'Discussion link copied to clipboard',
                      variant: 'success'
                    });
                  }}
                  className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white"
                >
                  <i className="fas fa-link"></i>
                  Copy Invite Link
                </button>
                {isAdmin && (
                  <button
                    onClick={() => prompt({
                      title: 'Edit Discussion',
                      message: 'Enter new title:',
                      placeholder: discussion.title,
                      variant: 'default'
                    }).then(newTitle => {
                      if (newTitle && newTitle !== discussion.title) {
                        // Update discussion title
                        AuthService.updateDiscussion(params.id, { title: newTitle })
                          .then(() => {
                            setDiscussion({ ...discussion, title: newTitle });
                            alert({
                              title: 'Updated',
                              message: 'Discussion title updated',
                              variant: 'success'
                            });
                          })
                          .catch(error => {
                            alert({
                              title: 'Error',
                              message: error.message || 'Failed to update discussion',
                              variant: 'danger'
                            });
                          });
                      }
                    })}
                    className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white"
                  >
                    <i className="fas fa-edit"></i>
                    Edit Discussion
                  </button>
                )}
              </div>
            </MobileCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}