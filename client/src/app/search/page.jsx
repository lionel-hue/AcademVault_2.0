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
    const [recentSearches, setRecentSearches] = useState([]);

    useEffect(() => {
        loadSearchHistory();
        if (initialQuery) {
            performSearch(initialQuery, initialType);
        }
    }, []);

    const loadSearchHistory = async () => {
        try {
            const response = await AuthService.getSearchHistory();
            if (response.success) {
                const queries = response.data.map(item => item.query);
                const uniqueQueries = [...new Set(queries)].slice(0, 6);
                setSearchHistory(uniqueQueries);
                setRecentSearches(uniqueQueries.slice(0, 4));
            }
        } catch (error) {
            console.error('Error loading search history:', error.message);
            setSearchHistory([]);
            setRecentSearches([]);
        }
    };

    const performSearch = async (query, type = 'all') => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await AuthService.search({
                query: query.trim(),
                type,
                limit: 12 // Reduced for mobile performance
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
                setRecentSearches([]);
            } catch (error) {
                console.error('Error clearing search history:', error);
            }
        }
    };

    // Popular search suggestions
    const popularSearches = [
        'machine learning',
        'artificial intelligence',
        'data science',
        'quantum computing',
        'web development',
        'cybersecurity',
        'neural networks',
        'blockchain'
    ];

    return (
        <MainLayout>
            {/* Search Header - FIXED FOR MOBILE */}
            <div className="sticky top-16 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 py-3">
                <div className="w-full px-4 sm:px-6">
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <i className="fas fa-search text-gray-500 text-sm"></i>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search research..."
                                className="w-full pl-10 pr-28 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                                autoFocus
                            />
                            <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none hidden sm:block"
                                >
                                    <option value="all">All</option>
                                    <option value="videos">Videos</option>
                                    <option value="pdfs">PDFs</option>
                                    <option value="articles">Articles</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={loading || !searchQuery.trim()}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded text-white font-medium text-sm"
                                >
                                    {loading ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">Search</span>
                                            <i className="fas fa-search sm:ml-2"></i>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content - Mobile Optimized */}
            <div className="search-page-container container mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-8">
                {loading ? (
                    <div className="text-center py-12 md:py-16">
                        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 text-base md:text-lg">Searching for "{initialQuery}"...</p>
                        <p className="text-gray-500 text-sm md:text-base mt-2">Fetching results from multiple sources</p>
                    </div>
                ) : results ? (
                    <SearchResults
                        results={results}
                        query={initialQuery}
                        type={searchType}
                        onRefresh={(newResults) => setResults(newResults)}
                    />
                ) : initialQuery ? (
                    <div className="text-center py-12 md:py-16">
                        <i className="fas fa-search text-gray-600 text-3xl md:text-4xl mb-4"></i>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">No results found for "{initialQuery}"</h3>
                        <p className="text-gray-400 text-sm md:text-base">Try different keywords or check your spelling</p>
                    </div>
                ) : (
                    <div className="search-results-container max-w-4xl mx-auto w-full overflow-x-hidden">
                        {/* Recent Searches - Mobile Optimized */}
                        {recentSearches.length > 0 && (
                            <div className="mb-6 md:mb-8">
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                        <i className="fas fa-history text-blue-400"></i>
                                        <span className="hidden md:inline">Recent Searches</span>
                                        <span className="md:hidden">Recent</span>
                                    </h3>
                                    <button
                                        onClick={clearSearchHistory}
                                        className="text-sm text-gray-400 hover:text-gray-300"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((query, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickSearch(query)}
                                            className="px-3 md:px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors text-sm"
                                        >
                                            {query.length > 20 ? query.substring(0, 20) + '...' : query}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Searches */}
                        <div className="mb-6 md:mb-8">
                            <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                                <i className="fas fa-fire text-red-400"></i>
                                Popular Searches
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 md:gap-2">
                                {popularSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickSearch(search)}
                                        className="px-3 md:px-4 py-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-800 hover:to-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 text-sm md:text-base"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Tips - Mobile Optimized */}
                        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-gray-800">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">
                                Start Your Research Journey
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                                <div className="text-center p-4 bg-gray-800/30 rounded-xl">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                                        <i className="fas fa-video text-red-400 text-lg md:text-xl"></i>
                                    </div>
                                    <h4 className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Video Tutorials</h4>
                                    <p className="text-gray-400 text-xs md:text-sm">Educational videos from YouTube</p>
                                </div>
                                <div className="text-center p-4 bg-gray-800/30 rounded-xl">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                                        <i className="fas fa-file-pdf text-green-400 text-lg md:text-xl"></i>
                                    </div>
                                    <h4 className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Research Papers</h4>
                                    <p className="text-gray-400 text-xs md:text-sm">Academic papers and documents</p>
                                </div>
                                <div className="text-center p-4 bg-gray-800/30 rounded-xl">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                                        <i className="fas fa-newspaper text-blue-400 text-lg md:text-xl"></i>
                                    </div>
                                    <h4 className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Articles</h4>
                                    <p className="text-gray-400 text-xs md:text-sm">Research articles and blogs</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-800 pt-4 md:pt-6">
                                <h4 className="font-bold text-white mb-3 md:mb-4 text-center text-sm md:text-base">Try searching for academic topics:</h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Data Analysis'].map((topic) => (
                                        <button
                                            key={topic}
                                            onClick={() => handleQuickSearch(topic)}
                                            className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors text-sm"
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