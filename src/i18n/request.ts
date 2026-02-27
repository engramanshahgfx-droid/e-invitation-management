import type { NextRequest } from 'next/server';

// This module is used by next-intl (via the plugin) to determine the locale
// from incoming requests. The plugin looks for a file at ./i18n/request.*
// and will throw an error if it cannot find it (which is what we fixed).

// We don't strictly need a specific return type here; the plugin just reads the
// `locale` property. Using `any` prevents type errors if the typings change.
export function request(request: NextRequest): any {
  return {
    locale: request.nextUrl.locale || 'en',
  };
}
