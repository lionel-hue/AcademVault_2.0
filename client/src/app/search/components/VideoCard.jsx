"use client";

import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function VideoCard({ video, onSave, saved }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [downloadOptions, setDownloadOptions] = useState(null);
    const [loadingDownload, setLoadingDownload] = useState(false);
    
    const { alert, confirm } = useModal();

    const formatViews = (views) => {
        if (!views) return 'N/A';
        if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M views';
        if (views >= 1000) return (views / 1000).toFixed(1) + 'K views';
        return views + ' views';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            return `${Math.floor(diffDays / 365)} years ago`;
        } catch {
            return 'Recently';
        }
    };

    const handleDownload = async () => {
        setLoadingDownload(true);
        try {
            // Show educational disclaimer
            const confirmed = await confirm({
                title: 'Educational Download',
                message: 'This feature is for educational and research purposes only. Ensure you have permission to download this content. Continue?',
                confirmText: 'Continue for Research',
                variant: 'warning'
            });

            if (!confirmed) {
                setLoadingDownload(false);
                return;
            }

            // Get download options from backend
            const response = await AuthService.getVideoDownloadOptions(video.id);
            
            if (response.success) {
                setDownloadOptions(response.data);
                
                // Show download options modal
                await alert({
                    title: 'Download Options',
                    customContent: (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                                <h4 className="font-bold text-white mb-2">📚 Educational Use Only</h4>
                                <p className="text-sm text-gray-300">
                                    This video should only be downloaded for legitimate educational and research purposes.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {response.data.educational_alternatives?.map((tool, index) => (
                                    <a
                                        key={index}
                                        href={tool.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <i className={`fas fa-${tool.type === 'official' ? 'check-circle text-green-400' : 'archive text-blue-400'}`}></i>
                                            <span className="font-medium text-white">{tool.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">{tool.description}</p>
                                    </a>
                                ))}
                            </div>
                            
                            <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-800">
                                <h5 className="font-bold text-yellow-400 mb-1">⚠️ Important Notice</h5>
                                <p className="text-sm text-yellow-300">
                                    Direct video downloading may violate YouTube's Terms of Service. 
                                    Consider using screen recording software for research purposes.
                                </p>
                            </div>
                        </div>
                    ),
                    confirmText: 'I Understand',
                    size: 'lg'
                });
            }
        } catch (error) {
            console.error('Download error:', error);
            await alert({
                title: 'Download Unavailable',
                message: 'Direct download is not available. Try using screen recording software for educational purposes.',
                variant: 'info'
            });
        } finally {
            setLoadingDownload(false);
        }
    };

    const handleWatchOnYouTube = () => {
        window.open(video.url, '_blank');
    };

    const handleEmbed = () => {
        const embedUrl = video.embed_url || `https://www.youtube.com/embed/${video.id}`;
        navigator.clipboard.writeText(`<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`);
        alert({
            title: 'Embed Code Copied',
            message: 'The embed code has been copied to your clipboard.',
            variant: 'success',
            duration: 2000
        });
    };

    return (
        <div 
            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 mx-1 sm:mx-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-gray-800">
                <img 
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                />
                
                {/* Play Button Overlay */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <button
                            onClick={handleWatchOnYouTube}
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
                    <h3 className="text-white font-semibold line-clamp-2 flex-1 text-base md:text-lg">
                        {video.title}
                    </h3>
                    <button
                        onClick={() => onSave && onSave()}
                        className={`p-2 rounded-lg transition-colors ${
                            saved ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                        }`}
                        title={saved ? 'Saved to collection' : 'Save to collection'}
                    >
                        <i className={`fas ${saved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
                    </button>
                </div>

                {/* Channel Info */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{video.channel}</p>
                        <p className="text-xs text-gray-500">
                            {video.views ? `${formatViews(video.views)} • ` : ''}
                            {formatDate(video.published_at)}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {video.description}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800">
                    <button
                        onClick={handleWatchOnYouTube}
                        className="flex-1 min-w-[120px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
                    >
                        <i className="fab fa-youtube"></i>
                        Watch Video
                    </button>
                    
                    <button
                        onClick={handleDownload}
                        disabled={loadingDownload}
                        className="flex-1 min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingDownload ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Loading...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-download"></i>
                                Research Copy
                            </>
                        )}
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between mt-3">
                    <button
                        onClick={handleEmbed}
                        className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-1"
                        title="Copy embed code"
                    >
                        <i className="fas fa-code"></i>
                        <span className="hidden sm:inline">Embed</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">For research</span>
                        <i className="fas fa-graduation-cap text-blue-400 text-xs"></i>
                    </div>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-0 border-2 border-blue-500/20 rounded-2xl pointer-events-none transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
            }`}></div>
        </div>
    );
}