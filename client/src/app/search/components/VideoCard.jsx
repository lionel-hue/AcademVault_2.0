// client/src/app/search/components/VideoCard.jsx - UPDATED WITH SAVE TO DOCUMENTS BUTTON
"use client";

import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function VideoCard({ video, onSave, saved, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingToDocuments, setSavingToDocuments] = useState(false);
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

  // NEW FUNCTION: Save video to documents library
  const handleSaveToDocuments = async () => {
    setSavingToDocuments(true);
    try {
      const documentData = {
        type: 'video',
        data: {
          title: video.title,
          description: video.description || `Video from YouTube channel: ${video.channel}`,
          url: video.url,
          thumbnail: video.thumbnail,
          duration: video.duration,
          channel: video.channel,
          views: video.views,
          published_at: video.published_at,
          source: 'youtube',
          source_id: video.id
        }
      };

      const response = await AuthService.saveSearchResultToDocuments(documentData);
      
      if (response.success) {
        await alert({
          title: 'Saved to Documents!',
          message: 'Video has been added to your documents library',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving to documents:', error);
      await alert({
        title: 'Save Failed',
        message: 'Could not save video to documents',
        variant: 'danger'
      });
    } finally {
      setSavingToDocuments(false);
    }
  };

  const handleWatchOnYouTube = () => {
    window.open(video.url, '_blank');
  };

  // MOBILE-OPTIMIZED CARD
  if (isMobile) {
    return (
      <div className="w-full max-w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden mx-0">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-800">
          <img 
            src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} 
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-1 right-1 bg-black/90 text-white text-xs px-1 py-0.5 rounded">
              {video.duration}
            </div>
          )}
          
          {/* YouTube Badge */}
          <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <i className="fab fa-youtube"></i>
            <span className="hidden xs:inline">YouTube</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-2">
          <div className="flex items-start justify-between mb-1">
            {/* Title */}
            <h3 className="text-white text-xs font-medium line-clamp-2 flex-1 mr-2">
              {video.title}
            </h3>
            
            {/* Save button */}
            <div className="flex gap-1">
              <button
                onClick={() => onSave && onSave()}
                className={`p-1 rounded ${saved ? 'text-yellow-400' : 'text-gray-400'}`}
                title={saved ? 'Saved' : 'Save'}
              >
                <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'} text-xs`}></i>
              </button>
              
              {/* NEW: Save to Documents button */}
              <button
                onClick={handleSaveToDocuments}
                disabled={savingToDocuments}
                className={`p-1 rounded ${savingToDocuments ? 'text-blue-400' : 'text-gray-400'}`}
                title="Save to Documents"
              >
                <i className={`fas ${savingToDocuments ? 'fa-spinner fa-spin' : 'fa-folder-plus'} text-xs`}></i>
              </button>
            </div>
          </div>

          {/* Channel and metadata */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="truncate max-w-[60%]">{video.channel}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {video.views && <span>{formatViews(video.views)}</span>}
              {video.views && video.published_at && <span>•</span>}
              {video.published_at && <span>{formatDate(video.published_at)}</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={handleWatchOnYouTube}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            >
              <i className="fab fa-youtube"></i>
              Watch
            </button>
            
            <button
              onClick={handleSaveToDocuments}
              disabled={savingToDocuments}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <i className={`fas ${savingToDocuments ? 'fa-spinner fa-spin' : 'fa-folder-plus'} text-xs`}></i>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP/TABLET VERSION
  return (
    <div 
      className="w-full h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-800">
        <img 
          src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          loading="lazy"
        />
        
        {/* Play Button Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <button
              onClick={handleWatchOnYouTube}
              className="w-12 h-12 md:w-14 md:h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transform scale-110 transition-all"
            >
              <i className="fas fa-play text-white text-lg ml-0.5"></i>
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
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold line-clamp-2 flex-1 text-sm md:text-base">
            {video.title}
          </h3>
          
          {/* Save Actions */}
          <div className="flex gap-1">
            <button
              onClick={() => onSave && onSave()}
              className={`p-1.5 rounded-lg transition-colors ${
                saved 
                  ? 'text-yellow-400 bg-yellow-400/10' 
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
              }`}
              title={saved ? 'Saved to collection' : 'Save to collection'}
            >
              <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'} text-sm`}></i>
            </button>
            
            {/* NEW: Save to Documents Button */}
            <button
              onClick={handleSaveToDocuments}
              disabled={savingToDocuments}
              className={`p-1.5 rounded-lg transition-colors ${
                savingToDocuments 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10'
              }`}
              title="Save to Documents Library"
            >
              <i className={`fas ${savingToDocuments ? 'fa-spinner fa-spin' : 'fa-folder-plus'} text-sm`}></i>
            </button>
          </div>
        </div>

        {/* Channel Info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <i className="fas fa-user text-gray-400 text-xs"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-gray-300 truncate">{video.channel}</p>
            <p className="text-xs text-gray-500">
              {video.views ? `${formatViews(video.views)} views • ` : ''}
              {formatDate(video.published_at)}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-3">
          {video.description}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={handleWatchOnYouTube}
            className="flex-1 min-w-[120px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-2 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-xs md:text-sm"
          >
            <i className="fab fa-youtube"></i>
            Watch Video
          </button>
          
          <button
            onClick={handleSaveToDocuments}
            disabled={savingToDocuments}
            className="flex-1 min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-2 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingToDocuments ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-folder-plus"></i>
                Save to Docs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}