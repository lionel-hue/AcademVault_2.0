"use client";
import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function VideoCard({ video, onSave, saved, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const { alert } = useModal();

  const formatViews = (views) => {
    if (!views) return '';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1d';
      if (diffDays < 7) return `${diffDays}d`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
      return `${Math.floor(diffDays / 365)}y`;
    } catch {
      return '';
    }
  };

  const handleWatchOnYouTube = () => {
    window.open(video.url, '_blank');
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    try {
      await alert({
        title: 'Coming Soon',
        message: 'Video download feature will be available soon!',
        variant: 'info'
      });
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleEmbed = () => {
    alert({
      title: 'Embed Code',
      message: `Use this code to embed: <iframe src="https://www.youtube.com/embed/${video.id}" width="560" height="315"></iframe>`,
      variant: 'info'
    });
  };

  // MOBILE-OPTIMIZED CARD
  if (isMobile) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
        {/* Thumbnail - Smaller on mobile */}
        <div className="relative aspect-video overflow-hidden bg-gray-800">
          <img
            src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
              {video.duration}
            </div>
          )}
        </div>

        {/* Content - Compact on mobile */}
        <div className="p-2">
          <div className="flex items-start gap-2 mb-1">
            {/* Save button on top right */}
            <button
              onClick={() => onSave && onSave()}
              className={`p-1.5 rounded ${saved ? 'text-yellow-400' : 'text-gray-400'}`}
            >
              <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
            </button>
            {/* Title - Truncated for mobile */}
            <h3 className="text-white text-xs font-medium line-clamp-2 flex-1">
              {video.title}
            </h3>
          </div>

          {/* Metadata - Single line on mobile */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="truncate">{video.channel}</span>
            <div className="flex items-center gap-1">
              {video.views && <span>{formatViews(video.views)}</span>}
              {video.views && video.published_at && <span>•</span>}
              {video.published_at && <span>{formatDate(video.published_at)}</span>}
            </div>
          </div>

          {/* Single Action Button on mobile */}
          <button
            onClick={handleWatchOnYouTube}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
          >
            <i className="fab fa-youtube"></i>
            Watch
          </button>
        </div>
      </div>
    );
  }

  // DESKTOP VERSION
  return (
    <div
      className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl md:rounded-2xl overflow-hidden hover:border-gray-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-800">
        <img
          src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        {/* Play Button Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <button
              onClick={handleWatchOnYouTube}
              className="w-12 h-12 md:w-14 md:h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transform scale-110 transition-all"
            >
              <i className="fas fa-play text-white text-lg ml-0.5 md:ml-1"></i>
            </button>
          </div>
        )}
        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
        {/* Source Badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <i className="fab fa-youtube"></i>
          <span>YouTube</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
          <h3 className="text-white font-semibold line-clamp-2 flex-1 text-sm md:text-base">
            {video.title}
          </h3>
          <button
            onClick={() => onSave && onSave()}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${
              saved
                ? 'text-yellow-400 bg-yellow-400/10'
                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
            }`}
            title={saved ? 'Saved to collection' : 'Save to collection'}
          >
            <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'} text-sm md:text-base`}></i>
          </button>
        </div>

        {/* Channel Info */}
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <i className="fas fa-user text-gray-400 text-xs md:text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-gray-300 truncate">{video.channel}</p>
            <p className="text-xs text-gray-500">
              {video.views ? `${formatViews(video.views)} • ` : ''}
              {formatDate(video.published_at)}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">
          {video.description}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 pt-2 md:pt-3 border-t border-gray-800">
          <button
            onClick={handleWatchOnYouTube}
            className="flex-1 min-w-[100px] md:min-w-[120px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-1.5 text-xs md:text-sm"
          >
            <i className="fab fa-youtube text-xs md:text-sm"></i>
            Watch Video
          </button>
          <button
            onClick={handleDownload}
            disabled={loadingDownload}
            className="flex-1 min-w-[100px] md:min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingDownload ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs md:text-sm"></i>
                Loading...
              </>
            ) : (
              <>
                <i className="fas fa-download text-xs md:text-sm"></i>
                Research Copy
              </>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-2 md:mt-3">
          <button
            onClick={handleEmbed}
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-2 py-1 flex items-center gap-1"
            title="Copy embed code"
          >
            <i className="fas fa-code text-xs"></i>
            <span className="hidden sm:inline">Embed</span>
          </button>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">For research</span>
            <i className="fas fa-graduation-cap text-blue-400 text-xs"></i>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div
        className={`absolute inset-0 border-2 border-blue-500/20 rounded-xl md:rounded-2xl pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>
    </div>
  );
}