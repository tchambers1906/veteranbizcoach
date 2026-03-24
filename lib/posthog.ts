import posthog from 'posthog-js';

/**
 * Initialise the PostHog client-side SDK.
 * Fails silently if keys are not present.
 */
export function initPostHog() {
  if (typeof window === 'undefined') return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) return;

  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          ph.debug(false);
        }
      },
    });
  }
}

export default posthog;
