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
