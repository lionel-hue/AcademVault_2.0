"use client";

import { useState, useEffect } from 'react';

/**
 * Mobile-optimized select component
 */
export function MobileSelect({ value, onChange, options, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedOption = options.find(opt => opt.value === value) || options[0];
    
    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white flex items-center justify-between"
            >
                <span className="flex items-center gap-2">
                    {selectedOption.icon && <i className={selectedOption.icon}></i>}
                    {selectedOption.label}
                </span>
                <i className={`fas fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                                    value === option.value 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-300'
                                }`}
                            >
                                {option.icon && <i className={option.icon}></i>}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Mobile-optimized tabs component
 */
export function MobileTabs({ tabs, activeTab, onChange }) {
    return (
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-1 min-w-max">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                            activeTab === tab.id
                                ? `${tab.color || 'bg-blue-600'} text-white shadow-lg`
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        {tab.icon && <i className={tab.icon}></i>}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

/**
 * Mobile-friendly card component
 */
export function MobileCard({ children, className = '', onClick }) {
    return (
        <div 
            onClick={onClick}
            className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 transition-all duration-300 hover:border-gray-700 hover:shadow-lg ${className} ${
                onClick ? 'cursor-pointer' : ''
            }`}
        >
            {children}
        </div>
    );
}

/**
 * Hook to detect mobile device
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    return isMobile;
}

/**
 * Mobile-optimized button with proper touch target
 */
export function MobileButton({ children, onClick, variant = 'primary', className = '', disabled = false }) {
    const variantClasses = {
        primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
        secondary: 'bg-gray-800 text-gray-300 border border-gray-700',
        danger: 'bg-red-600 text-white',
        success: 'bg-green-600 text-white'
    };
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`min-h-[44px] px-4 py-2 rounded-lg font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        >
            {children}
        </button>
    );
}