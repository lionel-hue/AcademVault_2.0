// client/middleware.js

import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('academvault_token')?.value;

    const protectedPaths = ['/dashboard', '/documents', '/discussions', '/friends', '/profile', '/search-sessions'];
    const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

    // If accessing a protected route without a token
    if (isProtectedRoute && !token) {
        // Exception for the join page
        if (pathname === '/discussions/join') return NextResponse.next();

        const url = new URL('/login', request.url);
        url.searchParams.set('callback', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};