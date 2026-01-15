// client/src/app/search/components/SearchResults.jsx - FULLY MOBILE OPTIMIZED
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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile - Updated for 720px specifically
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      // Consider 720px and below as mobile
      setIsMobile(width <= 720);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-optimized tabs
  const mobileTabs = [
    { id: 'all', label: 'All', icon: 'fas fa-layer-group' },
    { id: 'videos', label: 'Videos', icon: 'fas fa-video' },
    { id: 'pdfs', label: 'PDFs', icon: 'fas fa-file-pdf' },
    { id: 'articles', label: 'Web', icon: 'fas fa-newspaper' },
  ];

  const desktopTabs = [
    { id: 'all', label: 'All Results', count: results?.total_results || 0, icon: 'fas fa-layer-group' },
    { id: 'videos', label: 'Videos', count: results?.videos?.length || 0, icon: 'fas fa-video' },
    { id: 'pdfs', label: 'PDFs', count: results?.pdfs?.length || 0, icon: 'fas fa-file-pdf' },
    { id: 'articles', label: 'Articles', count: results?.articles?.length || 0, icon: 'fas fa-newspaper' },
  ];

  const tabs = isMobile ? mobileTabs : desktopTabs;

  const handleSave = async (item) => {
    try {
      const response = await AuthService.saveSearchResult({
        type: item.type,
        data: item.data
      });
      
      if (response.success) {
        setSavedItems(prev => ({ ...prev, [item.data.id]: true }));
        await alert({
          title: 'Saved',
          message: 'Added to bookmarks',
          variant: 'success',
          duration: 1500
        });
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const getFilteredResults = () => {
    if (!results) return [];
    
    switch (activeTab) {
      case 'videos': return results.videos || [];
      case 'pdfs': return results.pdfs || [];
      case 'articles': return results.articles || [];
      default: return [
        ...(results.videos || []),
        ...(results.pdfs || []),
        ...(results.articles || [])
      ];
    }
  };

  const filteredResults = getFilteredResults();

  // Calculate how many items to show initially on mobile
  const getInitialItemsCount = () => {
    if (activeTab === 'all') {
      return isMobile ? 1 : 2;
    }
    return filteredResults.length;
  };

  return (
    <div className="w-full max-w-full mx-auto px-1 sm:px-2 md:px-4">
      {/* Results Header - EXTREMELY COMPACT ON MOBILE */}
      <div className="mb-3 md:mb-6">
        <div className="flex flex-col gap-1.5 md:gap-2 mb-2 md:mb-3">
          <h1 className="text-base md:text-xl lg:text-2xl font-bold text-white break-words max-w-full">
            <span className="text-gray-400 text-xs md:text-sm">Results for:</span><br />
            <span className="text-blue-400 break-all text-sm md:text-base lg:text-lg">{query}</span>
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs md:text-sm">
              {results?.total_results || 0} results
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Tabs - FIXED FOR 720px SCREEN */}
        <div className="w-full overflow-x-auto">
          <div className="flex gap-1 md:gap-2 pb-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                } ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
                {!isMobile && tab.count !== undefined && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid - PERFECTLY FITS MOBILE SCREEN */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-6 md:py-8 bg-gray-900/30 rounded-lg md:rounded-xl border border-gray-800">
          <i className="fas fa-search text-gray-600 text-2xl md:text-3xl mb-2 md:mb-3"></i>
          <h3 className="text-base md:text-lg lg:text-xl font-bold text-white mb-1 md:mb-2">No results found</h3>
          <p className="text-gray-400 text-xs md:text-sm">Try different keywords</p>
        </div>
      ) : (
        <>
          {/* Grid - ADJUSTED FOR 720px SPECIFICALLY */}
          <div className={`grid ${
            isMobile ? 'grid-cols-1 gap-2' : 
            window.innerWidth <= 1024 ? 'grid-cols-2 gap-3' : 'grid-cols-3 gap-4'
          } w-full`}>
            {activeTab === 'all' && isMobile ? (
              // Show limited items on mobile for "all" tab
              <>
                {results.videos?.slice(0, 1).map((video, index) => (
                  <div key={`video-${video.id || index}`} className="w-full">
                    <VideoCard
                      video={video}
                      onSave={() => handleSave({ type: 'video', data: video })}
                      saved={savedItems[video.id]}
                      isMobile={true}
                    />
                  </div>
                ))}
                {results.pdfs?.slice(0, 1).map((pdf, index) => (
                  <div key={`pdf-${pdf.id || index}`} className="w-full">
                    <PDFCard
                      pdf={pdf}
                      onSave={() => handleSave({ type: 'pdf', data: pdf })}
                      saved={savedItems[pdf.id]}
                      isMobile={true}
                    />
                  </div>
                ))}
                {results.articles?.slice(0, 1).map((article, index) => (
                  <div key={`article-${article.id || index}`} className="w-full">
                    <ArticleCard
                      article={article}
                      onSave={() => handleSave({ type: 'article', data: article })}
                      saved={savedItems[article.id]}
                      isMobile={true}
                    />
                  </div>
                ))}
              </>
            ) : (
              // Show all items for specific tabs or desktop
              filteredResults.map((item, index) => {
                if (activeTab === 'videos' || (activeTab === 'all' && item.source === 'youtube')) {
                  return (
                    <div key={`video-${item.id || index}`} className="w-full">
                      <VideoCard
                        video={item}
                        onSave={() => handleSave({ type: 'video', data: item })}
                        saved={savedItems[item.id]}
                        isMobile={isMobile}
                      />
                    </div>
                  );
                } else if (activeTab === 'pdfs' || (activeTab === 'all' && item.source === 'arxiv')) {
                  return (
                    <div key={`pdf-${item.id || index}`} className="w-full">
                      <PDFCard
                        pdf={item}
                        onSave={() => handleSave({ type: 'pdf', data: item })}
                        saved={savedItems[item.id]}
                        isMobile={isMobile}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={`article-${item.id || index}`} className="w-full">
                      <ArticleCard
                        article={item}
                        onSave={() => handleSave({ type: 'article', data: item })}
                        saved={savedItems[item.id]}
                        isMobile={isMobile}
                      />
                    </div>
                  );
                }
              })
            )}
          </div>
          
          {/* Show "Load More" button if there are more results on mobile */}
          {isMobile && activeTab === 'all' && 
           (results.videos?.length > 1 || results.pdfs?.length > 1 || results.articles?.length > 1) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setActiveTab('videos')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:opacity-90"
              >
                Show All Results
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}