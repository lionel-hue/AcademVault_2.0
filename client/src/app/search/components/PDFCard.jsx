// client/src/app/search/components/PDFCard.jsx - UPDATED WITH SAVE TO DOCUMENTS BUTTON
"use client";

import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function PDFCard({ pdf, onSave, saved, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingToDocuments, setSavingToDocuments] = useState(false);
  const { alert } = useModal();

  const formatAuthors = (authors) => {
    if (!authors || !authors.length) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  // client/src/app/search/components/PDFCard.jsx
  // Replace the ENTIRE handleSaveToDocuments function:

  const handleSaveToDocuments = async () => {
    setSavingToDocuments(true);
    try {
      // Build the data object
      const documentData = {
        type: 'pdf',
        data: {
          title: pdf.title || 'Untitled PDF',
          description: pdf.description || pdf.abstract || 'Research paper',
          url: pdf.url || pdf.pdf_url || '',
          pdf_url: pdf.pdf_url || pdf.url || '',
          authors: pdf.authors || [],
          author: pdf.author || null,
          published_at: pdf.published_at || null,
          id: pdf.id || null,
          page_count: pdf.page_count || null,
          citation_count: pdf.citation_count || null,
          source: pdf.source || 'arxiv'
        }
      };

      console.log('🔵 PDFCard - Saving to documents:', {
        type: documentData.type,
        title: documentData.data.title,
        url: documentData.data.url,
        authors: documentData.data.authors,
        full_data: documentData
      });

      const response = await AuthService.saveSearchResultToDocuments(documentData);

      if (response.success) {
        console.log('✅ PDF saved successfully:', response.data);
        await alert({
          title: 'Saved to Documents!',
          message: 'PDF has been added to your documents library',
          variant: 'success'
        });
      } else {
        throw new Error(response.message || 'Failed to save PDF');
      }
    } catch (error) {
      console.error('❌ Error saving PDF:', error);
      await alert({
        title: 'Save Failed',
        message: error.message || 'Could not save PDF to documents',
        variant: 'danger'
      });
    } finally {
      setSavingToDocuments(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(pdf.pdf_url || pdf.url, '_blank');
  };

  const handleViewAbstract = () => {
    window.open(pdf.url, '_blank');
  };

  // MOBILE-OPTIMIZED CARD
  if (isMobile) {
    return (
      <div className="w-full max-w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden mx-0">
        {/* Header */}
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
            {pdf.description || pdf.abstract}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2 border-t border-gray-800">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            >
              <i className="fas fa-download text-xs"></i>
              PDF
            </button>

            <button
              onClick={handleSaveToDocuments}
              disabled={savingToDocuments}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
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
      {/* Header */}
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

          {/* Save Actions */}
          <div className="flex gap-1">
            <button
              onClick={() => onSave && onSave()}
              className={`p-2 rounded-lg transition-colors ${saved
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
              className={`p-2 rounded-lg transition-colors ${savingToDocuments
                ? 'text-blue-400 bg-blue-400/10'
                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10'
                }`}
              title="Save to Documents Library"
            >
              <i className={`fas ${savingToDocuments ? 'fa-spinner fa-spin' : 'fa-folder-plus'}`}></i>
            </button>
          </div>
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
          {pdf.description || pdf.abstract}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
          >
            <i className="fas fa-download"></i>
            Download PDF
          </button>

          <button
            onClick={handleSaveToDocuments}
            disabled={savingToDocuments}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
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

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
          <button
            onClick={handleViewAbstract}
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-2 py-1 flex items-center gap-1"
          >
            <i className="fas fa-external-link-alt text-xs"></i>
            View Abstract
          </button>

          {pdf.citation_count && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-quote-right"></i>
              {pdf.citation_count} citations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}