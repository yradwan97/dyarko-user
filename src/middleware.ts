import createMiddleware from 'next-intl/middleware';
import { auth } from './lib/auth';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  // Skip middleware for all API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Run next-intl middleware for internationalization
  return intlMiddleware(req as NextRequest);
}) as any; // Type assertion needed for NextAuth v5 beta compatibility

export const config = {
  // Match all paths except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ]
};
