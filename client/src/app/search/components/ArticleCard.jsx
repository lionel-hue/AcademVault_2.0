// client/src/app/search/components/ArticleCard.jsx
"use client";

import { useState } from 'react';

export default function ArticleCard({ article, onSave }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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
        try {
            if (onSave) {
                await onSave({
                    type: 'article',
                    data: article
                });
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving article:', error);
        }
    };

    const handleVisit = () => {
        window.open(article.url, '_blank');
    };

    return (
        <div 
            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 mx-1 sm:mx-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Domain Badge */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <i className="fas fa-newspaper text-blue-400"></i>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-white">
                            {formatDomain(article.url)}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatReadingTime(article.reading_time)}</span>
                            <span>•</span>
                            <span>Article</span>
                        </div>
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

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <h3 className="text-white font-semibold mb-3 text-lg line-clamp-2 hover:text-blue-300 cursor-pointer">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                    </a>
                </h3>

                {/* Snippet/Preview */}
                <div className="relative mb-4">
                    <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                        {article.snippet || article.description}
                    </p>
                    
                    {/* Read more gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <i className="fas fa-clock text-gray-500"></i>
                        <span>Updated recently</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <i className="fas fa-check-circle text-green-500"></i>
                        <span>Verified source</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleVisit}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-external-link-alt"></i>
                        Read Article
                    </button>
                    
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {/* Copy link */}}
                            className="p-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
                            title="Copy link"
                        >
                            <i className="fas fa-link"></i>
                        </button>
                        <button
                            onClick={() => {/* Share */}}
                            className="p-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
                            title="Share"
                        >
                            <i className="fas fa-share"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Image (if available) */}
            {isHovered && article.thumbnail && (
                <div className="px-5 pb-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700">
                        <img 
                            src={article.thumbnail}
                            alt="Article preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 text-white text-sm">
                            Article preview
                        </div>
                    </div>
                </div>
            )}

            {/* Tags */}
            <div className="px-5 pb-4 pt-2">
                <div className="flex flex-wrap gap-2">
                    {article.tags && article.tags.slice(0, 3).map((tag, index) => (
                        <span 
                            key={index}
                            className="px-2.5 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg border border-gray-700"
                        >
                            #{tag}
                        </span>
                    ))}
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg border border-blue-500/20">
                        {article.source || 'web'}
                    </span>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-0 border-2 border-yellow-500/20 rounded-2xl pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
}