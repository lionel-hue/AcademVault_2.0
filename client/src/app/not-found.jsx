"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Professional redirect to landing page after a tiny delay
        const timer = setTimeout(() => {
            router.push('/');
        }, 100);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Redirecting you to home...</p>
            </div>
        </div>
    );
}