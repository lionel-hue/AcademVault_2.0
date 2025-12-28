// client/src/app/search/page.jsx - UPDATED VERSION
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import AuthService from '@/lib/auth';
import SearchResults from '@/app/search/components/SearchResults';
import { useModal } from '@/app/components/UI/Modal/ModalContext';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { alert } = useModal();

    const initialQuery = searchParams.get('q') || '';
    const initialType = searchParams.get('type') || 'all';

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchType, setSearchType] = useState(initialType);
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        loadSearchHistory();

        if (initialQuery) {
            performSearch(initialQuery, initialType);
        }
    }, []);

    // In your dashboard page.jsx - Update the loadSearchHistory function
    const loadSearchHistory = async () => {
        try {
            const response = await AuthService.getSearchHistory();
            if (response.success) {
                // Extract just the query strings from the history
                const queries = response.data.map(item => item.query);
                // Remove duplicates and limit
                const uniqueQueries = [...new Set(queries)].slice(0, 8);
                setSearchHistory(uniqueQueries);
            }
        } catch (error) {
            console.error('Error loading search history:', error.message);
            setSearchHistory([]);
        }
    };

    const performSearch = async (query, type = 'all') => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await AuthService.search({
                query: query.trim(),
                type,
                limit: 20
            });

            if (response.success) {
                setResults(response.data);
            } else {
                await alert({
                    title: 'Search Error',
                    message: response.message || 'Failed to perform search',
                    variant: 'danger'
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            await alert({
                title: 'Search Error',
                message: error.message || 'Failed to perform search',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // Update URL without page reload
        const params = new URLSearchParams();
        params.set('q', searchQuery.trim());
        if (searchType !== 'all') {
            params.set('type', searchType);
        }
        router.push(`/search?${params.toString()}`);

        performSearch(searchQuery.trim(), searchType);
    };

    const handleQuickSearch = (query) => {
        setSearchQuery(query);
        router.push(`/search?q=${encodeURIComponent(query)}`);
        performSearch(query, searchType);
    };

    const clearSearchHistory = async () => {
        const confirmed = await alert({
            title: 'Clear Search History',
            message: 'Are you sure you want to clear all your search history?',
            confirmText: 'Clear',
            variant: 'warning'
        });

        if (confirmed) {
            try {
                await AuthService.clearSearchHistory();
                setSearchHistory([]);
            } catch (error) {
                console.error('Error clearing search history:', error);
            }
        }
    };

    return (
        <MainLayout>
            {/* Search Header */}
            <div className="sticky top-16 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 py-6">
                <div className="container mx-auto px-4">
                    <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <i className="fas fa-search text-gray-500"></i>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for research topics, videos, papers..."
                                className="w-full pl-12 pr-32 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                autoFocus
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="all">All</option>
                                    <option value="videos">Videos</option>
                                    <option value="pdfs">PDFs</option>
                                    <option value="articles">Articles</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={loading || !searchQuery.trim()}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200"
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Searching...
                                        </>
                                    ) : 'Search'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Quick Filters */}
                    {initialQuery && (
                        <div className="flex justify-center gap-2 mt-6 flex-wrap">
                            <button
                                onClick={() => setSearchType('all')}
                                className={`px-4 py-2 rounded-lg transition-colors ${searchType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                All Results
                            </button>
                            <button
                                onClick={() => setSearchType('videos')}
                                className={`px-4 py-2 rounded-lg transition-colors ${searchType === 'videos' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                Videos
                            </button>
                            <button
                                onClick={() => setSearchType('pdfs')}
                                className={`px-4 py-2 rounded-lg transition-colors ${searchType === 'pdfs' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                PDFs
                            </button>
                            <button
                                onClick={() => setSearchType('articles')}
                                className={`px-4 py-2 rounded-lg transition-colors ${searchType === 'articles' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                Articles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Searching for "{initialQuery}"...</p>
                        <p className="text-gray-500 text-sm mt-2">Fetching results from multiple sources</p>
                    </div>
                ) : results ? (
                    <SearchResults
                        results={results}
                        query={initialQuery}
                        type={searchType}
                    />
                ) : initialQuery ? (
                    <div className="text-center py-16">
                        <i className="fas fa-search text-gray-600 text-4xl mb-4"></i>
                        <h3 className="text-xl font-bold text-white mb-2">No results found for "{initialQuery}"</h3>
                        <p className="text-gray-400">Try different keywords or check your spelling</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {/* Recent Searches */}
                        {searchHistory.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <i className="fas fa-history text-blue-400"></i>
                                        Recent Searches
                                    </h3>
                                    <button
                                        onClick={clearSearchHistory}
                                        className="text-sm text-gray-400 hover:text-gray-300"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {searchHistory.map((query, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickSearch(query)}
                                            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                                        >
                                            {query}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Tips */}
                        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                            <h3 className="text-2xl font-bold text-white mb-6 text-center">
                                Start Your Research Journey
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-video text-red-400 text-xl"></i>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">Video Tutorials</h4>
                                    <p className="text-gray-400 text-sm">
                                        Find educational videos from YouTube and other platforms
                                    </p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-file-pdf text-green-400 text-xl"></i>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">Research Papers</h4>
                                    <p className="text-gray-400 text-sm">
                                        Access academic papers and research documents
                                    </p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-newspaper text-blue-400 text-xl"></i>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">Articles & Blogs</h4>
                                    <p className="text-gray-400 text-sm">
                                        Read articles and blog posts from trusted sources
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-800">
                                <h4 className="font-bold text-white mb-4">Try searching for:</h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['machine learning', 'artificial intelligence', 'data science', 'quantum computing', 'cybersecurity', 'web development'].map((topic) => (
                                        <button
                                            key={topic}
                                            onClick={() => handleQuickSearch(topic)}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}