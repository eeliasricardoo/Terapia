import { TextEncoder, TextDecoder } from 'util'
const streamWeb = require('stream/web')
const v8 = require('v8')

// Polyfill TextEncoder, TextDecoder and web streams
Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ...streamWeb,
})

// Robust polyfill for structuredClone using Node's v8 module
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    if (obj === undefined) return undefined
    return v8.deserialize(v8.serialize(obj))
  }
}

// Polyfill web APIs from Next.js primitives (guarantees compatibility with Next.js)
const { Headers, Request, Response } = require('next/dist/compiled/@edge-runtime/primitives')
Object.assign(global, { Headers, Request, Response })

import '@testing-library/jest-dom'

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    getAll: jest.fn(() => []),
    set: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => new Headers(),
}))

// Mock next-intl ESM modules to avoid Jest parse errors
jest.mock('next-intl/routing', () => ({
  defineRouting: (config: unknown) => config,
}))

jest.mock('next-intl/navigation', () => {
  const React = require('react')
  return {
    createNavigation: () => ({
      Link: ({ href, children, ...rest }: any) =>
        React.createElement(
          'a',
          { href: typeof href === 'string' ? href : '#', ...rest },
          children
        ),
      redirect: jest.fn(),
      usePathname: jest.fn(() => '/'),
      useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
      getPathname: jest.fn(() => '/'),
    }),
  }
})

// Load real pt translations so components render realistic text in tests
const ptMessages = require('./messages/pt.json')

function resolvePath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), obj)
}

function interpolate(template: string, values?: Record<string, any>): string {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    values[k] != null ? String(values[k]) : `{${k}}`
  )
}

jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const t = (key: string, values?: Record<string, any>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      const found = resolvePath(ptMessages, fullKey)
      if (typeof found === 'string') return interpolate(found, values)
      return fullKey
    }
    t.rich = (key: string, values?: Record<string, any>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      const found = resolvePath(ptMessages, fullKey)
      return typeof found === 'string' ? interpolate(found, values) : fullKey
    }
    t.raw = (key: string) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      return resolvePath(ptMessages, fullKey) ?? fullKey
    }
    t.has = (key: string) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      return resolvePath(ptMessages, fullKey) != null
    }
    return t
  },
  getTranslations: async (namespace?: string) => {
    const t = (key: string, values?: Record<string, any>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      const found = resolvePath(ptMessages, fullKey)
      if (typeof found === 'string') return interpolate(found, values)
      return fullKey
    }
    return t
  },
  useLocale: () => 'pt',
  getLocale: async () => 'pt',
  useFormatter: () => ({
    dateTime: (d: Date) => d.toISOString(),
    number: (n: number) => String(n),
    relativeTime: (d: Date) => d.toISOString(),
  }),
  useMessages: () => ptMessages,
  getMessages: async () => ptMessages,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('next-intl/server', () => ({
  getTranslations: async (namespace?: string) => {
    const t = (key: string, values?: Record<string, any>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      const found = resolvePath(ptMessages, fullKey)
      if (typeof found === 'string') return interpolate(found, values)
      return fullKey
    }
    return t
  },
  getLocale: async () => 'pt',
  getMessages: async () => ptMessages,
  getFormatter: async () => ({
    dateTime: (d: Date) => d.toISOString(),
    number: (n: number) => String(n),
  }),
  setRequestLocale: jest.fn(),
  unstable_setRequestLocale: jest.fn(),
}))

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null
  rootMargin = ''
  thresholds = []
  takeRecords() {
    return []
  }
}
