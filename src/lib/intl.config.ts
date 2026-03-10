import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  return {
    locale: 'en',
    messages: (await import(`../../public/locales/en`)).default,
  }
})
