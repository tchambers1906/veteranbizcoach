import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  let messages;
  if (locale === 'es') {
    messages = (await import('../../locales/es/common.json')).default;
  } else if (locale === 'id') {
    messages = (await import('../../locales/id/common.json')).default;
  } else {
    messages = (await import('../../locales/en/common.json')).default;
  }

  return {
    locale,
    messages,
  };
});
