"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { alert, confirm } = useModal();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (params.id) {
      loadDocument();
      loadRelatedDocuments();
    }
  }, [params.id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const response = await AuthService.getDocument(params.id);
      if (response.success) {
        // Format the document with icons and colors
        const formattedDoc = {
          ...response.data,
          icon: getDocumentIcon(response.data.type),
          color: getDocumentColor(response.data.type),
          formatted_file_size: formatFileSize(response.data.file_size)
        };
        setDocument(formattedDoc);
      } else {
        await alert({
          title: 'Document Not Found',
          message: 'The document you are looking for does not exist or you do not have access.',
          variant: 'danger'
        });
        router.push('/documents');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      handleDocumentError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedDocuments = async () => {
    try {
      const response = await AuthService.fetchUserDocuments({
        per_page: 4,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (response.success) {
        const filtered = response.data.data
          .filter(doc => doc.id !== params.id)
          .map(doc => ({
            ...doc,
            icon: getDocumentIcon(doc.type),
            color: getDocumentColor(doc.type),
            formatted_date: formatDocumentDate(doc.created_at)
          }));
        setRelatedDocuments(filtered);
      }
    } catch (error) {
      console.error('Error loading related documents:', error);
    }
  };

  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return 'fas fa-file-pdf text-red-400';
      case 'video': return 'fas fa-video text-blue-400';
      case 'article_link': return 'fas fa-newspaper text-green-400';
      case 'website': return 'fas fa-globe text-purple-400';
      case 'image': return 'fas fa-image text-yellow-400';
      case 'presentation': return 'fas fa-presentation text-pink-400';
      default: return 'fas fa-file text-gray-400';
    }
  };

  const getDocumentColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return 'bg-red-500/20 border-red-500/30';
      case 'video': return 'bg-blue-500/20 border-blue-500/30';
      case 'article_link': return 'bg-green-500/20 border-green-500/30';
      case 'website': return 'bg-purple-500/20 border-purple-500/30';
      case 'image': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'presentation': return 'bg-pink-500/20 border-pink-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleDocumentError = (error) => {
    console.error('Document error:', error);
    
    if (error.message.includes('404') || error.message.includes('not found')) {
      alert({
        title: 'Document Not Found',
        message: 'The document you\'re looking for doesn\'t exist or has been deleted.',
        variant: 'danger'
      }).then(() => router.push('/documents'));
    } else if (error.message.includes('401') || error.message.includes('403')) {
      alert({
        title: 'Access Denied',
        message: 'You don\'t have permission to view this document.',
        variant: 'warning'
      }).then(() => router.push('/documents'));
    } else {
      alert({
        title: 'Error Loading Document',
        message: 'There was an error loading the document. Please try again.',
        variant: 'danger'
      }).then(() => router.push('/documents'));
    }
  };

  const handleDownload = async () => {
    try {
      await AuthService.downloadDocument(params.id);
    } catch (error) {
      await alert({
        title: 'Download Failed',
        message: 'Could not download document',
        variant: 'danger'
      });
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      try {
        await AuthService.deleteDocument(params.id);
        await alert({
          title: 'Document Deleted',
          message: 'Document has been deleted successfully',
          variant: 'success'
        });
        router.push('/documents');
      } catch (error) {
        await alert({
          title: 'Error',
          message: 'Failed to delete document',
          variant: 'danger'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDocumentDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = parseFloat(bytes);
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading document...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${document.color} border`}>
                <i className={`${document.icon} text-2xl`}></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                  {document.title}
                </h1>
                <p className="text-gray-400">
                  {document.author || 'Unknown author'} • {formatDate(document.created_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <i className="fas fa-trash"></i>
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'details' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('details')}
          >
            <i className="fas fa-info-circle mr-2"></i>
            Details
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'preview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('preview')}
          >
            <i className="fas fa-eye mr-2"></i>
            Preview
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'metadata' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('metadata')}
          >
            <i className="fas fa-database mr-2"></i>
            Metadata
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'details' && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Document Information</h3>
                
                {document.description && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-300 whitespace-pre-line">{document.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Type</h4>
                    <p className="text-white capitalize">{document.type}</p>
                  </div>
                  
                  {document.author && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Author</h4>
                      <p className="text-white">{document.author}</p>
                    </div>
                  )}
                  
                  {document.publication_year && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Publication Year</h4>
                      <p className="text-white">{document.publication_year}</p>
                    </div>
                  )}
                  
                  {document.publisher && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Publisher</h4>
                      <p className="text-white">{document.publisher}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Added on</h4>
                    <p className="text-white">{formatDate(document.created_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">File Size</h4>
                    <p className="text-white">{document.formatted_file_size || formatFileSize(document.file_size)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Views</h4>
                    <p className="text-white">{document.view_count || 0}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Downloads</h4>
                    <p className="text-white">{document.download_count || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Document Preview</h3>
                
                {document.type === 'video' && document.url ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={document.url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : document.url ? (
                  <div className="h-96 rounded-lg overflow-hidden border border-gray-800">
                    <iframe
                      src={document.url}
                      className="w-full h-full"
                      title="Document Preview"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-file text-gray-600 text-2xl"></i>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">No Preview Available</h4>
                    <p className="text-gray-400">Download the document to view its contents</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Technical Metadata</h3>
                <div className="space-y-4">
                  {document.file_type && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">File Type</h4>
                      <p className="text-white">{document.file_type}</p>
                    </div>
                  )}
                  
                  {document.page_count && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Page Count</h4>
                      <p className="text-white">{document.page_count} pages</p>
                    </div>
                  )}
                  
                  {document.duration && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Duration</h4>
                      <p className="text-white">{document.duration}</p>
                    </div>
                  )}
                  
                  {document.license && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">License</h4>
                      <p className="text-white capitalize">{document.license.replace(/-/g, ' ')}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-300 mb-1">Visibility</h4>
                    <p className="text-white">{document.is_public ? 'Public' : 'Private'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document URL */}
            {document.url && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="font-bold text-white mb-3">Document URL</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={document.url}
                    readOnly
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(document.url);
                      alert({
                        title: 'Copied!',
                        message: 'URL copied to clipboard',
                        variant: 'success'
                      });
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                    title="Copy URL"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    onClick={() => window.open(document.url, '_blank')}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                    title="Open in new tab"
                  >
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Source Information */}
            {document.source_metadata && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="font-bold text-white mb-3">Source Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source</span>
                    <span className="text-white capitalize">{document.source_metadata.source}</span>
                  </div>
                  {document.source_metadata.saved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Saved on</span>
                      <span className="text-white">
                        {new Date(document.source_metadata.saved_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {document.source_metadata.original_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Original ID</span>
                      <span className="text-white text-sm truncate max-w-[120px]">
                        {document.source_metadata.original_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Documents */}
            {relatedDocuments.length > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="font-bold text-white mb-4">Related Documents</h3>
                <div className="space-y-3">
                  {relatedDocuments.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => router.push(`/documents/${doc.id}`)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.color} border`}>
                        <i className={doc.icon}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-gray-400 text-xs">{doc.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}