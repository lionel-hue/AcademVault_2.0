"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import SearchSessionCard from './components/SearchSessionCard';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';

export default function SearchSessionsPage() {
  const router = useRouter();
  const { alert, confirm } = useModal();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  const loadSessions = async () => {
    try {
      // This API method needs to be added to auth.js first
      const response = await AuthService.getSearchSessions();
      if (response.success) {
        setSessions(response.data || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenSession = (session) => {
    // We'll implement this later - could open in modal or separate view
    router.push(`/search?q=${encodeURIComponent(session.query)}&sessionId=${session.id}`);
  };
  
  const handleRenameSession = async (id, newTitle) => {
    try {
      await AuthService.updateSearchSession(id, { title: newTitle });
      setSessions(prev => prev.map(s => 
        s.id === id ? { ...s, title: newTitle } : s
      ));
    } catch (error) {
      console.error('Error renaming session:', error);
    }
  };
  
  const handleDeleteSession = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Search Session',
      message: 'Are you sure you want to delete this search session?',
      variant: 'danger'
    });
    
    if (confirmed) {
      try {
        await AuthService.deleteSearchSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };
  
  const handleCreateFromCurrent = async () => {
    // Get current search from localStorage or query params
    const currentSearch = localStorage.getItem('current_search');
    if (!currentSearch) {
      await alert({
        title: 'No Active Search',
        message: 'Please perform a search first to save as session.',
        variant: 'warning'
      });
      return;
    }
    
    try {
      const sessionData = JSON.parse(currentSearch);
      await AuthService.createSearchSession(sessionData);
      await alert({
        title: 'Session Saved',
        message: 'Search session saved successfully!',
        variant: 'success'
      });
      loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };
  
  const filteredSessions = sessions.filter(session => {
    if (filter === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(session.created_at) > weekAgo;
    }
    return true;
  });
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <i className="fas fa-comments text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Search Sessions</h1>
              <p className="text-gray-400">
                Save and organize your search results for future reference
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-gray-900/30 rounded-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              All Sessions
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Recent (7 days)
            </button>
          </div>
          <button
            onClick={handleCreateFromCurrent}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 text-sm"
          >
            <i className="fas fa-plus mr-2"></i>
            Save Current Search
          </button>
        </div>
        
        {/* Sessions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900/50 rounded-2xl p-4 animate-pulse">
                <div className="h-6 bg-gray-800 rounded mb-3"></div>
                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map(session => (
              <SearchSessionCard
                key={session.id}
                session={session}
                onOpen={handleOpenSession}
                onDelete={handleDeleteSession}
                onRename={handleRenameSession}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900/30 rounded-2xl">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-gray-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Search Sessions</h3>
            <p className="text-gray-400 mb-6">Save your searches to see them here.</p>
            <button
              onClick={() => router.push('/search')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Start Searching
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}