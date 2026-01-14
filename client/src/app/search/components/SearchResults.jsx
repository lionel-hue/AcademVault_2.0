"use client";

import { useState, useEffect } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';
import VideoCard from './VideoCard';
import PDFCard from './PDFCard';
import ArticleCard from './ArticleCard';

export default function SearchResults({ results, query, type = 'all', onRefresh }) {
    const { alert } = useModal();
    const [activeTab, setActiveTab] = useState(type === 'all' ? 'all' : type);
    const [sortBy, setSortBy] = useState('relevance');
    const [savedItems, setSavedItems] = useState({});
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const tabs = [
        { id: 'all', label: 'All Results', count: results.total_results, color: 'bg-blue-500', icon: 'fas fa-layer-group' },
        { id: 'videos', label: 'Videos', count: results.videos.length, color: 'bg-red-500', icon: 'fas fa-video' },
        { id: 'pdfs', label: 'PDFs', count: results.pdfs.length, color: 'bg-green-500', icon: 'fas fa-file-pdf' },
        { id: 'articles', label: 'Articles', count: results.articles.length, color: 'bg-yellow-500', icon: 'fas fa-newspaper' },
    ];

    const handleSave = async (item) => {
        try {
            const response = await AuthService.saveSearchResult({
                type: item.type,
                data: item.data
            });

            if (response.success) {
                setSavedItems(prev => ({ ...prev, [item.data.id]: true }));
                await alert({
                    title: 'Saved Successfully',
                    message: 'Item has been added to your bookmarks',
                    variant: 'success',
                    duration: 2000
                });
            }
        } catch (error) {
            console.error('Error saving item:', error);
            await alert({
                title: 'Save Failed',
                message: error.message || 'Could not save item',
                variant: 'danger'
            });
        }
    };

    const handleExport = async (format = 'json') => {
        try {
            const confirmed = await alert({
                title: 'Export Search Results',
                message: `Export ${results.total_results} results as ${format.toUpperCase()}?`,
                confirmText: 'Export',
                variant: 'info'
            });

            if (confirmed) {
                let content, mimeType, filename;

                switch (format) {
                    case 'json':
                        content = JSON.stringify(results, null, 2);
                        mimeType = 'application/json';
                        filename = `search-results-${query}-${Date.now()}.json`;
                        break;
                    case 'csv':
                        const csvRows = [];
                        // Add header
                        csvRows.push(['Type', 'Title', 'Source', 'URL', 'Published', 'Description'].join(','));

                        // Add videos
                        results.videos.forEach(video => {
                            csvRows.push([
                                'Video',
                                `"${video.title.replace(/"/g, '""')}"`,
                                video.source || 'youtube',
                                video.url,
                                video.published_at?.split('T')[0] || '',
                                `"${video.description?.replace(/"/g, '""').substring(0, 100)}..."`
                            ].join(','));
                        });

                        // Add PDFs
                        results.pdfs.forEach(pdf => {
                            csvRows.push([
                                'PDF',
                                `"${pdf.title.replace(/"/g, '""')}"`,
                                pdf.source || 'arxiv',
                                pdf.url,
                                pdf.published_at?.split('T')[0] || '',
                                `"${pdf.description?.replace(/"/g, '""').substring(0, 100)}..."`
                            ].join(','));
                        });

                        // Add articles
                        results.articles.forEach(article => {
                            csvRows.push([
                                'Article',
                                `"${article.title.replace(/"/g, '""')}"`,
                                article.domain || 'web',
                                article.url,
                                article.published_at?.split('T')[0] || '',
                                `"${article.snippet?.replace(/"/g, '""').substring(0, 100)}..."`
                            ].join(','));
                        });

                        content = csvRows.join('\n');
                        mimeType = 'text/csv';
                        filename = `search-results-${query}-${Date.now()}.csv`;
                        break;
                }

                // Download file
                const blob = new Blob([content], { type: mimeType });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                await alert({
                    title: 'Export Successful',
                    message: `Results exported as ${filename}`,
                    variant: 'success',
                    duration: 2000
                });
            }
        } catch (error) {
            console.error('Export error:', error);
            await alert({
                title: 'Export Failed',
                message: 'Could not export results',
                variant: 'danger'
            });
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await AuthService.search({
                query: query,
                type: activeTab === 'all' ? 'all' : activeTab,
                limit: 20,
                page: nextPage
            });

            if (response.success && response.data) {
                // Merge new results
                const newResults = response.data;

                if (newResults.videos.length === 0 && newResults.pdfs.length === 0 && newResults.articles.length === 0) {
                    setHasMore(false);
                } else {
                    setPage(nextPage);

                    // You would need to update parent component's results
                    // This is a simplified approach
                    if (onRefresh) {
                        onRefresh({
                            ...results,
                            videos: [...results.videos, ...newResults.videos],
                            pdfs: [...results.pdfs, ...newResults.pdfs],
                            articles: [...results.articles, ...newResults.articles],
                            total_results: results.total_results + newResults.total_results
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Load more error:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const getFilteredResults = () => {
        switch (activeTab) {
            case 'videos': return results.videos;
            case 'pdfs': return results.pdfs;
            case 'articles': return results.articles;
            default: return [...results.videos, ...results.pdfs, ...results.articles];
        }
    };

    const getSortedResults = (items) => {
        const sorted = [...items];
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) =>
                    new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
                );
            case 'oldest':
                return sorted.sort((a, b) =>
                    new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at)
                );
            case 'popular':
                return sorted.sort((a, b) =>
                    (b.views || b.citation_count || b.download_count || 0) -
                    (a.views || a.citation_count || a.download_count || 0)
                );
            default:
                return sorted; // relevance
        }
    };

    const filteredResults = getFilteredResults();
    const sortedResults = getSortedResults(filteredResults);

    // Source indicators
    const getSourceInfo = () => {
        const sources = results.metadata?.sources_used || [];
        const hasRealData = results.metadata?.has_real_data || false;

        return {
            sources,
            hasRealData,
            sourceCount: sources.length
        };
    };

    const sourceInfo = getSourceInfo();

    return (
        <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Search results for "<span className="text-blue-400">{query}</span>"
                        </h1>
                        <div className="flex items-center gap-4 flex-wrap">
                            <p className="text-gray-400">
                                Found {results.total_results} results across {results.videos.length} videos, {results.pdfs.length} papers, and {results.articles.length} articles
                            </p>

                            {/* Source Indicators */}
                            {sourceInfo.sources.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Sources:</span>
                                    <div className="flex gap-1">
                                        {sourceInfo.sources.map((source, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                                                {source.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                    {!sourceInfo.hasRealData && (
                                        <span className="text-xs text-yellow-500 flex items-center gap-1">
                                            <i className="fas fa-info-circle"></i>
                                            Using demo data
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="relevance">Sort by: Relevance</option>
                            <option value="newest">Sort by: Newest</option>
                            <option value="oldest">Sort by: Oldest</option>
                            <option value="popular">Sort by: Popular</option>
                        </select>

                        <div className="relative group">
                            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                                <i className="fas fa-download"></i>
                                Export
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
                                <button
                                    onClick={() => handleExport('json')}
                                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                    <i className="fas fa-file-code mr-2"></i>
                                    Export as JSON
                                </button>
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                    <i className="fas fa-file-csv mr-2"></i>
                                    Export as CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto pb-2 -mx-4 px-4">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                        ? `${tab.color} text-white shadow-lg`
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <i className={tab.icon}></i>
                                {tab.label}
                                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {sortedResults.length === 0 ? (
                <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800">
                    <i className="fas fa-search text-gray-600 text-4xl mb-4"></i>
                    <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your search terms or filters</p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                        >
                            <i className="fas fa-redo mr-2"></i>
                            Search Again
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-400">
                            Showing {sortedResults.length} of {filteredResults.length} results
                            {page > 1 && ` (Page ${page})`}
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <i className="fas fa-arrow-up"></i>
                                Back to top
                            </button>
                        </div>
                    </div>

                    {/* Grid Layout - MOBILE OPTIMIZED */}
                    <div className="search-results-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6 max-w-full overflow-x-hidden">
                        {activeTab === 'all' ? (
                            // Mixed layout for all results with proper mobile sizing
                            <>
                                {results.videos.slice(0, 2).map((video, index) => (
                                    <div key={`video-${video.id || index}`} className="w-full h-full">
                                        <VideoCard
                                            video={video}
                                            onSave={() => handleSave({ type: 'video', data: video })}
                                            saved={savedItems[video.id]}
                                        />
                                    </div>
                                ))}
                                {results.pdfs.slice(0, 2).map((pdf, index) => (
                                    <div key={`pdf-${pdf.id || index}`} className="w-full h-full">
                                        <PDFCard
                                            pdf={pdf}
                                            onSave={() => handleSave({ type: 'pdf', data: pdf })}
                                            saved={savedItems[pdf.id]}
                                        />
                                    </div>
                                ))}
                                {results.articles.slice(0, 2).map((article, index) => (
                                    <div key={`article-${article.id || index}`} className="w-full h-full">
                                        <ArticleCard
                                            article={article}
                                            onSave={() => handleSave({ type: 'article', data: article })}
                                            saved={savedItems[article.id]}
                                        />
                                    </div>
                                ))}
                            </>
                        ) : activeTab === 'videos' ? (
                            results.videos.map((video, index) => (
                                <div key={`video-${video.id || index}`} className="w-full h-full">
                                    <VideoCard
                                        video={video}
                                        onSave={() => handleSave({ type: 'video', data: video })}
                                        saved={savedItems[video.id]}
                                    />
                                </div>
                            ))
                        ) : activeTab === 'pdfs' ? (
                            results.pdfs.map((pdf, index) => (
                                <div key={`pdf-${pdf.id || index}`} className="w-full h-full">
                                    <PDFCard
                                        pdf={pdf}
                                        onSave={() => handleSave({ type: 'pdf', data: pdf })}
                                        saved={savedItems[pdf.id]}
                                    />
                                </div>
                            ))
                        ) : (
                            results.articles.map((article, index) => (
                                <div key={`article-${article.id || index}`} className="w-full h-full">
                                    <ArticleCard
                                        article={article}
                                        onSave={() => handleSave({ type: 'article', data: article })}
                                        saved={savedItems[article.id]}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Load More Button */}
                    {hasMore && sortedResults.length > 0 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-plus mr-2"></i>
                                        Load More Results
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Results Summary */}
                    <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <i className="fas fa-chart-bar text-blue-400"></i>
                            Search Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                                <div className="text-2xl font-bold text-white">{results.total_results}</div>
                                <div className="text-sm text-gray-400">Total Results</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                                <div className="text-2xl font-bold text-red-400">{results.videos.length}</div>
                                <div className="text-sm text-gray-400">Videos</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                                <div className="text-2xl font-bold text-green-400">{results.pdfs.length}</div>
                                <div className="text-sm text-gray-400">Research Papers</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-400">{results.articles.length}</div>
                                <div className="text-sm text-gray-400">Articles</div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Search Tips & API Setup Guide */}
            {!sourceInfo.hasRealData && (
                <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-800/30">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="fas fa-rocket text-yellow-400"></i>
                        Unlock Real Search Results
                    </h4>
                    <p className="text-gray-300 mb-4">
                        You're currently viewing demo data. To get real results from YouTube, arXiv, and web search:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-4 bg-gray-800/30 rounded-xl">
                            <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                                <i className="fab fa-youtube text-red-400"></i>
                                YouTube API
                            </h5>
                            <p className="text-sm text-gray-400">
                                Get free API key from Google Cloud Console
                            </p>
                        </div>
                        <div className="p-4 bg-gray-800/30 rounded-xl">
                            <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                                <i className="fas fa-graduation-cap text-green-400"></i>
                                arXiv API
                            </h5>
                            <p className="text-sm text-gray-400">
                                No API key needed - already integrated!
                            </p>
                        </div>
                        <div className="p-4 bg-gray-800/30 rounded-xl">
                            <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                                <i className="fab fa-google text-blue-400"></i>
                                Google Custom Search
                            </h5>
                            <p className="text-sm text-gray-400">
                                Get API key from Google Developers Console
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm"
                    >
                        <i className="fas fa-external-link-alt mr-2"></i>
                        Get API Keys
                    </button>
                </div>
            )}

            {/* Search Tips */}
            <div className="mt-12 pt-8 border-t border-gray-800">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-400"></i>
                    Search Tips & Advanced Queries
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                        <i className="fas fa-quote-left text-blue-400 mb-2"></i>
                        <p className="text-sm text-gray-300">
                            Use quotes for exact matches: "<span className="text-blue-400">machine learning</span>"
                        </p>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                        <i className="fas fa-minus text-green-400 mb-2"></i>
                        <p className="text-sm text-gray-300">
                            Exclude terms with minus: <span className="text-blue-400">neural -network</span>
                        </p>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                        <i className="fas fa-filter text-purple-400 mb-2"></i>
                        <p className="text-sm text-gray-300">
                            Filter by type: <span className="text-blue-400">type:pdf</span> or <span className="text-blue-400">type:video</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}