import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'ar'];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || 'en';

  if (!locales.includes(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../public/locales/${locale}.ts`)).default,
  };
});
