// client/src/lib/auth.js - UPDATED FOR REAL BACKEND
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

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Store auth data
    setAuthData(token, user) {
        this.token = token;
        this.user = user;

        if (typeof window !== 'undefined') {
            // Store in localStorage for client-side access
            localStorage.setItem('academvault_token', token);
            localStorage.setItem('academvault_user', JSON.stringify(user));

            // Also set cookie for server-side middleware access
            document.cookie = `academvault_token=${token}; path=/; max-age=3600; SameSite=Strict`;
        }
    }

    // Clear auth data
    clearAuthData() {
        this.token = null;
        this.user = null;

        if (typeof window !== 'undefined') {
            localStorage.removeItem('academvault_token');
            localStorage.removeItem('academvault_user');

            // Clear cookie
            document.cookie = 'academvault_token=; path=/; max-age=0';
        }
    }

    // Check if logged in
    isLoggedIn() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('academvault_token');
            const expiry = localStorage.getItem('academvault_token_expiry');

            if (!token || !expiry) return false;

            // Check if token is expired
            if (new Date() > new Date(expiry)) {
                this.clearAuthData();
                return false;
            }

            return true;
        }
        return false;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Send verification code
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

    // Verify email with code
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

    // Register user
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

            // Store token and user data
            if (data.data && data.data.token) {
                this.setAuthData(data.data.token, data.data.user);
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

    // Login
    // client/src/lib/auth.js - Update login method
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error cases
                if (data.message?.includes('verify your email')) {
                    throw new Error('Please verify your email before logging in. Check your inbox.');
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

            // Store token and user data
            if (data.data && data.data.token) {
                this.setAuthData(data.data.token, data.data.user);
            }

            return {
                success: true,
                message: data.message,
                data: data.data
            };

        } catch (error) {
            console.error('Login error:', error);
            throw error; // Re-throw to be caught by the login page
        }
    }

    // Logout
    async logout() {
        try {
            if (this.token) {
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

    // Get current user from API
    async getMe() {
        try {
            if (!this.token) {
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

            // Update user data
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

    // Refresh token
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

    // Check if email exists
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
}

// Export singleton instance
const authService = new AuthService();
export default authService;