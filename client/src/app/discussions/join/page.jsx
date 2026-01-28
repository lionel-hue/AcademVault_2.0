// client/src/app/discussions/join/page.jsx - UPDATED
"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthService from '@/lib/auth';

function JoinContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Joining discussion...');

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            setStatus('No invite code found.');
            return;
        }

        const tryJoin = async () => {
            try {
                const response = await AuthService.joinDiscussionByCode(code);
                // Whether newly joined or already a member, if success is true, redirect to chat
                if (response.success) {
                    router.push(`/discussions/${response.data.discussion_id}`);
                }
            } catch (error) {
                // Handle the case where the API still throws a 400/already member error
                if (error.message.includes('400') || error.message.includes('Already')) {
                    router.push('/discussions');
                } else {
                    setStatus('Error: ' + error.message);
                }
            }
        };

        tryJoin();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">{status}</p>
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense>
            <JoinContent />
        </Suspense>
    );
}