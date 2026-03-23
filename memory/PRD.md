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

## Completed (Persistent Layout & Nav)
- [x] Desktop Navbar — gold logo, 5 center links, EN|ES|ID toggle, "Book a Call" CTA
- [x] Mobile Navbar — hamburger menu with full-screen drawer (close, language, links, CTA, social icons)
- [x] Footer — 4-column (Brand+Social, Navigation, Lead Magnet form, Contact) + Legal strip
- [x] PWA Install Banner — 30s timer / 2nd visit trigger, localStorage 7-day suppress
- [x] Enhanced offline page — social links, email, browse note
- [x] ScrollReveal animations with prefers-reduced-motion
- [x] Subscribe API endpoint at /api/subscribe

## Completed (Hero Section)
- [x] Full-bleed navy background with CSS grain texture + radial gradient glows
- [x] Two-column layout (text left, photo right) / stacked mobile
- [x] Eyebrow: gold, Montserrat 600, uppercase, tracking-widest
- [x] Headline: white, Montserrat 800, 60px desktop / 36px mobile, word stagger animation
- [x] Subheadline: off-white, Source Sans 3, 20px desktop / 17px mobile, max-w 560px
- [x] CTA Group: Primary (gold bg) + Secondary (gold border), 44px min tap target
- [x] Photo: TC initials placeholder (auto-switches to real image if available)
- [x] Credibility bar: charcoal bg, 5 items with gold dots, horizontal scroll on mobile
- [x] Full animation sequence: eyebrow → headline words → subheadline → CTAs → credibility
- [x] prefers-reduced-motion: all animations disabled

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
