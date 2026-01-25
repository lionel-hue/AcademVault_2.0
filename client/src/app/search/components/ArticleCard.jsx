// client/src/app/search/components/ArticleCard.jsx - UPDATED WITH SAVE TO DOCUMENTS BUTTON
"use client";

import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function ArticleCard({ article, onSave, saved, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingToDocuments, setSavingToDocuments] = useState(false);
  const { alert } = useModal();

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

  // client/src/app/search/components/ArticleCard.jsx
  // Replace the ENTIRE handleSaveToDocuments function:

  const handleSaveToDocuments = async () => {
    setSavingToDocuments(true);
    try {
      // Helper function to get domain from URL
      const getDomain = (url) => {
        try {
          const urlObj = new URL(url);
          return urlObj.hostname.replace('www.', '');
        } catch {
          return article.domain || 'unknown.com';
        }
      };

      // Build the data object
      const documentData = {
        type: 'article',
        data: {
          title: article.title || 'Untitled Article',
          description: article.snippet || article.description || 'Article from web search',
          snippet: article.snippet || article.description || '',
          url: article.url || '',
          domain: article.domain || getDomain(article.url),
          author: article.author || null,
          published_at: article.published_at || null,
          reading_time: article.reading_time || null,
          id: article.id || null,
          thumbnail: article.thumbnail || null
        }
      };

      console.log('🟢 ArticleCard - Saving to documents:', {
        type: documentData.type,
        title: documentData.data.title,
        url: documentData.data.url,
        domain: documentData.data.domain,
        full_data: documentData
      });

      const response = await AuthService.saveSearchResultToDocuments(documentData);

      if (response.success) {
        console.log('✅ Article saved successfully:', response.data);
        await alert({
          title: 'Saved to Documents!',
          message: 'Article has been added to your documents library',
          variant: 'success'
        });
      } else {
        throw new Error(response.message || 'Failed to save article');
      }
    } catch (error) {
      console.error('❌ Error saving article:', error);
      await alert({
        title: 'Save Failed',
        message: error.message || 'Could not save article to documents',
        variant: 'danger'
      });
    } finally {
      setSavingToDocuments(false);
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

          {/* Save Actions */}
          <div className="flex gap-1">
            <button
              onClick={() => onSave && onSave()}
              className={`p-1 rounded ${saved ? 'text-yellow-400' : 'text-gray-400'}`}
              title={saved ? 'Saved' : 'Save'}
            >
              <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'} text-xs`}></i>
            </button>

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

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={handleVisit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            >
              <i className="fas fa-external-link-alt text-xs"></i>
              Read
            </button>

            <button
              onClick={handleSaveToDocuments}
              disabled={savingToDocuments}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <i className={`fas ${savingToDocuments ? 'fa-spinner fa-spin' : 'fa-folder-plus'} text-xs`}></i>
              Save
            </button>
          </div>
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

        {/* Save Actions */}
        <div className="flex gap-1">
          <button
            onClick={() => onSave && onSave()}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${saved
              ? 'text-yellow-400 bg-yellow-400/10'
              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
              }`}
            title={saved ? 'Saved to collection' : 'Save to collection'}
          >
            <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
          </button>

          {/* NEW: Save to Documents Button */}
          <button
            onClick={handleSaveToDocuments}
            disabled={savingToDocuments}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${savingToDocuments
              ? 'text-blue-400 bg-blue-400/10'
              : 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10'
              }`}
            title="Save to Documents Library"
          >
            <i className={`fas ${savingToDocuments ? 'fa-spinner fa-spin' : 'fa-folder-plus'}`}></i>
          </button>
        </div>
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
            onClick={handleSaveToDocuments}
            disabled={savingToDocuments}
            className="px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg md:rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className={`fas ${savingToDocuments ? 'fa-spinner fa-spin' : 'fa-folder-plus'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
}