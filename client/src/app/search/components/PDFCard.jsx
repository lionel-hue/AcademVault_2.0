// client/src/app/search/components/PDFCard.jsx
"use client";

import { useState } from 'react';

export default function PDFCard({ pdf, onSave }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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
        try {
            if (onSave) {
                await onSave({
                    type: 'pdf',
                    data: pdf
                });
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving PDF:', error);
        }
    };

    return (
        <div 
            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 mx-1 sm:mx-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header with PDF icon */}
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <i className="fas fa-file-pdf text-red-400 text-xl"></i>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
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
                        className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                        title={isSaved ? 'Saved to collection' : 'Save to collection'}
                    >
                        <i className={`fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <h3 className="text-white font-semibold mb-3 line-clamp-2 text-lg">
                    {pdf.title}
                </h3>

                {/* Authors */}
                <div className="flex items-center gap-2 mb-4">
                    <i className="fas fa-user-friends text-gray-500 text-sm"></i>
                    <p className="text-sm text-gray-300 flex-1">
                        {formatAuthors(pdf.authors)}
                    </p>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-5 line-clamp-3">
                    {pdf.description}
                </p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {pdf.published_at && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <i className="fas fa-calendar text-blue-400 text-sm"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Published</p>
                                <p className="text-sm text-white">{formatDate(pdf.published_at)}</p>
                            </div>
                        </div>
                    )}
                    
                    {pdf.page_count && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <i className="fas fa-file-alt text-purple-400 text-sm"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Pages</p>
                                <p className="text-sm text-white">{pdf.page_count}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                    <button
                        onClick={() => window.open(pdf.pdf_url || pdf.url, '_blank')}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-download"></i>
                        Download PDF
                    </button>
                    
                    <button
                        onClick={() => window.open(pdf.url, '_blank')}
                        className="p-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
                        title="View Abstract"
                    >
                        <i className="fas fa-external-link-alt"></i>
                    </button>
                    
                    <button
                        onClick={() => {/* Cite functionality */}}
                        className="p-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
                        title="Cite this paper"
                    >
                        <i className="fas fa-quote-right"></i>
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-5 pb-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                        <button className="hover:text-white transition-colors flex items-center gap-1">
                            <i className="far fa-eye"></i>
                            <span>Preview</span>
                        </button>
                        <button className="hover:text-white transition-colors flex items-center gap-1">
                            <i className="far fa-star"></i>
                            <span>Rate</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="hover:text-white transition-colors">
                            <i className="fas fa-plus"></i>
                            <span className="ml-1">Add to Collection</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-0 border-2 border-green-500/20 rounded-2xl pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
}