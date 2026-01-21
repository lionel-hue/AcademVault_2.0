"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function DocumentCard({ document, onDelete, onView }) {
  const router = useRouter();
  const { alert } = useModal();
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const getTypeIcon = () => {
    return document.icon || 'fas fa-file';
  };

  const getTypeColor = () => {
    return document.color || 'text-gray-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      router.push(`/documents/${document.id}`);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await AuthService.downloadDocument(document.id);
      if (response.success && response.data.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      await alert({
        title: 'Download Failed',
        message: 'Could not download document',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'view':
        handleView();
        break;
      case 'download':
        handleDownload();
        break;
      case 'share':
        navigator.clipboard.writeText(document.url || window.location.href);
        alert({
          title: 'Link Copied',
          message: 'Document link copied to clipboard',
          variant: 'success'
        });
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Document Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor()} bg-opacity-10`}>
            <i className={`${getTypeIcon()} text-lg`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate" title={document.title}>
              {document.title}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {document.author || 'Unknown'} • {formatDate(document.created_at)}
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        {isHovered && (
          <div className="flex gap-1">
            <button
              onClick={handleView}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg"
              title="View"
            >
              <i className="fas fa-eye"></i>
            </button>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg disabled:opacity-50"
              title="Download"
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
              title="Delete"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {document.description && (
        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
          {document.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <div className="flex items-center gap-3">
          {document.file_size && (
            <span className="flex items-center gap-1">
              <i className="fas fa-weight-hanging"></i>
              {document.formatted_file_size}
            </span>
          )}
          {document.view_count > 0 && (
            <span className="flex items-center gap-1">
              <i className="fas fa-eye"></i>
              {document.view_count}
            </span>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor()} bg-opacity-10`}>
          {document.type}
        </span>
      </div>

      {/* Source Badge */}
      {document.source_metadata?.source && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded text-xs">
            <i className={`fas fa-${document.source_metadata.source === 'youtube' ? 'youtube' : 'external-link-alt'}`}></i>
            Saved from {document.source_metadata.source}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleView}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
        >
          <i className="fas fa-eye mr-2"></i>
          View Details
        </button>
        <button
          onClick={handleDownload}
          disabled={loading || (!document.url && !document.file_path)}
          className="px-4 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
        </button>
      </div>
    </div>
  );
}