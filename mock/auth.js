// Authentication Service
const AuthService = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // Get current user from localStorage
    getCurrentUser() {
        return {
            name: localStorage.getItem('userName') || 'John Doe',
            email: localStorage.getItem('userEmail') || 'john.doe@mit.edu',
            role: localStorage.getItem('userRole') || 'student',
            avatar: localStorage.getItem('userAvatar') || 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff'
        };
    },

    // Login
    login(email, password) {
        // In a real app, this would make an API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', email.split('@')[0]);
                    localStorage.setItem('userRole', 'student');
                    localStorage.setItem('userAvatar', `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=3b82f6&color=fff`);
                    
                    resolve({
                        success: true,
                        message: 'Login successful!'
                    });
                } else {
                    reject({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }
            }, 1000);
        });
    },

    // Signup
    signup(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', userData.email);
                localStorage.setItem('userName', userData.fullName);
                localStorage.setItem('userRole', userData.userType);
                localStorage.setItem('userAvatar', `https://ui-avatars.com/api/?name=${userData.fullName}&background=3b82f6&color=fff`);
                
                resolve({
                    success: true,
                    message: 'Account created successfully!'
                });
            }, 1500);
        });
    },

    // Logout
    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userAvatar');
        
        window.location.href = 'login.html';
    },

    // Forgot password
    forgotPassword(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: `Password reset instructions sent to ${email}`
                });
            }, 1000);
        });
    },

    // Check authentication on page load
    checkAuth() {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('login.html') || 
                          currentPath.includes('signup.html') || 
                          currentPath.includes('forgot-password.html');

        if (!this.isLoggedIn() && !isAuthPage) {
            window.location.href = 'login.html';
            return false;
        }

        if (this.isLoggedIn() && isAuthPage) {
            window.location.href = 'index.html';
            return false;
        }

        return true;
    },

    // Update user profile
    updateProfile(profileData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (profileData.name) {
                    localStorage.setItem('userName', profileData.name);
                }
                if (profileData.avatar) {
                    localStorage.setItem('userAvatar', profileData.avatar);
                }
                
                resolve({
                    success: true,
                    message: 'Profile updated successfully!'
                });
            }, 1000);
        });
    }
};

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    AuthService.checkAuth();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}