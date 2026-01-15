// client/src/app/search/components/ArticleCard.jsx - MOBILE OPTIMIZED
"use client";
import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function ArticleCard({ article, onSave, saved, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return article.domain || 'unknown.com';
    }
  };

  const formatReadingTime = (time) => {
    if (!time) return '5 min read';
    return time;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onSave) {
        await onSave({ type: 'article', data: article });
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisit = () => {
    window.open(article.url, '_blank');
  };

  // MOBILE-OPTIMIZED CARD
  if (isMobile) {
    return (
      <div className="w-full max-w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden mx-0">
        {/* Domain Badge */}
        <div className="px-2 py-1.5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <i className="fas fa-newspaper text-blue-400 text-xs"></i>
            </div>
            <div>
              <span className="text-xs font-medium text-white truncate max-w-[100px]">
                {formatDomain(article.url)}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{formatReadingTime(article.reading_time)}</span>
                <span>•</span>
                <span>Article</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`p-1 rounded ${saved ? 'text-yellow-400' : 'text-gray-400'} ${loading ? 'opacity-50' : ''}`}
            title={saved ? 'Saved' : 'Save'}
          >
            <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'} text-xs`}></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-2">
          {/* Title */}
          <h3 className="text-white font-medium text-xs line-clamp-2 mb-1 hover:text-blue-300">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </h3>

          {/* Snippet/Preview */}
          <p className="text-gray-400 text-xs line-clamp-2 mb-1.5">
            {article.snippet || article.description}
          </p>

          {/* Single Action Button */}
          <button
            onClick={handleVisit}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
          >
            <i className="fas fa-external-link-alt text-xs"></i>
            Read Article
          </button>
        </div>
      </div>
    );
  }

  // DESKTOP VERSION
  return (
    <div className="w-full h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:shadow-xl transition-all duration-300">
      {/* Domain Badge */}
      <div className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <i className="fas fa-newspaper text-blue-400 text-sm md:text-base"></i>
          </div>
          <div>
            <span className="text-sm md:text-base font-medium text-white truncate max-w-[200px]">
              {formatDomain(article.url)}
            </span>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
              <span>{formatReadingTime(article.reading_time)}</span>
              <span>•</span>
              <span>Article</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`p-1.5 md:p-2 rounded-lg transition-colors ${saved ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'} ${loading ? 'opacity-50' : ''}`}
          title={saved ? 'Saved to collection' : 'Save to collection'}
        >
          <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {/* Title */}
        <h3 className="text-white font-semibold mb-2 text-sm md:text-base line-clamp-2 hover:text-blue-300">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>

        {/* Snippet/Preview */}
        <p className="text-gray-400 text-sm md:text-base line-clamp-3 mb-3">
          {article.snippet || article.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleVisit}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
          >
            <i className="fas fa-external-link-alt"></i>
            Read Article
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(article.url)}
            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg md:rounded-xl text-white transition-colors"
            title="Copy link"
          >
            <i className="fas fa-link"></i>
          </button>
        </div>
      </div>
    </div>
  );
}