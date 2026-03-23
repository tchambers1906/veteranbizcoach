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
- [x] Footer Email API endpoint at POST /api/footer-email (renamed from /api/subscribe)
  - Email validation (format, max 254 chars), HTML sanitization
  - IP-based rate limiting (5 req/min, 429 response)
  - Resend integration: confirmation email to subscriber + internal notification
  - Requires RESEND_API_KEY env var to send emails

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

## Completed (Villa Booking Traffic — Service Pillar 01)
- [x] Section header: "Service Pillar 01" eyebrow + headline
- [x] 5 content blocks: Problem, Cost of Inaction, Solution, Why It Works (2x2 grid), Who It's For
- [x] Alternating backgrounds: off-white, white, navy, off-white, white
- [x] Regulatory disclaimer at bottom
- [x] CTA: "Book a Villa Traffic Strategy Call" → /book?session=villa
- [x] Analytics tracking: track('cta_clicked', {...}) on CTA
- [x] All 3 locales translated (en, id, es) — no em dashes
- [x] Compliance: no income promises, disclaimer present

## Completed (Superpower Program — Service Pillar 02)
- [x] Deep navy background (#0A1628) with white/off-white text
- [x] Stats bar: gold bg, navy text, 6 items, horizontal scroll on mobile
- [x] 6 Deliverable cards: 3x2 grid desktop / single column mobile
  - Charcoal bg (#1A1A2E), gold number (Montserrat 800, 48px), teal hover border
  - Framed as "designed to produce" / "participants work toward"
- [x] Week-by-week table: 8 rows, alternating navy/charcoal, gold weeks, teal deliverables
- [x] How It Works block: session structure, requirements
- [x] Enrollment CTA (waitlist mode): "Join the Waitlist" → /resources?waitlist=superpower
  - Heading: 100 participant limit, subtext, gold button, note
- [x] Educational disclaimer at bottom
- [x] Analytics tracking: track('cta_clicked', {...}) on CTA
- [x] All 3 locales translated (en, id, es) — no em dashes
- [x] Compliance: no income promises, no guarantees, disclaimer present

## Completed (Websites & PWAs — Service Pillar 03)
- [x] Off-white background (#F8F9FA)
- [x] Teal eyebrow, navy headline, text-secondary subheadline
- [x] 4 feature cards in 2x2 grid desktop / single column mobile
  - White bg, gold icons (Smartphone, Cpu, BarChart3, Globe), navy headings, teal hover border
- [x] Teal CTA: "Book a Website/PWA Discovery Call" → /book?session=website
- [x] Analytics tracking on CTA
- [x] All 3 locales (en, id, es) — no em dashes

## Completed (Funding & Structuring — Service Pillar 04)
- [x] Deep navy background (#0A1628)
- [x] Gold eyebrow, white headline, off-white subheadline
- [x] 3 proof point cards in row (charcoal bg, gold headings, white body)
- [x] Body copy with "Amazon Bestselling Author" in full
- [x] Gold CTA: "Get Your Funding Roadmap. Book a Call." → /book?session=funding
- [x] Required funding disclaimer (gold text, small print)
- [x] Analytics tracking on CTA
- [x] All 3 locales (en, id, es) — no em dashes
- [x] Compliance: no income promises, disclaimer present

## Completed (About T.C. Chambers)
- [x] Off-white background, two-column desktop / stacked mobile
- [x] Left: teal eyebrow, navy headline, 4 narrative paragraphs
- [x] Mission callout: navy bg, gold left border, white italic text
- [x] Right: Credentials sidebar (charcoal bg, gold heading, 7 items with teal checkmarks)
- [x] Social links: Instagram, Facebook, LinkedIn (gold icons, new tab)
- [x] "Read the full story" teal link → /about
- [x] Analytics tracking on CTA
- [x] All 3 locales (en, id, es) — no em dashes
- [x] Compliance: "Amazon Bestselling Author" in full, no income promises

## Completed (Meet the Team)
- [x] White bg, navy eyebrow bar, 2x2 grid cards
- [x] TC Chambers with real headshot, Rita Rosita (RR), Tami Rini (TR) with avatar initials
- [x] "Join the Team" placeholder card (dashed border, muted, + icon)
- [x] Gold expertise tags (badge style), teal titles, navy names
- [x] All 3 locales (en, id, es) — no em dashes

## Completed (Testimonials)
- [x] Off-white bg, filter tabs (All + 5 pillars), active=teal underline
- [x] 3 placeholder cards (marked with code comment for replacement)
- [x] Avatar initials, name, business type, italic quote, teal result badge
- [x] Testimonial disclaimer at bottom
- [x] "See All Testimonials" teal CTA → /testimonials
- [x] All 3 locales (en, id, es) — no em dashes

## Completed (Lead Magnet — Resources)
- [x] Navy bg, two-column (copy left + form right), stacked mobile
- [x] Gold eyebrow, white headline, 5 teal-checkmark bullet points
- [x] Educational disclaimer below bullets
- [x] Form: First Name + Email with labels, gold "Send Me the Blueprint" button
- [x] Privacy line, success/error states
- [x] POST /api/lead-magnet: validation, sanitization, rate limiting, Resend integration
- [x] Analytics: track('lead_magnet_submitted', {...}) on success
- [x] All 3 locales (en, id, es) — no em dashes

## Completed (Business Readiness Quiz)
- [x] Off-white bg, 6-question multi-step quiz
- [x] Progress bar (teal fill, charcoal track)
- [x] Quiz routing logic: maps answers → 6 possible pillars with CTA links
- [x] Result card: navy bg, gold heading, teal CTA button
- [x] Optional email capture after result → POST /api/quiz-lead
- [x] "Take the quiz again" restart option
- [x] POST /api/quiz-lead: validation, rate limiting, Resend integration
- [x] Analytics: track('quiz_completed', {...}) on completion, track('cta_clicked', {...}) on CTA
- [x] All 3 locales (en, id, es) — no em dashes

## API Endpoints
- [x] POST /api/footer-email — email validation, rate limiting, Resend (2 emails)
- [x] POST /api/lead-magnet — firstName+email validation, rate limiting, Resend (2 emails)
- [x] POST /api/quiz-lead — email validation, rate limiting, Resend (2 emails)
- [x] POST /api/chatbot-lead — email+context validation, rate limiting, Resend (2 emails)
- All endpoints: RESEND_API_KEY env var required for email sending

## Completed (FAQ Section)
- [x] White bg, 5 categories, 17 Q&A items
- [x] Accordion: one open at a time, chevron rotation, smooth animation
- [x] prefers-reduced-motion respected
- [x] All 3 locales (en, id, es) — no em dashes
- [x] Compliance: no income promises, funding disclaimer language in FAQ answers

## Completed (Book Page — /book)
- [x] Navy bg, session type tabs pre-selected from ?session= URL param
- [x] 5 session types: strategy, villa, ai-strategy, website, funding
- [x] Calendly iframe (uses NEXT_PUBLIC_CALENDLY_URL env var) with loading skeleton
- [x] Placeholder state when no Calendly URL: "Calendar coming soon" + email CTA
- [x] Analytics: track('booking_page_viewed', {...}) on page load
- [x] All 3 locales (en, id, es) — no em dashes

## Completed (AI Chatbot Widget)
- [x] Fixed bottom-right, z-999, every page via root layout
- [x] Collapsed: 56px teal circle, MessageCircle icon, pulse animation (motion-safe)
- [x] Auto-expand: 15s timer OR 50% scroll depth, session dismiss
- [x] Expanded: 380px navy card, gold header, close button, ESC key
- [x] 5 quick reply buttons with static response map (Phase 1)
- [x] Email capture after response → POST /api/chatbot-lead
- [x] Focus trap, keyboard accessible, aria-label, aria-expanded
- [x] Analytics: chatbot_opened, cta_clicked, chatbot_lead_captured
- [x] All 3 locales (en, id, es) — no em dashes

## Next Steps
- Add RESEND_API_KEY, LEAD_MAGNET_PDF_URL, NEXT_PUBLIC_CALENDLY_URL env vars
- Build out static page content (/about full page, /testimonials, etc.)
- Configure PostHog and GA4 analytics SDKs
- Replace placeholder testimonials with real ones
- Add JSON-LD FAQPage schema to homepage
