// client/src/lib/auth.js - UPDATED FOR BACKEND INTEGRATION
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const AuthService = {
    // Check if user is logged in (for client-side)
    isLoggedIn() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('academvault_token');
            const expiry = localStorage.getItem('academvault_token_expiry');
            
            if (!token || !expiry) return false;
            
            // Check if token is expired
            if (new Date() > new Date(expiry)) {
                this.logout();
                return false;
            }
            
            return true;
        }
        return false;
    },

    // Get current user from localStorage
    getCurrentUser() {
        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('academvault_user');
                return userStr ? JSON.parse(userStr) : null;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    },

    // Mock login (to be replaced with real API call)
    async login(email, password) {
        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_URL}/auth/login`, {
            //     method: 'POST',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'Accept': 'application/json'
            //     },
            //     body: JSON.stringify({ email, password })
            // });
            
            // const data = await response.json();
            
            // if (!response.ok) {
            //     throw new Error(data.message || 'Login failed');
            // }
            
            // Mock response for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockUser = {
                id: 1,
                name: email.split('@')[0],
                email: email,
                type: 'student',
                role: 'user',
                institution: 'Demo University',
                profile_image: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=3b82f6&color=fff`
            };
            
            // Store in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('academvault_token', 'mock_jwt_token');
                localStorage.setItem('academvault_token_expiry', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
                localStorage.setItem('academvault_user', JSON.stringify(mockUser));
            }
            
            return {
                success: true,
                message: 'Login successful!',
                user: mockUser
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Invalid credentials'
            };
        }
    },

    // Register user (to be replaced with real API call)
    async register(userData) {
        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_URL}/auth/register`, {
            //     method: 'POST',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'Accept': 'application/json'
            //     },
            //     body: JSON.stringify(userData)
            // });
            
            // const data = await response.json();
            
            // if (!response.ok) {
            //     throw new Error(data.message || 'Registration failed');
            // }
            
            // Mock response for now
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            return {
                success: true,
                message: 'Registration successful! Please check your email to verify your account.',
                data: {
                    id: 2,
                    ...userData,
                    email_verified_at: null,
                    created_at: new Date().toISOString()
                }
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Registration failed. Please try again.'
            };
        }
    },

    // Send verification code (to be replaced with real API call)
    async sendVerificationCode(email) {
        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_URL}/auth/send-verification`, {
            //     method: 'POST',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'Accept': 'application/json'
            //     },
            //     body: JSON.stringify({ email })
            // });
            
            // const data = await response.json();
            
            // if (!response.ok) {
            //     throw new Error(data.message || 'Failed to send verification code');
            // }
            
            // Mock response for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                message: 'Verification code sent successfully!'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to send verification code'
            };
        }
    },

    // Verify email (to be replaced with real API call)
    async verifyEmail(email, code) {
        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_URL}/auth/verify-email`, {
            //     method: 'POST',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'Accept': 'application/json'
            //     },
            //     body: JSON.stringify({ email, code })
            // });
            
            // const data = await response.json();
            
            // if (!response.ok) {
            //     throw new Error(data.message || 'Invalid verification code');
            // }
            
            // Mock response for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                message: 'Email verified successfully!'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Invalid verification code'
            };
        }
    },

    // Logout
    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('academvault_token');
            localStorage.removeItem('academvault_token_expiry');
            localStorage.removeItem('academvault_user');
        }
    },

    // Get authorization header for API calls
    getAuthHeader() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('academvault_token');
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        }
        return {};
    }
};

export default AuthService;