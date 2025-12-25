// client/src/app/dashboard/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth';
import MainLayout from '@/app/components/Layout/MainLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!AuthService.isLoggedIn()) {
      router.push('/login');
    } else {
      setUser(AuthService.getCurrentUser());
    }
  }, [router]);

  if (!user) {
    return (
      <div className="loading-content">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="dashboard-content">
        <div className="welcome-banner">
          <h1>Welcome back, {user.name}!</h1>
          <p>Your research dashboard</p>
        </div>
        
        <div className="quick-stats-grid">
          <div className="stat-card">
            <i className="fas fa-file-alt"></i>
            <div>
              <h3>42</h3>
              <p>Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-folder"></i>
            <div>
              <h3>8</h3>
              <p>Categories</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <div>
              <h3>23</h3>
              <p>Friends</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-comments"></i>
            <div>
              <h3>5</h3>
              <p>Discussions</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}