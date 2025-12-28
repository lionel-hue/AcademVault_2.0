// client/src/app/search/components/VideoCard.jsx
"use client";

import { useState } from 'react';

export default function VideoCard({ video, onSave }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const formatViews = (views) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M views';
        if (views >= 1000) return (views / 1000).toFixed(1) + 'K views';
        return views + ' views';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    const handleSave = async () => {
        try {
            if (onSave) {
                await onSave({
                    type: 'video',
                    data: video
                });
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving video:', error);
        }
    };

    return (
        <div 
            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-gray-800">
                <img 
                    src={video.thumbnail || 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'}
                    alt={video.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                />
                
                {/* Play Button Overlay */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <button 
                            onClick={() => window.open(video.url, '_blank')}
                            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transform scale-110 transition-all"
                        >
                            <i className="fas fa-play text-white text-xl ml-1"></i>
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
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-white font-semibold line-clamp-2 flex-1">
                        {video.title}
                    </h3>
                    <button
                        onClick={handleSave}
                        className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                        title={isSaved ? 'Saved to collection' : 'Save to collection'}
                    >
                        <i className={`fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
                    </button>
                </div>

                {/* Channel Info */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{video.channel}</p>
                        {video.views && (
                            <p className="text-xs text-gray-500">
                                {formatViews(video.views)} • {formatDate(video.published_at)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {video.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <button
                        onClick={() => window.open(video.url, '_blank')}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
                    >
                        <i className="fas fa-external-link-alt"></i>
                        Watch on YouTube
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(video.embed_url, '_blank')}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                            title="Embed video"
                        >
                            <i className="fas fa-code"></i>
                        </button>
                        <button
                            onClick={() => {/* Share functionality */}}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                            title="Share"
                        >
                            <i className="fas fa-share"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-0 border-2 border-blue-500/20 rounded-2xl pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
}