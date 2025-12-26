// client/src/app/dashboard/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import MainLayout from '@/app/components/Layout/MainLayout';

export default function DashboardPage() {
    const router = useRouter();
    const { alert } = useModal();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        documents: 0,
        projects: 0,
        collaborators: 0,
        storage: '0 MB'
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!AuthService.isLoggedIn()) {
                    await alert({
                        title: 'Session Expired',
                        message: 'Please login to continue',
                        variant: 'warning'
                    });
                    router.push('/login');
                    return;
                }

                const currentUser = AuthService.getCurrentUser();
                setUser(currentUser);

                // Optional: Fetch fresh user data
                // const result = await AuthService.getMe();
                // if (result.success) {
                //     setUser(result.data);
                // }

                // Simulate loading stats (replace with real API call)
                setTimeout(() => {
                    setStats({
                        documents: 12,
                        projects: 5,
                        collaborators: 8,
                        storage: '245 MB'
                    });
                    setLoading(false);
                }, 1000);

            } catch (error) {
                console.error('Dashboard error:', error);
                await alert({
                    title: 'Error',
                    message: 'Failed to load dashboard',
                    variant: 'danger'
                });
                router.push('/login');
            }
        };

        checkAuth();
    }, [router, alert]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading dashboard...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Welcome Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {user?.name || 'Researcher'}! 👋
                        </h1>
                        <p className="text-gray-400">
                            {user?.type === 'teacher' ? 'Professor' : 'Student'} • {user?.institution || 'AcademVault'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm text-gray-400">Account Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400 font-medium">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Total Documents', value: stats.documents, icon: 'fas fa-file-alt', color: 'from-blue-500 to-cyan-500' },
                    { title: 'Active Projects', value: stats.projects, icon: 'fas fa-folder-open', color: 'from-purple-500 to-pink-500' },
                    { title: 'Collaborators', value: stats.collaborators, icon: 'fas fa-users', color: 'from-green-500 to-emerald-500' },
                    { title: 'Storage Used', value: stats.storage, icon: 'fas fa-database', color: 'from-orange-500 to-red-500' },
                ].map((stat, index) => (
                    <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <i className={`${stat.icon} text-white text-lg`}></i>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-gray-400">{stat.title}</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            <i className="fas fa-arrow-up text-green-400 mr-1"></i>
                            <span>Updated just now</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { icon: 'fas fa-file-upload', action: 'Uploaded document', title: 'Research Paper.pdf', time: '2 hours ago', color: 'text-blue-400' },
                            { icon: 'fas fa-users', action: 'Joined project', title: 'Quantum Computing Research', time: 'Yesterday', color: 'text-green-400' },
                            { icon: 'fas fa-comment', action: 'New comment on', title: 'AI Ethics Discussion', time: '2 days ago', color: 'text-purple-400' },
                            { icon: 'fas fa-share', action: 'Shared collection with', title: 'Dr. Smith', time: '1 week ago', color: 'text-yellow-400' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-800/30 rounded-xl transition-colors">
                                <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center`}>
                                    <i className={`${activity.icon} ${activity.color}`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white">
                                        <span className="font-medium">{activity.action}</span>{' '}
                                        <span className="text-blue-400">{activity.title}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all hover:scale-[1.02]">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <i className="fas fa-upload text-blue-400"></i>
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white">Upload Document</p>
                                <p className="text-sm text-gray-400">Add research materials</p>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all hover:scale-[1.02]">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <i className="fas fa-plus text-purple-400"></i>
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white">New Project</p>
                                <p className="text-sm text-gray-400">Start a research project</p>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all hover:scale-[1.02]">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <i className="fas fa-search text-green-400"></i>
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white">Search Database</p>
                                <p className="text-sm text-gray-400">Find research papers</p>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all hover:scale-[1.02]">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                <i className="fas fa-cog text-gray-400"></i>
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white">Settings</p>
                                <p className="text-sm text-gray-400">Account preferences</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Getting Started Section */}
            <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Getting Started</h3>
                        <p className="text-gray-400">Complete your profile and explore AcademVault features</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">25% complete</span>
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: '25%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}