import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'T.C. Chambers — AI-First Business Strategist',
    short_name: 'TC Chambers',
    description:
      'Business funding, AI strategy, and PWA development for entrepreneurs worldwide.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A1628',
    theme_color: '#0A1628',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
