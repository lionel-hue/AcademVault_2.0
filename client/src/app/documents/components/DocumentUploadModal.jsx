"use client";
import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import AuthService from '@/lib/auth';

export default function DocumentUploadModal({ onClose, onSuccess, categories = [] }) {
  const { alert } = useModal();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'url'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'pdf',
    description: '',
    author: '',
    url: '',
    file: null,
    is_public: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files[0],
        title: prev.title || e.target.files[0].name.split('.')[0]
      }));
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        categories: selectedCategories
      };

      // Remove file if URL tab is active
      if (activeTab === 'url') {
        delete submissionData.file;
      } else {
        delete submissionData.url;
      }

      const response = await AuthService.createDocument(submissionData);
      if (response.success) {
        await alert({
          title: 'Success!',
          message: 'Document added to your library',
          variant: 'success'
        });
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      await alert({
        title: 'Upload Failed',
        message: error.message || 'Failed to upload document',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Add Document</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            className={`flex-1 py-4 font-medium text-center ${activeTab === 'upload' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('upload')}
          >
            <i className="fas fa-upload mr-2"></i>
            Upload File
          </button>
          <button
            className={`flex-1 py-4 font-medium text-center ${activeTab === 'url' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('url')}
          >
            <i className="fas fa-link mr-2"></i>
            From URL
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Enter document title"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Document Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="pdf">PDF Document</option>
              <option value="video">Video</option>
              <option value="article_link">Article / Webpage</option>
              <option value="website">Website</option>
              <option value="image">Image</option>
              <option value="presentation">Presentation</option>
            </select>
          </div>

          {/* Upload or URL Section */}
          {activeTab === 'upload' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File *
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  required={activeTab === 'upload'}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cloud-upload-alt text-2xl text-blue-400"></i>
                  </div>
                  <p className="text-gray-300 font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 text-sm">
                    Max file size: 10MB
                  </p>
                  {formData.file && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        <i className="fas fa-file mr-2"></i>
                        {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required={activeTab === 'url'}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/document.pdf"
              />
              <p className="text-gray-500 text-xs mt-2">
                Supports PDFs, videos, articles, and webpages
              </p>
            </div>
          )}

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Document author or creator"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Brief description of the document"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${selectedCategories.includes(category.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    <i className={category.icon}></i>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div>
              <p className="font-medium text-white">Make document public</p>
              <p className="text-gray-400 text-sm">Other users can see and access this document</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </>
              ) : (
                'Add to Library'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}