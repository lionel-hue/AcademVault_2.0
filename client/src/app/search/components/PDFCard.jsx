// client/src/app/search/components/PDFCard.jsx - MOBILE OPTIMIZED
"use client";
import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function PDFCard({ pdf, onSave, saved, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatAuthors = (authors) => {
    if (!authors || !authors.length) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onSave) {
        await onSave({ type: 'pdf', data: pdf });
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  // MOBILE-OPTIMIZED CARD
  if (isMobile) {
    return (
      <div className="w-full max-w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden mx-0">
        {/* Header with PDF icon */}
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-2 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <i className="fas fa-file-pdf text-red-400 text-sm"></i>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium uppercase">Research Paper</span>
                {pdf.source === 'arxiv' && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">arXiv</span>
                  </div>
                )}
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
        </div>

        {/* Content */}
        <div className="p-2">
          {/* Title */}
          <h3 className="text-white font-medium text-xs line-clamp-2 mb-1">
            {pdf.title}
          </h3>

          {/* Authors */}
          <div className="flex items-center gap-1 mb-1">
            <i className="fas fa-user-friends text-gray-500 text-xs"></i>
            <p className="text-xs text-gray-300 flex-1 truncate">
              {formatAuthors(pdf.authors)}
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-xs line-clamp-2 mb-2">
            {pdf.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2 border-t border-gray-800">
            <button
              onClick={() => window.open(pdf.pdf_url || pdf.url, '_blank')}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            >
              <i className="fas fa-download text-xs"></i>
              PDF
            </button>
            <button
              onClick={() => window.open(pdf.url, '_blank')}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-xs"
              title="View Abstract"
            >
              <i className="fas fa-external-link-alt"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP VERSION
  return (
    <div className="w-full h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:shadow-xl transition-all duration-300">
      {/* Header with PDF icon */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-3 md:p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <i className="fas fa-file-pdf text-red-400 text-lg md:text-xl"></i>
            </div>
            <div>
              <span className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-wider">
                Research Paper
              </span>
              {pdf.source === 'arxiv' && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-400">arXiv</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${saved ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'} ${loading ? 'opacity-50' : ''}`}
            title={saved ? 'Saved to collection' : 'Save to collection'}
          >
            <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {/* Title */}
        <h3 className="text-white font-semibold mb-2 text-sm md:text-base line-clamp-2">
          {pdf.title}
        </h3>

        {/* Authors */}
        <div className="flex items-center gap-2 mb-3">
          <i className="fas fa-user-friends text-gray-500 text-sm"></i>
          <p className="text-sm text-gray-300 flex-1">
            {formatAuthors(pdf.authors)}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {pdf.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
          <button
            onClick={() => window.open(pdf.pdf_url || pdf.url, '_blank')}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
          >
            <i className="fas fa-download"></i>
            Download PDF
          </button>
          <button
            onClick={() => window.open(pdf.url, '_blank')}
            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg md:rounded-xl text-white transition-colors"
            title="View Abstract"
          >
            <i className="fas fa-external-link-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
} 