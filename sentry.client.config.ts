'use client'

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === 'production',

    // Replay (capture on error only in production to save cost)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Performance Monitoring — trace only a fraction in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    sendDefaultPii: false,

    integrations: [
      Sentry.replayIntegration({
        // Mask all text & inputs — patient data must never leave the browser in replays
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],

    beforeSend(event) {
      if (event.user) {
        delete event.user.ip_address
        delete event.user.email
      }
      return event
    },

    ignoreErrors: ['ResizeObserver loop', 'Network request failed', 'NEXT_REDIRECT'],
  })
}
