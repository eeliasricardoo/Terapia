# Testing Guidelines

This project uses **Jest** for unit/component testing and **Playwright** for End-to-End (E2E) testing.

## Unit & Component Testing (Jest)

Used for testing individual functions, hooks, and components in isolation.

- **Command**: `npm run test`
- **Watch Mode**: `npm run test:watch`
- **Location**: Co-located with components (e.g., `src/components/Button/Button.test.tsx`) or in `src/__tests__`.
- **Naming Convention**: `*.test.tsx` or `*.test.ts`.

### Example
```tsx
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## End-to-End Testing (Playwright)

Used for testing complete user flows and interactions across pages.

- **Command**: `npm run test:e2e`
- **UI Mode**: `npx playwright test --ui`
- **Location**: `e2e/` folder.
- **Naming Convention**: `*.spec.ts`.

### Example
```ts
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Terapia/);
});
```

## Best Practices

1.  **Write tests for all new features.**
2.  **Mock external API calls** in Jest tests.
3.  **Use data-testid** attributes if semantic queries (role, text) are not sufficient.
4.  **Run all tests** before pushing code.
