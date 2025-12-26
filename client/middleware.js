// client/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('academvault_token')?.value;
  
  // Protected routes that require login
  const protectedRoutes = ['/dashboard'];
  
  // Routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/signup'];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if current path is auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing auth route with token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Only run middleware on specific routes
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
};