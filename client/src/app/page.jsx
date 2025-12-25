// client/src/app/page.jsx - UPDATED WITHOUT FRAMER-MOTION
"use client";

import { useState } from 'react';
import { useModal } from '@/app/components/UI/Modal/ModalContext';

export default function HomePage() {
  const { alert } = useModal();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: 'fas fa-search',
      title: 'Intelligent Search',
      description: 'Discover research papers, videos, and articles with our advanced AI-powered search engine',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'fas fa-users',
      title: 'Collaborate',
      description: 'Connect with researchers worldwide and collaborate on groundbreaking projects',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'fas fa-folder-plus',
      title: 'Organize',
      description: 'Create collections, tag resources, and manage your research efficiently',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Analyze',
      description: 'Get insights and analytics on your research patterns and progress',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleGetStarted = async () => {
    const confirmed = await alert({
      title: 'Welcome to AcademVault!',
      message: 'Join thousands of researchers and students in our collaborative platform. Create an account to get started.',
      confirmText: 'Get Started',
      variant: 'success'
    });
    if (confirmed) {
      window.location.href = '/signup';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Illustration (Now on left) */}
          <div className="order-2 lg:order-1 animate-fade-in">
            <div className="relative">
              {/* Main Illustration */}
              <div className="relative z-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="relative h-96">
                  {/* Animated Elements */}
                  <div className="absolute top-8 left-8 w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl animate-pulse"></div>
                    <i className="fas fa-book absolute inset-0 flex items-center justify-center text-white text-3xl"></i>
                  </div>
                  
                  <div className="absolute top-32 right-12 w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl rotate-12 animate-float"></div>
                    <i className="fas fa-graduation-cap absolute inset-0 flex items-center justify-center text-white text-2xl"></i>
                  </div>
                  
                  <div className="absolute bottom-16 left-16 w-28 h-28">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl -rotate-12 animate-float" style={{ animationDelay: '0.5s' }}></div>
                    <i className="fas fa-flask absolute inset-0 flex items-center justify-center text-white text-3xl"></i>
                  </div>
                  
                  {/* Connecting Lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path d="M80,80 Q200,100 280,160" stroke="url(#line-gradient)" strokeWidth="2" fill="none" opacity="0.5" />
                    <path d="M300,120 Q240,200 120,240" stroke="url(#line-gradient)" strokeWidth="2" fill="none" opacity="0.5" />
                    <defs>
                      <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">10K+</div>
                    <div className="text-sm text-gray-400">Researchers</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">50K+</div>
                    <div className="text-sm text-gray-400">Papers</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">100+</div>
                    <div className="text-sm text-gray-400">Institutions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content (Now on right) */}
          <div className="order-1 lg:order-2 animate-fade-in">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 w-14 h-14 rounded-xl flex items-center justify-center shadow-xl">
                  <i className="fas fa-graduation-cap text-white text-2xl"></i>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AcademVault
                </h1>
                <p className="text-gray-400 text-sm">Intelligent Research Platform</p>
              </div>
            </div>

            {/* Hero Text */}
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Accelerate Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Journey
              </span>
            </h2>
            
            <p className="text-gray-300 text-lg mb-10 max-w-lg leading-relaxed">
              Join thousands of researchers, students, and academics in our collaborative platform. 
              Discover, organize, and share knowledge like never before.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleGetStarted}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              </button>
              
              <a 
                href="/login"
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-500"
              >
                Sign In
                <i className="fas fa-sign-in-alt ml-2 group-hover:translate-x-1 transition-transform"></i>
              </a>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setActiveFeature(index)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/30 shadow-xl' 
                      : 'bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                    <i className={`${feature.icon} text-white text-lg`}></i>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 text-gray-400 mb-4">
            <div className="w-8 h-px bg-gray-700"></div>
            <span>Trusted by leading universities worldwide</span>
            <div className="w-8 h-px bg-gray-700"></div>
          </div>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <i className="fas fa-university text-3xl text-gray-500"></i>
            <i className="fas fa-school text-3xl text-gray-500"></i>
            <i className="fas fa-book-open text-3xl text-gray-500"></i>
            <i className="fas fa-atom text-3xl text-gray-500"></i>
            <i className="fas fa-microscope text-3xl text-gray-500"></i>
          </div>
        </div>
      </div>
    </div>
  );
}