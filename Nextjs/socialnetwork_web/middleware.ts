import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/home') && !token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (pathname === '/signin' && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home', '/signin', '/signup'],
};