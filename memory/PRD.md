# VeteranBizCoach — Project Foundation

## Overview
Next.js 16 App Router project with TypeScript, Tailwind CSS v4, PWA (Serwist), and i18n (next-intl) support for veteranbizcoach.com.

## Stack
- **Framework**: Next.js 16.2.1 with App Router + TypeScript
- **Styling**: Tailwind CSS v4 with `@theme` configuration
- **PWA**: Serwist (@serwist/next v9.5.7)
- **i18n**: next-intl v4.8.3 — locales: en, es, id
- **Fonts**: Montserrat (700, 800) + Source Sans 3 (400, 500)
- **Bundler**: Turbopack (Next.js 16 default)
- **React**: v19.2.4 with React Compiler

## Completed (Foundation & Config)
- [x] Next.js 16 with TypeScript setup
- [x] Tailwind CSS v4 with `@tailwindcss/postcss`
- [x] Custom color palette (navy, gold, teal, etc.) via `@theme`
- [x] PWA: Serwist service worker, manifest.ts, placeholder icons
- [x] i18n: next-intl with 3 locales (en, es, id) — all translated
- [x] proxy.ts with next-intl middleware + PWA passthrough
- [x] Google Fonts (Montserrat + Source Sans 3) via next/font
- [x] All 12 route stubs under `[locale]/`
- [x] Offline page at `/offline`
- [x] Analytics wrapper (lib/analytics.ts)
- [x] Resend email utility (lib/resend.ts)
- [x] .env.local.example with all required variables
- [x] React Compiler (babel-plugin-react-compiler)

## Routes
- `/` → redirects to `/en`
- `/[locale]` → Home page (en/es/id)
- `/[locale]/about`
- `/[locale]/villa-booking-traffic`
- `/[locale]/superpower`
- `/[locale]/websites-pwas`
- `/[locale]/funding-structuring`
- `/[locale]/team`
- `/[locale]/testimonials`
- `/[locale]/quiz`
- `/[locale]/resources`
- `/[locale]/faq`
- `/[locale]/book`
- `/offline` — PWA offline fallback
- `/manifest.webmanifest` — PWA manifest

## Next Steps
- Build UI components and page layouts
- Integrate Calendly for booking
- Set up PostHog and GA4 analytics
- Configure Resend for transactional emails
- Add lead magnet functionality
