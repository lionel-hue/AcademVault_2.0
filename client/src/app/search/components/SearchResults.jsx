// client/src/app/search/components/SearchResults.jsx
"use client";

import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';
import VideoCard from './VideoCard';
import PDFCard from './PDFCard';
import ArticleCard from './ArticleCard';

export default function SearchResults({ results, query, type = 'all' }) {
    const { alert } = useModal();
    const [activeTab, setActiveTab] = useState(type === 'all' ? 'all' : type);
    const [sortBy, setSortBy] = useState('relevance');
    const [savedItems, setSavedItems] = useState({});

    const tabs = [
        { id: 'all', label: 'All Results', count: results.total_results, color: 'bg-blue-500' },
        { id: 'videos', label: 'Videos', count: results.videos.length, color: 'bg-red-500' },
        { id: 'pdfs', label: 'PDFs', count: results.pdfs.length, color: 'bg-green-500' },
        { id: 'articles', label: 'Articles', count: results.articles.length, color: 'bg-yellow-500' },
    ];

    const handleSave = async (item) => {
        try {
            const response = await AuthService.saveSearchResult(item);
            
            if (response.success) {
                setSavedItems(prev => ({
                    ...prev,
                    [item.data.id]: true
                }));
                
                await alert({
                    title: 'Saved Successfully',
                    message: 'Item has been added to your collection',
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

    const handleExport = async () => {
        const confirmed = await alert({
            title: 'Export Search Results',
            message: 'Would you like to export these results as a CSV file?',
            confirmText: 'Export',
            variant: 'info'
        });
        
        if (confirmed) {
            // Implement export functionality
            await alert({
                title: 'Coming Soon',
                message: 'Export feature will be available in the next update',
                variant: 'warning'
            });
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
                return sorted.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at));
            case 'popular':
                return sorted.sort((a, b) => (b.views || b.download_count || 0) - (a.views || a.download_count || 0));
            default:
                return sorted; // relevance
        }
    };

    const filteredResults = getFilteredResults();
    const sortedResults = getSortedResults(filteredResults);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Results for "<span className="text-blue-400">{query}</span>"
                        </h1>
                        <p className="text-gray-400">
                            Found {results.total_results} results across {results.videos.length} videos, {results.pdfs.length} papers, and {results.articles.length} articles
                        </p>
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
                        
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                        >
                            <i className="fas fa-download"></i>
                            Export
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto pb-2 -mx-4 px-4">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id 
                                    ? `${tab.color} text-white shadow-lg` 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {tab.label}
                                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'}`}>
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

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'all' ? (
                            // Mixed layout for all results
                            <>
                                {results.videos.slice(0, 3).map((video, index) => (
                                    <VideoCard 
                                        key={`video-${index}`} 
                                        video={video} 
                                        onSave={handleSave}
                                    />
                                ))}
                                {results.pdfs.slice(0, 3).map((pdf, index) => (
                                    <PDFCard 
                                        key={`pdf-${index}`} 
                                        pdf={pdf} 
                                        onSave={handleSave}
                                    />
                                ))}
                                {results.articles.slice(0, 3).map((article, index) => (
                                    <ArticleCard 
                                        key={`article-${index}`} 
                                        article={article} 
                                        onSave={handleSave}
                                    />
                                ))}
                            </>
                        ) : activeTab === 'videos' ? (
                            results.videos.map((video, index) => (
                                <VideoCard 
                                    key={`video-${index}`} 
                                    video={video} 
                                    onSave={handleSave}
                                />
                            ))
                        ) : activeTab === 'pdfs' ? (
                            results.pdfs.map((pdf, index) => (
                                <PDFCard 
                                    key={`pdf-${index}`} 
                                    pdf={pdf} 
                                    onSave={handleSave}
                                />
                            ))
                        ) : (
                            results.articles.map((article, index) => (
                                <ArticleCard 
                                    key={`article-${index}`} 
                                    article={article} 
                                    onSave={handleSave}
                                />
                            ))
                        )}
                    </div>

                    {/* Load More Button */}
                    {sortedResults.length > 0 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => {/* Implement pagination */}}
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors"
                            >
                                <i className="fas fa-plus mr-2"></i>
                                Load More Results
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Search Tips */}
            <div className="mt-12 pt-8 border-t border-gray-800">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-400"></i>
                    Search Tips
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