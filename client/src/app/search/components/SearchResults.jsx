// Replace the entire component with this mobile-optimized version
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

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-optimized tabs
  const mobileTabs = [
    { id: 'all', label: 'All', icon: 'fas fa-layer-group' },
    { id: 'videos', label: 'Vids', icon: 'fas fa-video' },
    { id: 'pdfs', label: 'PDFs', icon: 'fas fa-file-pdf' },
    { id: 'articles', label: 'Web', icon: 'fas fa-newspaper' },
  ];

  const desktopTabs = [
    { id: 'all', label: 'All Results', count: results.total_results, icon: 'fas fa-layer-group' },
    { id: 'videos', label: 'Videos', count: results.videos.length, icon: 'fas fa-video' },
    { id: 'pdfs', label: 'PDFs', count: results.pdfs.length, icon: 'fas fa-file-pdf' },
    { id: 'articles', label: 'Articles', count: results.articles.length, icon: 'fas fa-newspaper' },
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
    switch (activeTab) {
      case 'videos': return results.videos;
      case 'pdfs': return results.pdfs;
      case 'articles': return results.articles;
      default: return [...results.videos, ...results.pdfs, ...results.articles];
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Results Header - ULTRA MOBILE OPTIMIZED */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col gap-2 mb-3">
          <h1 className="text-lg md:text-2xl font-bold text-white break-words max-w-full">
            <span className="text-gray-400 text-sm md:text-base">Results for:</span><br />
            <span className="text-blue-400 break-words">{query}</span>
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs">
              {results.total_results} results
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Tabs - EXTREMELY COMPACT ON MOBILE */}
        <div className="w-full overflow-x-auto">
          <div className="flex gap-1 pb-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  } ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
                {!isMobile && tab.count !== undefined && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid - SINGLE COLUMN ON MOBILE */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-8 bg-gray-900/30 rounded-xl border border-gray-800">
          <i className="fas fa-search text-gray-600 text-3xl mb-3"></i>
          <h3 className="text-lg font-bold text-white mb-2">No results found</h3>
          <p className="text-gray-400 text-sm">Try different keywords</p>
        </div>
      ) : (
        <>
          {/* Grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full">
            {activeTab === 'all' ? (
              // Show limited items on mobile for "all" tab
              <>
                {results.videos.slice(0, isMobile ? 1 : 2).map((video, index) => (
                  <div key={`video-${video.id || index}`}>
                    <VideoCard
                      video={video}
                      onSave={() => handleSave({ type: 'video', data: video })}
                      saved={savedItems[video.id]}
                      isMobile={isMobile}
                    />
                  </div>
                ))}
                {results.pdfs.slice(0, isMobile ? 1 : 2).map((pdf, index) => (
                  <div key={`pdf-${pdf.id || index}`}>
                    <PDFCard
                      pdf={pdf}
                      onSave={() => handleSave({ type: 'pdf', data: pdf })}
                      saved={savedItems[pdf.id]}
                      isMobile={isMobile}
                    />
                  </div>
                ))}
                {results.articles.slice(0, isMobile ? 1 : 2).map((article, index) => (
                  <div key={`article-${article.id || index}`}>
                    <ArticleCard
                      article={article}
                      onSave={() => handleSave({ type: 'article', data: article })}
                      saved={savedItems[article.id]}
                      isMobile={isMobile}
                    />
                  </div>
                ))}
              </>
            ) : (
              // Show all items for specific tabs
              filteredResults.map((item, index) => {
                if (activeTab === 'videos') {
                  return (
                    <div key={`video-${item.id || index}`}>
                      <VideoCard
                        video={item}
                        onSave={() => handleSave({ type: 'video', data: item })}
                        saved={savedItems[item.id]}
                        isMobile={isMobile}
                      />
                    </div>
                  );
                } else if (activeTab === 'pdfs') {
                  return (
                    <div key={`pdf-${item.id || index}`}>
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
                    <div key={`article-${item.id || index}`}>
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
        </>
      )}
    </div>
  );
}