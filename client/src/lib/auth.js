// client/src/lib/auth.js - FINAL WORKING VERSION
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class AuthService {
    constructor() {
        this.token = null;
        this.user = null;
        this.initialize();
    }

    initialize() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('academvault_token');
            const userStr = localStorage.getItem('academvault_user');
            this.user = userStr ? JSON.parse(userStr) : null;
        }
    }

    // Get auth headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Store auth data - FIXED: Properly sets expiry
    setAuthData(token, user, expires_in = 3600) {
        this.token = token;
        this.user = user;

        if (typeof window !== 'undefined') {
            console.log('🟢 Setting auth data:', {
                token: token.substring(0, 20) + '...',
                email: user?.email,
                expires_in
            });

            // Store in localStorage
            localStorage.setItem('academvault_token', token);
            localStorage.setItem('academvault_user', JSON.stringify(user));

            // Use the expires_in from server (in seconds)
            const expiry = new Date();
            expiry.setSeconds(expiry.getSeconds() + expires_in);
            localStorage.setItem('academvault_token_expiry', expiry.toISOString());

            console.log('✅ Token stored with expiry:', expiry.toISOString());

            // Set cookie
            document.cookie = `academvault_token=${token}; path=/; max-age=${expires_in}; SameSite=Strict`;
        }
    }

    // Clear auth data
    clearAuthData() {
        this.token = null;
        this.user = null;

        if (typeof window !== 'undefined') {
            console.log('🔴 Clearing auth data');
            localStorage.removeItem('academvault_token');
            localStorage.removeItem('academvault_user');
            localStorage.removeItem('academvault_token_expiry');

            document.cookie = 'academvault_token=; path=/; max-age=0';
        }
    }

    // Check if logged in - SIMPLIFIED: Just check token exists
    isLoggedIn() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('academvault_token');
            console.log('🔑 isLoggedIn check - Token exists:', !!token);
            return !!token; // Just check if token exists
        }
        return false;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get token safely
    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('academvault_token');
        }
        return this.token;
    }

    // ============= DASHBOARD API METHODS =============
    async fetchDashboardStats() {
        return this.makeRequest('/dashboard/stats');
    }

    async fetchRecentActivities() {
        return this.makeRequest('/dashboard/activities');
    }

    async fetchRecentDocuments() {
        return this.makeRequest('/dashboard/recent-documents');
    }

    async fetchFavoriteDocuments() {
        return this.makeRequest('/dashboard/favorites');
    }

    async fetchNotifications() {
        return this.makeRequest('/dashboard/notifications');
    }

    async fetchSearchHistory() {
        return this.makeRequest('/dashboard/search-history');
    }

    // Generic request method - SIMPLIFIED
    async makeRequest(endpoint, options = {}) {
        const token = this.getToken();

        if (!token) {
            console.error('❌ No token for request:', endpoint);
            this.clearAuthData();
            window.location.href = '/login';
            throw new Error('No authentication token');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        console.log('🌐 Making request to:', endpoint);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            console.log('📡 Response status:', response.status, 'for:', endpoint);

            if (response.status === 401) {
                console.log('🔐 401 Unauthorized - Token expired');
                this.clearAuthData();
                window.location.href = '/login';
                throw new Error('Session expired');
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ Error response:', errorText);
                throw new Error(`API error: ${response.status}`);
            }

            return response.json();

        } catch (error) {
            console.error(`💥 API Error (${endpoint}):`, error.message);

            if (error.message.includes('Session expired') || error.message.includes('No authentication')) {
                this.clearAuthData();
                window.location.href = '/login';
            }

            throw error;
        }
    }

    // ============= AUTH METHODS =============
    async sendVerificationCode(email) {
        try {
            const response = await fetch(`${API_URL}/auth/send-verification`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send verification code');
            }

            return {
                success: true,
                message: data.message,
                data: data.data
            };

        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to send verification code'
            };
        }
    }

    async verifyEmail(email, code) {
        try {
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid verification code');
            }

            return {
                success: true,
                message: data.message
            };

        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Invalid verification code'
            };
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (data.data && data.data.token) {
                this.setAuthData(data.data.token, data.data.user, data.data.expires_in);
            }

            return {
                success: true,
                message: data.message,
                data: data.data
            };

        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Registration failed'
            };
        }
    }

    async login(email, password) {
        try {
            console.log('🔑 Attempting login for:', email);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('📨 Login response:', data);

            if (!response.ok) {
                if (data.message?.includes('verify your email')) {
                    throw new Error('Please verify your email before logging in');
                }
                if (response.status === 401) {
                    throw new Error('Invalid email or password');
                }
                if (response.status === 422) {
                    const errors = Object.values(data.errors || {}).flat();
                    throw new Error(errors[0] || 'Validation error');
                }
                throw new Error(data.message || 'Login failed');
            }

            if (data.data && data.data.token) {
                this.setAuthData(data.data.token, data.data.user, data.data.expires_in);
                console.log('✅ Login successful!');
            } else {
                console.error('❌ No token in login response');
                throw new Error('Login failed - no token received');
            }

            return {
                success: true,
                message: data.message,
                data: data.data
            };

        } catch (error) {
            console.error('💥 Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: this.getHeaders()
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
        }
    }

    async getMe() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user data');
            }

            if (data.data) {
                this.user = data.data;
                localStorage.setItem('academvault_user', JSON.stringify(data.data));
            }

            return {
                success: true,
                data: data.data
            };

        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to fetch user data'
            };
        }
    }

    async refreshToken() {
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to refresh token');
            }

            if (data.data && data.data.token) {
                this.token = data.data.token;
                localStorage.setItem('academvault_token', data.data.token);
                localStorage.setItem('academvault_token_expiry',
                    new Date(Date.now() + 3600 * 1000).toISOString());
                return true;
            }

            return false;

        } catch (error) {
            this.clearAuthData();
            return false;
        }
    }

    async checkEmail(email) {
        try {
            const response = await fetch(`${API_URL}/auth/check-email`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to check email');
            }

            return {
                success: true,
                data: data.data
            };

        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to check email'
            };
        }
    }

    // client/src/lib/auth.js - ADD THESE METHODS AT THE END OF THE CLASS

    // ============= SEARCH METHODS =============
    async search(params) {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_URL}/search`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearAuthData();
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Search failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    async getSearchHistory() {
        try {
            const response = await this.makeRequest('/search/history');
            return response;
        } catch (error) {
            console.error('Error fetching search history:', error);
            throw error;
        }
    }

    async clearSearchHistory() {
        try {
            const token = this.getToken();

            const response = await fetch(`${API_URL}/search/history`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to clear search history');
            }

            return await response.json();

        } catch (error) {
            console.error('Error clearing search history:', error);
            throw error;
        }
    }

    // Add these methods to your AuthService class:

    async getSearchSessions() {
        try {
            const token = this.getToken();
            if (!token) throw new Error('No authentication token');

            const response = await fetch(`${API_URL}/search-sessions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearAuthData();
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
                throw new Error('Failed to fetch search sessions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting search sessions:', error);
            throw error;
        }
    }

    async createSearchSession(sessionData) {
        try {
            const token = this.getToken();
            if (!token) throw new Error('No authentication token');

            // Ensure data is properly structured
            const payload = {
                query: sessionData.query || '',
                results: sessionData.results || { videos: [], pdfs: [], articles: [] },
                filters: sessionData.filters || {},
                total_results: sessionData.total_results || 0,
                title: sessionData.title || `Search: ${sessionData.query?.substring(0, 30) || 'Untitled'}`
            };

            console.log('Saving search session payload:', payload);

            const response = await fetch(`${API_URL}/search-sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to save search session: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating search session:', error);
            throw error;
        }
    }

    async updateSearchSession(id, updates) {
        try {
            const token = this.getToken();
            if (!token) throw new Error('No authentication token');

            const response = await fetch(`${API_URL}/search-sessions/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update search session');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating search session:', error);
            throw error;
        }
    }

    async deleteSearchSession(id) {
        try {
            const token = this.getToken();
            if (!token) throw new Error('No authentication token');

            const response = await fetch(`${API_URL}/search-sessions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete search session');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting search session:', error);
            throw error;
        }
    }

    async saveSearchResult(data) {
        try {
            const token = this.getToken();

            const response = await fetch(`${API_URL}/search/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to save search result');
            }

            return await response.json();

        } catch (error) {
            console.error('Error saving search result:', error);
            throw error;
        }
    }



    // Add this method for checking connectivity
    async checkConnectivity() {
        try {
            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ Backend connection successful');
                return true;
            } else {
                console.error('❌ Backend connection failed');
                return false;
            }
        } catch (error) {
            console.error('💥 Connectivity check error:', error);
            return false;
        }
    }

    // Enhanced search with pagination
    async search(params) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_URL}/search`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearAuthData();
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Search failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    // Advanced search with filters
    async advancedSearch(params) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/search/advanced`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error('Advanced search failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Advanced search error:', error);
            throw error;
        }
    }

    // Save search result to bookmarks
    async saveSearchResult(data) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/search/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to save search result');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving search result:', error);
            throw error;
        }
    }

    // Add to AuthService class:

    async getVideoDownloadOptions(videoId, quality = 'medium') {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_URL}/download/video/info`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ video_id: videoId, quality })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch download options');
            }

            return await response.json();
        } catch (error) {
            console.error('Video download options error:', error);
            throw error;
        }
    }

    async getEducationalAlternatives() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/download/video/alternatives`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch educational alternatives');
            }

            return await response.json();
        } catch (error) {
            console.error('Educational alternatives error:', error);
            throw error;
        }
    }

    // client/src/lib/auth.js - ADD THESE METHODS

    // Get all search sessions for current user
    async getSearchSessions() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/search-sessions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching search sessions:', error);
            throw error;
        }
    }

    // Create a new search session
    async createSearchSession(sessionData) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/search-sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating search session:', error);
            throw error;
        }
    }

    // Update a search session
    async updateSearchSession(id, updates) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/search-sessions/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating search session:', error);
            throw error;
        }
    }

    // Delete a search session
    async deleteSearchSession(id) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/search-sessions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting search session:', error);
            throw error;
        }
    }


    // Ajoute ces méthodes à la fin de la classe AuthService :

    // ============= DOCUMENTS API METHODS =============
    async fetchUserDocuments(params = {}) {
        return this.makeRequest('/documents', {
            method: 'GET',
            params
        });
    }

    async fetchDocumentStats() {
        return this.makeRequest('/documents/stats');
    }

    async createDocument(documentData) {
        // Handle file upload with FormData
        if (documentData.file) {
            const formData = new FormData();
            Object.keys(documentData).forEach(key => {
                if (key === 'file') {
                    formData.append('file', documentData.file);
                } else if (key === 'categories' && Array.isArray(documentData[key])) {
                    documentData[key].forEach(categoryId => {
                        formData.append('categories[]', categoryId);
                    });
                } else {
                    formData.append(key, documentData[key]);
                }
            });

            const headers = this.getHeaders();
            delete headers['Content-Type']; // Let browser set it for FormData

            return this.makeRequest('/documents', {
                method: 'POST',
                headers,
                body: formData
            });
        }

        // Regular JSON request
        return this.makeRequest('/documents', {
            method: 'POST',
            body: JSON.stringify(documentData)
        });
    }

    async saveSearchResultToDocuments(data) {
        return this.makeRequest('/documents/save-from-search', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getDocument(id) {
        return this.makeRequest(`/documents/${id}`);
    }

    async updateDocument(id, updates) {
        return this.makeRequest(`/documents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteDocument(id) {
        return this.makeRequest(`/documents/${id}`, {
            method: 'DELETE'
        });
    }

    async downloadDocument(id) {
        return this.makeRequest(`/documents/${id}/download`);
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;