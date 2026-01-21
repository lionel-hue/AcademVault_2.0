"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import DocumentCard from './components/DocumentCard';
import DocumentUploadModal from './components/DocumentUploadModal';
import { MobileTabs, MobileSelect, useIsMobile } from '@/app/components/UI/MobileOptimized';

export default function DocumentsPage() {
  const router = useRouter();
  const { alert, confirm } = useModal();
  const isMobile = useIsMobile();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Filtres
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    sort: 'newest',
    search: '',
  });
  
  // Tabs pour mobile
  const documentTabs = [
    { id: 'all', label: 'All', icon: 'fas fa-layer-group', color: 'bg-gray-800' },
    { id: 'pdf', label: 'PDFs', icon: 'fas fa-file-pdf', color: 'bg-red-500' },
    { id: 'video', label: 'Videos', icon: 'fas fa-video', color: 'bg-blue-500' },
    { id: 'article_link', label: 'Articles', icon: 'fas fa-newspaper', color: 'bg-green-500' },
  ];

  useEffect(() => {
    loadDocuments();
    loadStats();
    loadCategories();
  }, [filters]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.category !== 'all') params.category_id = filters.category;
      if (filters.search) params.search = filters.search;
      params.sort_by = filters.sort === 'newest' ? 'created_at' : 'title';
      params.sort_order = filters.sort === 'newest' ? 'desc' : 'asc';

      const response = await AuthService.fetchUserDocuments(params);
      if (response.success) {
        setDocuments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      await alert({
        title: 'Error',
        message: 'Failed to load documents',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await AuthService.fetchDocumentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCategories = async () => {
    try {
      // This would be a new API endpoint, for now use mock
      const mockCategories = [
        { id: 1, name: 'Research Papers', color: '#3B82F6', icon: 'fas fa-file-pdf' },
        { id: 2, name: 'Tutorials', color: '#10B981', icon: 'fas fa-video' },
        { id: 3, name: 'Articles', color: '#F59E0B', icon: 'fas fa-newspaper' },
        { id: 4, name: 'Presentations', color: '#8B5CF6', icon: 'fas fa-presentation' },
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDeleteDocument = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      try {
        await AuthService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
        await loadStats();
        await alert({
          title: 'Success',
          message: 'Document deleted successfully',
          variant: 'success'
        });
      } catch (error) {
        await alert({
          title: 'Error',
          message: 'Failed to delete document',
          variant: 'danger'
        });
      }
    }
  };

  const handleUploadSuccess = () => {
    loadDocuments();
    loadStats();
    setShowUploadModal(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDocuments();
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      sort: 'newest',
      search: '',
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Documents</h1>
            <p className="text-gray-400 text-sm md:text-base">
              Manage your research library ({stats?.total || 0} documents)
            </p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium flex items-center gap-2"
            >
              <i className="fas fa-plus text-sm md:text-base"></i>
              <span className="hidden sm:inline">Add Document</span>
            </button>
            <button
              onClick={() => router.push('/categories')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium flex items-center gap-2"
            >
              <i className="fas fa-folder text-sm md:text-base"></i>
              <span className="hidden sm:inline">Categories</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Total</p>
                  <p className="text-white text-lg md:text-xl font-bold">{stats.total || 0}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i className="fas fa-file text-blue-400 text-sm md:text-base"></i>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">PDFs</p>
                  <p className="text-white text-lg md:text-xl font-bold">{stats.by_type?.pdf || 0}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <i className="fas fa-file-pdf text-red-400 text-sm md:text-base"></i>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Videos</p>
                  <p className="text-white text-lg md:text-xl font-bold">{stats.by_type?.video || 0}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i className="fas fa-video text-blue-400 text-sm md:text-base"></i>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Storage</p>
                  <p className="text-white text-lg md:text-xl font-bold">{stats.storage_used || '0 MB'}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <i className="fas fa-database text-green-400 text-sm md:text-base"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        {isMobile && (
          <div className="mb-4">
            <MobileTabs
              tabs={documentTabs}
              activeTab={filters.type}
              onChange={(tab) => setFilters({ ...filters, type: tab })}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-800 mb-6 md:mb-8">
          <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter (Desktop) */}
            {!isMobile && (
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="article_link">Article</option>
                  <option value="website">Website</option>
                  <option value="image">Image</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="title_desc">Title Z-A</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:flex-col md:gap-1">
              <button
                type="submit"
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 md:flex-none bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={() => handleDeleteDocument(document.id)}
                onView={() => router.push(`/documents/${document.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file text-gray-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Documents Yet</h3>
            <p className="text-gray-400 mb-6">
              {filters.search || filters.type !== 'all' || filters.category !== 'all'
                ? 'No documents match your filters'
                : 'Start building your research library'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          categories={categories}
        />
      )}
    </MainLayout>
  );
}