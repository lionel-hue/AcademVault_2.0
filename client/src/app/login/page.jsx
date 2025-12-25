// client/src/app/login/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthService from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await AuthService.login(formData.email, formData.password);
            if (result.success) {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <i className="fas fa-graduation-cap"></i>
                            <h1>AcademVault</h1>
                        </div>
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue your research</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message show">
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">
                                <i className="fas fa-envelope"></i> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@university.edu"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <i className="fas fa-lock"></i> Password
                            </label>
                            <div className="password-input">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                />
                                Remember me
                            </label>
                            <Link href="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>or continue with</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="social-btn google">
                            <i className="fab fa-google"></i>
                            Google
                        </button>
                        <button type="button" className="social-btn microsoft">
                            <i className="fab fa-microsoft"></i>
                            Microsoft
                        </button>
                        <button type="button" className="social-btn github">
                            <i className="fab fa-github"></i>
                            GitHub
                        </button>
                    </div>

                    <div className="auth-footer">
                        <p>
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="auth-link">
                                Create Account
                            </Link>
                        </p>
                        <p className="terms">
                            By signing in, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
                        </p>
                    </div>
                </div>

                <div className="auth-features">
                    <div className="feature">
                        <i className="fas fa-rocket"></i>
                        <h3>Quick Access</h3>
                        <p>Get instant access to millions of research papers and resources</p>
                    </div>
                    <div className="feature">
                        <i className="fas fa-bell"></i>
                        <h3>Stay Updated</h3>
                        <p>Receive notifications about new research in your fields</p>
                    </div>
                    <div className="feature">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <h3>Cloud Storage</h3>
                        <p>Securely store and access your research from anywhere</p>
                    </div>
                </div>
            </div>
        </div>
    );
}