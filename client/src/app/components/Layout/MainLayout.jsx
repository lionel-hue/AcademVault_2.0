// client/src/app/components/Layout/MainLayout.jsx
"use client";

import { useState, useEffect } from 'react';
import AuthService from '@/lib/auth';
import { mockDatabase } from '@/data/mockData';

export default function MainLayout({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const loggedIn = AuthService.isLoggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            setUser(AuthService.getCurrentUser());
        }
    }, []);

    const handleLogout = () => {
        AuthService.logout();
        setIsLoggedIn(false);
        setUser(null);
        window.location.href = '/login';
    };

    if (!isLoggedIn) {
        return children;
    }

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-container">
                    <div className="logo-section">
                        <div className="app-logo">
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        <h1 className="app-name">AcademVault</h1>
                    </div>

                    <div className="search-section desktop-only">
                        <div className="search-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search research topics, papers, videos..." 
                            />
                            <button className="search-btn">
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <div className="user-section">
                        <div className="user-profile">
                            <div className="user-avatar">
                                <img 
                                    src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff'} 
                                    alt="Profile" 
                                />
                                <span className="online-status"></span>
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role">{user?.role}</span>
                            </div>
                            <i className="fas fa-chevron-down dropdown-arrow"></i>
                        </div>
                    </div>

                    <button 
                        className="mobile-menu-toggle" 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </header>

            <div className="app-main">
                {/* Sidebar */}
                <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <div className="sidebar-logo">
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        <h2>AcademVault</h2>
                        <button 
                            className="sidebar-close"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        <a href="/dashboard" className="nav-item active">
                            <i className="fas fa-home"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="/categories" className="nav-item">
                            <i className="fas fa-folder"></i>
                            <span>Categories</span>
                            <span className="nav-badge">12</span>
                        </a>
                        <a href="/documents" className="nav-item">
                            <i className="fas fa-file-alt"></i>
                            <span>Documents</span>
                            <span className="nav-badge">45</span>
                        </a>
                        <a href="/friends" className="nav-item">
                            <i className="fas fa-users"></i>
                            <span>Friends</span>
                            <span className="nav-badge">23</span>
                        </a>
                        <a href="/discussions" className="nav-item">
                            <i className="fas fa-comments"></i>
                            <span>Discussions</span>
                            <span className="nav-badge">8</span>
                        </a>
                        <a href="/profile" className="nav-item">
                            <i className="fas fa-user-circle"></i>
                            <span>Profile</span>
                        </a>
                        <button 
                            className="nav-item logout-btn"
                            onClick={handleLogout}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}