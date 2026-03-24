import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

const handleI18n = createMiddleware(routing);

export default async function proxy(request: Request) {
  const url = new URL(request.url);

  // Allow PWA core files through without locale processing
  const pwaFiles = ['/manifest.webmanifest', '/sw.js', '/workbox', '/offline'];
  if (pwaFiles.some((file) => url.pathname.includes(file))) {
    return undefined; // pass through
  }

  // Allow admin routes through without locale processing
  if (url.pathname.startsWith('/admin')) {
    return undefined; // pass through — admin has no i18n
  }

  return handleI18n(request as any);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
