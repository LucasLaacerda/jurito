module.exports = {
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    localeDetection: false,
  },
  localePath: './public/locales',
  reloadOnPrerender: true,
  debug: process.env.NODE_ENV === 'development',
  fallbackLng: false,
  load: 'currentOnly'
} 