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
}));

global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
