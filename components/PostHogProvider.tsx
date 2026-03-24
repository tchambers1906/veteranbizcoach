'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/posthog';

/**
 * PostHog analytics provider.
 * Initialises the SDK on mount. Fails silently if keys not configured.
 */
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
