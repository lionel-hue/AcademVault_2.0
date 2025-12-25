// client/src/lib/auth.js
const AuthService = {
    isLoggedIn() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('academvault_isLoggedIn') === 'true';
        }
        return false;
    },

    getCurrentUser() {
        if (typeof window !== 'undefined') {
            return {
                name: localStorage.getItem('academvault_userName') || 'John Doe',
                email: localStorage.getItem('academvault_userEmail') || 'john.doe@mit.edu',
                role: localStorage.getItem('academvault_userRole') || 'student',
                avatar: localStorage.getItem('academvault_userAvatar') || 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff'
            };
        }
        return null;
    },

    login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    localStorage.setItem('academvault_isLoggedIn', 'true');
                    localStorage.setItem('academvault_userEmail', email);
                    localStorage.setItem('academvault_userName', email.split('@')[0]);
                    localStorage.setItem('academvault_userRole', 'student');
                    localStorage.setItem('academvault_userAvatar', `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=3b82f6&color=fff`);
                    
                    resolve({
                        success: true,
                        message: 'Login successful!',
                        user: this.getCurrentUser()
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

    signup(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('academvault_isLoggedIn', 'true');
                localStorage.setItem('academvault_userEmail', userData.email);
                localStorage.setItem('academvault_userName', userData.fullName);
                localStorage.setItem('academvault_userRole', userData.userType);
                localStorage.setItem('academvault_userAvatar', `https://ui-avatars.com/api/?name=${userData.fullName}&background=3b82f6&color=fff`);
                
                resolve({
                    success: true,
                    message: 'Account created successfully!',
                    user: this.getCurrentUser()
                });
            }, 1500);
        });
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('academvault_isLoggedIn');
            localStorage.removeItem('academvault_userEmail');
            localStorage.removeItem('academvault_userName');
            localStorage.removeItem('academvault_userRole');
            localStorage.removeItem('academvault_userAvatar');
        }
    }
};

export default AuthService;