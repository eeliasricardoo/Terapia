import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === 'production',

    // Lower rate in production to control cost; sample more generously elsewhere
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Drop PII at the SDK level; LGPD/GDPR scrubbing is applied in beforeSend
    sendDefaultPii: false,

    beforeSend(event) {
      // Strip request body and cookies from server events to avoid leaking health data
      if (event.request) {
        delete event.request.cookies
        delete event.request.data
      }
      if (event.user) {
        delete event.user.ip_address
        delete event.user.email
      }
      return event
    },

    ignoreErrors: [
      // Expected Next.js navigation errors
      'NEXT_REDIRECT',
      'NEXT_NOT_FOUND',
    ],
  })
}
