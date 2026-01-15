"use client";
import { useState } from 'react';

export default function SearchSessionCard({ session, onOpen, onDelete, onRename }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title || session.query);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const handleSaveTitle = async () => {
    await onRename(session.id, title);
    setIsEditing(false);
  };
  
  // Determine session type based on results
  const getSessionType = () => {
    if (!session.results) return 'mixed';
    if (session.results.videos?.length > 0) return 'video';
    if (session.results.pdfs?.length > 0) return 'pdf';
    if (session.results.articles?.length > 0) return 'article';
    return 'mixed';
  };
  
  const typeIcons = {
    video: 'fas fa-video',
    pdf: 'fas fa-file-pdf',
    article: 'fas fa-newspaper',
    mixed: 'fas fa-layer-group'
  };
  
  const typeColors = {
    video: 'from-red-500 to-pink-500',
    pdf: 'from-green-500 to-emerald-500',
    article: 'from-blue-500 to-cyan-500',
    mixed: 'from-purple-500 to-indigo-500'
  };
  
  const sessionType = getSessionType();
  
  return (
    <div 
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeColors[sessionType]} flex items-center justify-center flex-shrink-0`}>
            <i className={`${typeIcons[sessionType]} text-white`}></i>
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="bg-gray-800 border border-blue-500 rounded px-2 py-1 text-white w-full text-sm"
                autoFocus
              />
            ) : (
              <h3 
                className="font-semibold text-white truncate cursor-pointer hover:text-blue-300"
                onClick={() => onOpen(session)}
              >
                {title}
              </h3>
            )}
            <p className="text-sm text-gray-400 truncate">{session.query}</p>
          </div>
        </div>
        
        {/* Actions */}
        {isHovered && (
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg"
              title="Rename"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
            <button
              onClick={() => onDelete(session.id)}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
              title="Delete"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <i className="fas fa-calendar text-xs"></i>
            {formatDate(session.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-search text-xs"></i>
            {session.total_results || 0} results
          </span>
        </div>
        
        {/* Results Preview */}
        {session.results && (
          <div className="flex flex-wrap gap-1 mt-3">
            {session.results.videos?.slice(0, 1).map((video, idx) => (
              <span key={`video-${idx}`} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
                Video
              </span>
            ))}
            {session.results.pdfs?.slice(0, 1).map((pdf, idx) => (
              <span key={`pdf-${idx}`} className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                PDF
              </span>
            ))}
            {session.results.articles?.slice(0, 1).map((article, idx) => (
              <span key={`article-${idx}`} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">
                Article
              </span>
            ))}
            {session.total_results > 3 && (
              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                +{session.total_results - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Open Button */}
        <button
          onClick={() => onOpen(session)}
          className="w-full mt-4 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
        >
          <i className="fas fa-external-link-alt mr-2"></i>
          Open Session
        </button>
      </div>
    </div>
  );
}