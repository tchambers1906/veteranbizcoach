/**
 * Unified analytics tracking wrapper.
 * Sends events to both PostHog and GA4 when their keys are present.
 * Fails silently when keys are not configured.
 */

type EventProperties = Record<string, string | number | boolean | undefined>;

/**
 * Track an event across all configured analytics providers.
 */
export function track(eventName: string, properties?: EventProperties): void {
  // PostHog tracking
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    try {
      // PostHog is loaded via script tag — access from window
      const posthog = (window as unknown as Record<string, unknown>).posthog as
        | { capture: (event: string, props?: EventProperties) => void }
        | undefined;
      posthog?.capture(eventName, properties);
    } catch {
      // Fail silently
    }
  }

  // Google Analytics 4 tracking
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  ) {
    try {
      const gtag = (window as unknown as Record<string, unknown>).gtag as
        | ((...args: unknown[]) => void)
        | undefined;
      gtag?.('event', eventName, properties);
    } catch {
      // Fail silently
    }
  }
}

/**
 * Identify a user across analytics providers.
 */
export function identify(
  userId: string,
  traits?: EventProperties
): void {
  // PostHog identify
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    try {
      const posthog = (window as unknown as Record<string, unknown>).posthog as
        | { identify: (id: string, props?: EventProperties) => void }
        | undefined;
      posthog?.identify(userId, traits);
    } catch {
      // Fail silently
    }
  }
}
