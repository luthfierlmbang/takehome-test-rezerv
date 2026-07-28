# Rezerv Home Test — Figma Slicing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slice the 7-screen "Rezerv Home Test" Figma file into a pixel-perfect Vite + React + TypeScript + Tailwind app, with a working Back/Next flow, the agreed missing UI states, and Framer Motion animation.

**Architecture:** A `BookingContext` reducer holds form state across 7 routed steps (`/step-1`…`/step-7`), rendered inside a shared `StepLayout` (navbar + breadcrumb + stepper + page header + action buttons + page-transition wrapper). Shared primitives (`Button`, `Input`, `Card`, `Skeleton`, `EmptyState`, `ErrorBanner`) carry all interaction states and micro-interaction motion. Each screen is scaffolded from Figma via `figma-cli export-jsx`, refined against `figma-cli inspect`, wired to context, and checked against `figma-cli verify` before moving on.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, React Router v6, Framer Motion, Vitest + @testing-library/react + jsdom.

## Global Constraints

- Figma source file key: `8Ea5h7hI3OqcVCRGGhYR0w` ("Rezerv Home Test").
- Screen → Figma node ID map (top-level frames):
  - Step 1 → `1:2086` (service intro)
  - Step 2 → `1:2122`, stepper `1:3478`, page header `1:3680`
  - Step 3 → `1:2172`, stepper `1:3479`, page header `1:3673`
  - Step 4 → `1:2225` (Locations & coaches), stepper `1:3477`, page header `1:3687`
  - Step 5 → `1:2364` (Bookable durations & settings), stepper `1:3480`, page header `1:3666`
  - Step 6 → `1:2439` (Pricing + payment method), stepper `1:3476`, page header `1:2462`
  - Step 7 → `1:2522` (Review), stepper `1:2553`, page header `1:2545`
- Design tokens (confirmed from node tree, verify remainder via `figma-cli` in Task 2): primary `#083035`, border/stroke `#E4E4E7`, secondary surface `#FAFAFA`, muted text `#71717A`, radius `8px` (buttons/small cards) and `16px` (containers).
- Every shared component ships with hover/focus/active/disabled states where applicable — no bare static markup.
- No backend calls — all data/async is simulated locally (see Task 9's `simulateAsyncLoad`).

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `vitest.setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: a Vite dev server on port 5173, an `App` component rendered at `#root`, Vitest configured to run `*.test.tsx` with jsdom.

- [ ] **Step 1: Scaffold Vite React-TS app**

```bash
cd "/Users/macbook/Rezerv Hometest"
npm create vite@latest . -- --template react-ts
npm install
```

- [ ] **Step 2: Install runtime and dev dependencies**

```bash
npm install react-router-dom framer-motion
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind content paths**

`tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Configure Vitest**

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
  },
})
```

`vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 5: Write the failing smoke test**

`src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the app shell', () => {
  render(<App />)
  expect(screen.getByTestId('app-shell')).toBeInTheDocument()
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — no element with `data-testid="app-shell"`

- [ ] **Step 7: Implement minimal App shell**

`src/App.tsx`:
```tsx
export default function App() {
  return <div data-testid="app-shell">Rezerv Home Test</div>
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig*.json tailwind.config.ts postcss.config.js vitest.setup.ts index.html src/main.tsx src/App.tsx src/App.test.tsx src/index.css .gitignore
git commit -m "chore: scaffold Vite React TS Tailwind Vitest project"
```

---

### Task 2: Design tokens

**Files:**
- Create: `src/styles/tokens.ts`
- Modify: `tailwind.config.ts`
- Test: `src/styles/tokens.test.ts`

**Interfaces:**
- Produces: `colors` object (`{ primary: '#083035', border: '#E4E4E7', surfaceMuted: '#FAFAFA', textMuted: '#71717A', textDefault: '#000000' }`) and `radius` object (`{ sm: '8px', lg: '16px' }'`), exported from `src/styles/tokens.ts` and merged into Tailwind theme under `theme.extend.colors.brand` / `theme.extend.borderRadius`.

- [ ] **Step 1: Write the failing test**

`src/styles/tokens.test.ts`:
```typescript
import { colors, radius } from './tokens'

test('exposes Figma-sourced brand tokens', () => {
  expect(colors.primary).toBe('#083035')
  expect(colors.border).toBe('#E4E4E7')
  expect(colors.surfaceMuted).toBe('#FAFAFA')
  expect(colors.textMuted).toBe('#71717A')
  expect(radius.sm).toBe('8px')
  expect(radius.lg).toBe('16px')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tokens`
Expected: FAIL — `./tokens` has no exported member

- [ ] **Step 3: Implement tokens**

`src/styles/tokens.ts`:
```typescript
export const colors = {
  primary: '#083035',
  border: '#E4E4E7',
  surfaceMuted: '#FAFAFA',
  textMuted: '#71717A',
  textDefault: '#000000',
} as const

export const radius = {
  sm: '8px',
  lg: '16px',
} as const
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tokens`
Expected: PASS

- [ ] **Step 5: Wire tokens into Tailwind config**

`tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'
import { colors, radius } from './src/styles/tokens'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: colors },
      borderRadius: { sm: radius.sm, lg: radius.lg },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.ts src/styles/tokens.test.ts tailwind.config.ts
git commit -m "feat: add Figma design tokens and wire into Tailwind"
```

---

### Task 3: Button component (all states + motion)

**Files:**
- Create: `src/components/Button.tsx`
- Test: `src/components/Button.test.tsx`

**Interfaces:**
- Produces: `Button({ variant: 'primary' | 'secondary', state?: 'default' | 'loading', disabled?: boolean, children, onClick? }): JSX.Element`, forwarding remaining native button props.

- [ ] **Step 1: Write the failing tests**

`src/components/Button.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

test('renders primary variant with brand background class', () => {
  render(<Button variant="primary">Save</Button>)
  expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('bg-brand-primary')
})

test('renders secondary variant with border class', () => {
  render(<Button variant="secondary">Cancel</Button>)
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('border-brand-border')
})

test('disables the button and blocks clicks when disabled', async () => {
  const onClick = vi.fn()
  render(<Button variant="primary" disabled onClick={onClick}>Save</Button>)
  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toBeDisabled()
  await userEvent.click(button)
  expect(onClick).not.toHaveBeenCalled()
})

test('shows a spinner and disables interaction in loading state', () => {
  render(<Button variant="primary" state="loading">Save</Button>)
  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toBeDisabled()
  expect(screen.getByTestId('button-spinner')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Button`
Expected: FAIL — `./Button` has no exported member `Button`

- [ ] **Step 3: Implement Button**

`src/components/Button.tsx`:
```tsx
import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'primary' | 'secondary'
  state?: 'default' | 'loading'
}

const VARIANT_CLASSES: Record<ButtonProps['variant'], string> = {
  primary: 'bg-brand-primary text-white hover:bg-[#0d4750] disabled:bg-[#083035]/40',
  secondary: 'bg-white border border-brand-border text-black hover:bg-brand-surfaceMuted disabled:opacity-40',
}

export function Button({ variant, state = 'default', disabled, className, children, ...rest }: ButtonProps) {
  const isDisabled = disabled || state === 'loading'

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className ?? ''}`}
      {...rest}
    >
      {state === 'loading' && (
        <span
          data-testid="button-spinner"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </motion.button>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Button`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Button.tsx src/components/Button.test.tsx
git commit -m "feat: add Button component with variants, states, and tap/hover motion"
```

---

### Task 4: Input component (all states)

**Files:**
- Create: `src/components/Input.tsx`
- Test: `src/components/Input.test.tsx`

**Interfaces:**
- Produces: `Input({ label: string, value: string, onChange: (v: string) => void, error?: string, disabled?: boolean, placeholder?: string }): JSX.Element`

- [ ] **Step 1: Write the failing tests**

`src/components/Input.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

test('renders label and empty placeholder', () => {
  render(<Input label="Service name" value="" onChange={() => {}} placeholder="e.g. Personal Training" />)
  expect(screen.getByLabelText('Service name')).toHaveAttribute('placeholder', 'e.g. Personal Training')
})

test('calls onChange with the new value when filled', async () => {
  const onChange = vi.fn()
  render(<Input label="Service name" value="" onChange={onChange} />)
  await userEvent.type(screen.getByLabelText('Service name'), 'A')
  expect(onChange).toHaveBeenCalledWith('A')
})

test('shows error message and error border class when error is set', () => {
  render(<Input label="Service name" value="" onChange={() => {}} error="Required" />)
  expect(screen.getByText('Required')).toBeInTheDocument()
  expect(screen.getByLabelText('Service name')).toHaveClass('border-red-500')
})

test('disables the field when disabled', () => {
  render(<Input label="Service name" value="" onChange={() => {}} disabled />)
  expect(screen.getByLabelText('Service name')).toBeDisabled()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Input`
Expected: FAIL — `./Input` has no exported member `Input`

- [ ] **Step 3: Implement Input**

`src/components/Input.tsx`:
```tsx
import { useId } from 'react'

type InputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export function Input({ label, value, onChange, error, disabled, placeholder }: InputProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-black">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-sm border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:bg-brand-surfaceMuted disabled:text-brand-textMuted ${
          error ? 'border-red-500' : 'border-brand-border focus:border-brand-primary'
        }`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Input`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Input.tsx src/components/Input.test.tsx
git commit -m "feat: add Input component with empty/focus/error/disabled states"
```

---

### Task 5: Card, Skeleton, EmptyState, ErrorBanner components

**Files:**
- Create: `src/components/Card.tsx`, `src/components/Skeleton.tsx`, `src/components/EmptyState.tsx`, `src/components/ErrorBanner.tsx`
- Test: `src/components/Card.test.tsx`, `src/components/Skeleton.test.tsx`, `src/components/EmptyState.test.tsx`, `src/components/ErrorBanner.test.tsx`

**Interfaces:**
- Produces: `Card({ children }): JSX.Element`, `Skeleton({ className? }): JSX.Element`, `EmptyState({ label: string, onAction?: () => void, actionLabel?: string }): JSX.Element`, `ErrorBanner({ message: string }): JSX.Element`

- [ ] **Step 1: Write the failing tests**

`src/components/Card.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

test('renders children inside a bordered rounded container', () => {
  render(<Card>content</Card>)
  const card = screen.getByText('content').parentElement
  expect(card).toHaveClass('border-brand-border', 'rounded-lg')
})
```

`src/components/Skeleton.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

test('renders a shimmering placeholder block', () => {
  render(<Skeleton />)
  expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse')
})
```

`src/components/EmptyState.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

test('renders label and fires the action when clicked', async () => {
  const onAction = vi.fn()
  render(<EmptyState label="No image yet" actionLabel="Upload" onAction={onAction} />)
  expect(screen.getByText('No image yet')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Upload' }))
  expect(onAction).toHaveBeenCalled()
})
```

`src/components/ErrorBanner.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { ErrorBanner } from './ErrorBanner'

test('renders the error message with role alert', () => {
  render(<ErrorBanner message="Something went wrong" />)
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Card Skeleton EmptyState ErrorBanner`
Expected: FAIL — none of the four modules exist yet

- [ ] **Step 3: Implement the four components**

`src/components/Card.tsx`:
```tsx
import type { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-brand-border p-6">{children}</div>
}
```

`src/components/Skeleton.tsx`:
```tsx
export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return <div data-testid="skeleton" className={`animate-pulse rounded-sm bg-brand-surfaceMuted ${className}`} />
}
```

`src/components/EmptyState.tsx`:
```tsx
import { Button } from './Button'

type EmptyStateProps = {
  label: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ label, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-brand-border p-8 text-center">
      <span className="text-sm text-brand-textMuted">{label}</span>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
```

`src/components/ErrorBanner.tsx`:
```tsx
import { motion } from 'framer-motion'

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </motion.div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Card Skeleton EmptyState ErrorBanner`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Card.tsx src/components/Skeleton.tsx src/components/EmptyState.tsx src/components/ErrorBanner.tsx src/components/Card.test.tsx src/components/Skeleton.test.tsx src/components/EmptyState.test.tsx src/components/ErrorBanner.test.tsx
git commit -m "feat: add Card, Skeleton, EmptyState, ErrorBanner components"
```

---

### Task 6: Breadcrumb and Stepper components

**Files:**
- Create: `src/components/Breadcrumb.tsx`, `src/components/Stepper.tsx`
- Test: `src/components/Breadcrumb.test.tsx`, `src/components/Stepper.test.tsx`

**Interfaces:**
- Consumes: none beyond React/Framer Motion.
- Produces: `Breadcrumb({ items: string[] }): JSX.Element`, `Stepper({ steps: string[], currentIndex: number }): JSX.Element` (0-based `currentIndex`; steps before it are "completed", the step at it is "current", the rest are "upcoming"). Both are consumed by `StepLayout` in Task 9.

- [ ] **Step 1: Write the failing tests**

`src/components/Breadcrumb.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'

test('renders items separated by carets', () => {
  render(<Breadcrumb items={['Services', 'New service']} />)
  expect(screen.getByText('Services')).toBeInTheDocument()
  expect(screen.getByText('New service')).toBeInTheDocument()
  expect(screen.getByTestId('breadcrumb-caret')).toBeInTheDocument()
})
```

`src/components/Stepper.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { Stepper } from './Stepper'

const steps = ['Overview', 'Basic details', 'Locations', 'Durations', 'Pricing', 'Review']

test('marks steps before currentIndex as completed and the current one as current', () => {
  render(<Stepper steps={steps} currentIndex={2} />)
  expect(screen.getByTestId('step-0')).toHaveAttribute('data-state', 'completed')
  expect(screen.getByTestId('step-1')).toHaveAttribute('data-state', 'completed')
  expect(screen.getByTestId('step-2')).toHaveAttribute('data-state', 'current')
  expect(screen.getByTestId('step-3')).toHaveAttribute('data-state', 'upcoming')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Breadcrumb Stepper`
Expected: FAIL — modules don't exist

- [ ] **Step 3: Implement Breadcrumb and Stepper**

`src/components/Breadcrumb.tsx`:
```tsx
export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-brand-textMuted">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          <span className={i === items.length - 1 ? 'text-black' : ''}>{item}</span>
          {i < items.length - 1 && (
            <span data-testid="breadcrumb-caret" aria-hidden>
              ›
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
```

`src/components/Stepper.tsx`:
```tsx
import { motion } from 'framer-motion'

type StepState = 'completed' | 'current' | 'upcoming'

function stateFor(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return 'completed'
  if (index === currentIndex) return 'current'
  return 'upcoming'
}

const STATE_CLASSES: Record<StepState, string> = {
  completed: 'bg-brand-primary text-white',
  current: 'bg-white border-2 border-brand-primary text-brand-primary',
  upcoming: 'bg-brand-surfaceMuted text-brand-textMuted',
}

export function Stepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const state = stateFor(i, currentIndex)
        return (
          <li key={step} data-testid={`step-${i}`} data-state={state} className="flex flex-1 flex-col items-center gap-1">
            <motion.span
              layout
              transition={{ duration: 0.25 }}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${STATE_CLASSES[state]}`}
            >
              {i + 1}
            </motion.span>
            <span className="text-xs text-brand-textMuted">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Breadcrumb Stepper`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Breadcrumb.tsx src/components/Stepper.tsx src/components/Breadcrumb.test.tsx src/components/Stepper.test.tsx
git commit -m "feat: add Breadcrumb and Stepper components with completed/current/upcoming states"
```

---

### Task 7: Navbar component

**Files:**
- Create: `src/components/Navbar.tsx`
- Test: `src/components/Navbar.test.tsx`

**Interfaces:**
- Produces: `Navbar({ activeItem: string, items: { label: string, href: string }[] }): JSX.Element`. Rendered once by `StepLayout` (Task 9) as the left sidebar (matches Figma `Navigation barTertiary`, 291px wide).

- [ ] **Step 1: Write the failing test**

`src/components/Navbar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

const items = [
  { label: 'Services', href: '/services' },
  { label: 'Calendar', href: '/calendar' },
]

test('renders nav items and highlights the active one', () => {
  render(
    <MemoryRouter>
      <Navbar activeItem="Services" items={items} />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: 'Services' })).toHaveClass('bg-brand-surfaceMuted')
  expect(screen.getByRole('link', { name: 'Calendar' })).not.toHaveClass('bg-brand-surfaceMuted')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Navbar`
Expected: FAIL — module doesn't exist

- [ ] **Step 3: Implement Navbar**

`src/components/Navbar.tsx`:
```tsx
import { Link } from 'react-router-dom'

type NavItem = { label: string; href: string }

export function Navbar({ activeItem, items }: { activeItem: string; items: NavItem[] }) {
  return (
    <aside className="flex h-full w-[291px] flex-col justify-between border-r border-brand-border bg-white p-4">
      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`rounded-sm px-3 py-2 text-sm transition-colors hover:bg-brand-surfaceMuted ${
              item.label === activeItem ? 'bg-brand-surfaceMuted font-medium text-black' : 'text-brand-textMuted'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-white p-3">
        <div className="h-8 w-8 rounded-full bg-brand-surfaceMuted" />
        <span className="text-sm">Account</span>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Navbar`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/components/Navbar.test.tsx
git commit -m "feat: add Navbar component"
```

---

### Task 8: PageHeader and ActionButtons components

**Files:**
- Create: `src/components/PageHeader.tsx`, `src/components/ActionButtons.tsx`
- Test: `src/components/PageHeader.test.tsx`, `src/components/ActionButtons.test.tsx`

**Interfaces:**
- Consumes: `Button` from Task 3.
- Produces: `PageHeader({ title: string, description: string }): JSX.Element`, `ActionButtons({ onBack?: () => void, onNext: () => void, nextLabel?: string, nextState?: 'default' | 'loading', backDisabled?: boolean }): JSX.Element`. Consumed by `StepLayout` in Task 9.

- [ ] **Step 1: Write the failing tests**

`src/components/PageHeader.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { PageHeader } from './PageHeader'

test('renders title and description', () => {
  render(<PageHeader title="Basic details" description="Set the name and description." />)
  expect(screen.getByRole('heading', { name: 'Basic details' })).toBeInTheDocument()
  expect(screen.getByText('Set the name and description.')).toBeInTheDocument()
})
```

`src/components/ActionButtons.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButtons } from './ActionButtons'

test('fires onBack and onNext, disables Back when backDisabled', async () => {
  const onBack = vi.fn()
  const onNext = vi.fn()
  render(<ActionButtons onBack={onBack} onNext={onNext} backDisabled />)
  expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(onNext).toHaveBeenCalled()
})

test('shows loading state on Next when nextState is loading', () => {
  render(<ActionButtons onNext={() => {}} nextState="loading" />)
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- PageHeader ActionButtons`
Expected: FAIL — modules don't exist

- [ ] **Step 3: Implement PageHeader and ActionButtons**

`src/components/PageHeader.tsx`:
```tsx
export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 border-b border-brand-border bg-white px-6 py-6">
      <h1 className="text-2xl font-medium text-black">{title}</h1>
      <p className="text-base text-brand-textMuted">{description}</p>
    </div>
  )
}
```

`src/components/ActionButtons.tsx`:
```tsx
import { Button } from './Button'

type ActionButtonsProps = {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextState?: 'default' | 'loading'
  backDisabled?: boolean
}

export function ActionButtons({ onBack, onNext, nextLabel = 'Next', nextState, backDisabled }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-4 rounded-lg border border-brand-border bg-white px-4 py-4">
      <Button variant="secondary" onClick={onBack} disabled={backDisabled || !onBack}>
        Back
      </Button>
      <Button variant="primary" onClick={onNext} state={nextState}>
        {nextLabel}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- PageHeader ActionButtons`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/PageHeader.tsx src/components/ActionButtons.tsx src/components/PageHeader.test.tsx src/components/ActionButtons.test.tsx
git commit -m "feat: add PageHeader and ActionButtons components"
```

---

### Task 9: BookingContext, routing shell, and StepLayout

**Files:**
- Create: `src/context/BookingContext.tsx`, `src/lib/simulateAsyncLoad.ts`, `src/components/StepLayout.tsx`
- Modify: `src/App.tsx`
- Test: `src/context/BookingContext.test.tsx`, `src/components/StepLayout.test.tsx`

**Interfaces:**
- Consumes: `Navbar`, `Breadcrumb`, `Stepper`, `PageHeader`, `ActionButtons`, `Skeleton` from Tasks 3–8.
- Produces: `BookingProvider`, `useBooking(): { data: BookingData, updateField: (key: keyof BookingData, value: string) => void, currentStepIndex: number, goToStep: (index: number) => void }`; `STEP_ROUTE = (n: number) => \`/step-${n}\`` convention consumed by every screen task; `StepLayout({ stepIndex: number, title: string, description: string, onNext: () => void, nextLabel?: string, nextState?: 'default' | 'loading', backDisabled?: boolean, children: ReactNode }): JSX.Element` — wraps content with navbar/breadcrumb/stepper/header/footer, a simulated loading skeleton on mount, and an `AnimatePresence` fade/slide page transition.

- [ ] **Step 1: Write the failing BookingContext test**

`src/context/BookingContext.test.tsx`:
```tsx
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider, useBooking } from './BookingContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <BookingProvider>{children}</BookingProvider>
    </MemoryRouter>
  )
}

test('updateField persists a value and goToStep changes currentStepIndex', () => {
  const { result } = renderHook(() => useBooking(), { wrapper })

  act(() => result.current.updateField('serviceName', 'Personal Training'))
  expect(result.current.data.serviceName).toBe('Personal Training')

  act(() => result.current.goToStep(2))
  expect(result.current.currentStepIndex).toBe(2)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- BookingContext`
Expected: FAIL — module doesn't exist

- [ ] **Step 3: Implement BookingContext and simulateAsyncLoad**

`src/lib/simulateAsyncLoad.ts`:
```typescript
export function simulateAsyncLoad(delayMs = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}
```

`src/context/BookingContext.tsx`:
```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'

export type BookingData = {
  serviceName: string
  serviceDescription: string
  location: string
  coach: string
  duration: string
  price: string
  paymentMethod: string
}

const INITIAL_DATA: BookingData = {
  serviceName: '',
  serviceDescription: '',
  location: '',
  coach: '',
  duration: '',
  price: '',
  paymentMethod: '',
}

type BookingContextValue = {
  data: BookingData
  updateField: (key: keyof BookingData, value: string) => void
  currentStepIndex: number
  goToStep: (index: number) => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BookingData>(INITIAL_DATA)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  function updateField(key: keyof BookingData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function goToStep(index: number) {
    setCurrentStepIndex(index)
  }

  return (
    <BookingContext.Provider value={{ data, updateField, currentStepIndex, goToStep }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider')
  return ctx
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- BookingContext`
Expected: PASS

- [ ] **Step 5: Write the failing StepLayout test**

`src/components/StepLayout.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StepLayout } from './StepLayout'

test('shows a skeleton then reveals content and header', async () => {
  render(
    <MemoryRouter>
      <StepLayout stepIndex={1} title="Basic details" description="Set the name" onNext={() => {}}>
        <div>step body</div>
      </StepLayout>
    </MemoryRouter>,
  )

  expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  await waitFor(() => expect(screen.getByText('step body')).toBeInTheDocument())
  expect(screen.getByRole('heading', { name: 'Basic details' })).toBeInTheDocument()
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- StepLayout`
Expected: FAIL — module doesn't exist

- [ ] **Step 7: Implement StepLayout**

`src/components/StepLayout.tsx`:
```tsx
import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { Breadcrumb } from './Breadcrumb'
import { Stepper } from './Stepper'
import { PageHeader } from './PageHeader'
import { ActionButtons } from './ActionButtons'
import { Skeleton } from './Skeleton'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

const STEP_LABELS = ['Overview', 'Basic details', 'Locations', 'Durations', 'Pricing', 'Payment', 'Review']
const NAV_ITEMS = [
  { label: 'Services', href: '/step-1' },
  { label: 'Calendar', href: '#' },
]

type StepLayoutProps = {
  stepIndex: number
  title: string
  description: string
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  nextState?: 'default' | 'loading'
  backDisabled?: boolean
  children: ReactNode
}

export function StepLayout({
  stepIndex,
  title,
  description,
  onNext,
  onBack,
  nextLabel,
  nextState,
  backDisabled,
  children,
}: StepLayoutProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    let cancelled = false
    simulateAsyncLoad().then(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [stepIndex])

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar activeItem="Services" items={NAV_ITEMS} />
      <div className="flex flex-1 flex-col">
        <PageHeader title={title} description={description} />
        <div className="flex flex-col gap-4 px-8 py-6">
          <Breadcrumb items={['Services', title]} />
          <Stepper steps={STEP_LABELS} currentIndex={stepIndex} />
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="skeleton" exit={{ opacity: 0 }} className="flex flex-col gap-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-8 w-1/2" />
              </motion.div>
            ) : (
              <motion.div
                key={`content-${stepIndex}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-auto px-8 pb-6">
          <ActionButtons
            onBack={onBack}
            onNext={onNext}
            nextLabel={nextLabel}
            nextState={nextState}
            backDisabled={backDisabled}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- StepLayout`
Expected: PASS

- [ ] **Step 9: Wire routing shell into App**

`src/App.tsx`:
```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'

export default function App() {
  return (
    <div data-testid="app-shell">
      <BrowserRouter>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/step-1" replace />} />
            {/* Step routes are added one-by-one in Tasks 10-16 */}
          </Routes>
        </BookingProvider>
      </BrowserRouter>
    </div>
  )
}
```

- [ ] **Step 10: Run the full test suite**

Run: `npm test`
Expected: PASS (all prior tasks' tests still green)

- [ ] **Step 11: Commit**

```bash
git add src/context/BookingContext.tsx src/context/BookingContext.test.tsx src/lib/simulateAsyncLoad.ts src/components/StepLayout.tsx src/components/StepLayout.test.tsx src/App.tsx
git commit -m "feat: add BookingContext, simulated async loading, StepLayout, and routing shell"
```

---

### Task 10: Screen 1 — Service intro (`/step-1`)

**Files:**
- Create: `src/screens/Step1.tsx`
- Modify: `src/App.tsx` (add route)
- Test: `src/screens/Step1.test.tsx`

**Interfaces:**
- Consumes: `StepLayout` (Task 9), `Button` (Task 3), `useBooking` (Task 9).
- Produces: `Step1` default export, routed at `/step-1`, navigates to `/step-2` on Next.

- [ ] **Step 1: Extract the Figma scaffold for cross-checking**

```bash
figma-cli export-jsx 1:2086 --out /tmp/figma-step1.tsx
figma-cli inspect 1:2116 --json
figma-cli inspect 1:2121 --json
```

Use the output to confirm: `Main Container` is a 1110×394 bordered card (`#E4E4E7`, radius 16) centered content, a 180×180 image placeholder, text container, and a primary `Buttons` instance (`#083035`) — read but do not commit `/tmp/figma-step1.tsx`, it is scratch reference only.

- [ ] **Step 2: Write the failing test**

`src/screens/Step1.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step1 from './Step1'

test('renders intro content and advances on Next click', async () => {
  render(
    <MemoryRouter initialEntries={['/step-1']}>
      <BookingProvider>
        <Step1 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByText(/create your first service/i)).toBeInTheDocument())
  await userEvent.click(screen.getByRole('button', { name: 'Get started' }))
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- Step1`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement Step1**

`src/screens/Step1.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export default function Step1() {
  const navigate = useNavigate()

  return (
    <StepLayout
      stepIndex={0}
      title="New service"
      description="Set up a bookable service in a few quick steps."
      onNext={() => navigate('/step-2')}
      nextLabel="Get started"
      backDisabled
    >
      <Card>
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="h-[180px] w-[180px] rounded-lg bg-brand-surfaceMuted" />
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium text-black">Create your first service</h2>
            <p className="max-w-md text-sm text-brand-textMuted">
              Tell us the basics, then add locations, coaches, durations, and pricing.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/step-2')}>
            Get started
          </Button>
        </div>
      </Card>
    </StepLayout>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Step1`
Expected: PASS

- [ ] **Step 6: Add the route**

In `src/App.tsx`, import `Step1` and add inside `<Routes>`:
```tsx
<Route path="/step-1" element={<Step1 />} />
```

- [ ] **Step 7: Visual verification against Figma**

```bash
figma-cli verify 1:2086 --out /tmp/figma-step1.png
npm run dev &
```
Open `http://localhost:5173/step-1` in the browser tool, screenshot it, and compare layout/spacing/colors against `/tmp/figma-step1.png`. Adjust Tailwind classes in `Step1.tsx` until they match, re-running `npm test -- Step1` after each change.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Step1.tsx src/screens/Step1.test.tsx src/App.tsx
git commit -m "feat: build Step1 (service intro) screen"
```

---

### Task 11: Screen 2 — Basic details + service image (`/step-2`)

**Files:**
- Create: `src/screens/Step2.tsx`
- Modify: `src/App.tsx` (add route)
- Test: `src/screens/Step2.test.tsx`

**Interfaces:**
- Consumes: `StepLayout`, `Card`, `Input`, `EmptyState`, `useBooking`.
- Produces: `Step2` default export routed at `/step-2`; reads/writes `serviceName`, `serviceDescription` via `useBooking()`; Back → `/step-1`, Next → `/step-3`.

- [ ] **Step 1: Extract and inspect the Figma scaffold**

```bash
figma-cli export-jsx 1:2122 --out /tmp/figma-step2.tsx
figma-cli inspect 1:2154 --json
figma-cli inspect 1:2163 --json
figma-cli inspect 1:3478 --json
```

Confirm: two side-by-side 547px cards ("Basic details section" and "Service image container"), plus the `Stepper` instance `1:3478` (use it only as a visual size reference — the actual `Stepper` component is Task 6's).

- [ ] **Step 2: Write the failing test**

`src/screens/Step2.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step2 from './Step2'

test('fills service name/description and shows an empty image placeholder', async () => {
  render(
    <MemoryRouter initialEntries={['/step-2']}>
      <BookingProvider>
        <Step2 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Service name')).toBeInTheDocument())
  expect(screen.getByText(/no image uploaded/i)).toBeInTheDocument()

  await userEvent.type(screen.getByLabelText('Service name'), 'Personal Training')
  expect(screen.getByLabelText('Service name')).toHaveValue('Personal Training')
})

test('shows an inline error when Next is clicked with an empty service name', async () => {
  render(
    <MemoryRouter initialEntries={['/step-2']}>
      <BookingProvider>
        <Step2 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => screen.getByRole('button', { name: 'Next' }))
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByText('Service name is required')).toBeInTheDocument()
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- Step2`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement Step2**

`src/screens/Step2.tsx`:
```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { EmptyState } from '../components/EmptyState'
import { useBooking } from '../context/BookingContext'

export default function Step2() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()
  const [error, setError] = useState<string | undefined>()

  function handleNext() {
    if (!data.serviceName.trim()) {
      setError('Service name is required')
      return
    }
    setError(undefined)
    navigate('/step-3')
  }

  return (
    <StepLayout
      stepIndex={1}
      title="Basic details"
      description="Give your service a name and description."
      onBack={() => navigate('/step-1')}
      onNext={handleNext}
    >
      <div className="flex gap-4">
        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label="Service name"
              value={data.serviceName}
              onChange={(v) => updateField('serviceName', v)}
              error={error}
              placeholder="e.g. Personal Training"
            />
            <Input
              label="Description"
              value={data.serviceDescription}
              onChange={(v) => updateField('serviceDescription', v)}
              placeholder="What does this service include?"
            />
          </div>
        </Card>
        <Card>
          <EmptyState label="No image uploaded yet" actionLabel="Upload image" onAction={() => {}} />
        </Card>
      </div>
    </StepLayout>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- Step2`
Expected: PASS

- [ ] **Step 6: Add the route**

In `src/App.tsx`: `<Route path="/step-2" element={<Step2 />} />`

- [ ] **Step 7: Visual verification against Figma**

```bash
figma-cli verify 1:2122 --out /tmp/figma-step2.png
```
Compare `http://localhost:5173/step-2` against `/tmp/figma-step2.png`; adjust spacing/column widths until matched, re-running `npm test -- Step2` after each change.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Step2.tsx src/screens/Step2.test.tsx src/App.tsx
git commit -m "feat: build Step2 (basic details + service image) screen"
```

---

### Task 12: Screen 3 — Basic details variant (`/step-3`)

**Files:**
- Create: `src/screens/Step3.tsx`
- Modify: `src/App.tsx` (add route)
- Test: `src/screens/Step3.test.tsx`

**Interfaces:**
- Consumes: `StepLayout`, `Card`, `Input`, `useBooking`.
- Produces: `Step3` default export routed at `/step-3`; Back → `/step-2`, Next → `/step-4`.

- [ ] **Step 1: Extract and inspect the Figma scaffold**

```bash
figma-cli export-jsx 1:2172 --out /tmp/figma-step3.tsx
figma-cli inspect 1:2204 --json
figma-cli inspect 1:2213 --json
```

Confirm this screen mirrors Step 2's two-card layout but with a taller (601px) service image container — treat any additional visible fields as extra `Input`s inside the left card.

- [ ] **Step 2: Write the failing test**

`src/screens/Step3.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step3 from './Step3'

test('renders and navigates back and forward', async () => {
  render(
    <MemoryRouter initialEntries={['/step-3']}>
      <BookingProvider>
        <Step3 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => screen.getByRole('button', { name: 'Back' }))
  expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- Step3`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement Step3**

`src/screens/Step3.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step3() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={1}
      title="Basic details"
      description="Confirm the details customers will see."
      onBack={() => navigate('/step-2')}
      onNext={() => navigate('/step-4')}
    >
      <div className="flex gap-4">
        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label="Service name"
              value={data.serviceName}
              onChange={(v) => updateField('serviceName', v)}
            />
            <Input
              label="Description"
              value={data.serviceDescription}
              onChange={(v) => updateField('serviceDescription', v)}
            />
          </div>
        </Card>
        <Card>
          <div className="h-[455px] w-full rounded-lg bg-brand-surfaceMuted" />
        </Card>
      </div>
    </StepLayout>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Step3`
Expected: PASS

- [ ] **Step 6: Add the route**

In `src/App.tsx`: `<Route path="/step-3" element={<Step3 />} />`

- [ ] **Step 7: Visual verification against Figma**

```bash
figma-cli verify 1:2172 --out /tmp/figma-step3.png
```
Compare `http://localhost:5173/step-3` against `/tmp/figma-step3.png`; adjust until matched, re-running `npm test -- Step3` after each change.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Step3.tsx src/screens/Step3.test.tsx src/App.tsx
git commit -m "feat: build Step3 (basic details variant) screen"
```

---

### Task 13: Screen 4 — Locations & coaches (`/step-4`)

**Files:**
- Create: `src/screens/Step4.tsx`
- Modify: `src/App.tsx` (add route)
- Test: `src/screens/Step4.test.tsx`

**Interfaces:**
- Consumes: `StepLayout`, `Card`, `Input`, `useBooking`.
- Produces: `Step4` default export routed at `/step-4`; reads/writes `location`, `coach`; Back → `/step-3`, Next → `/step-5`.

- [ ] **Step 1: Extract and inspect the Figma scaffold**

```bash
figma-cli export-jsx 1:2225 --out /tmp/figma-step4.tsx
figma-cli inspect 1:2257 --json
figma-cli inspect 1:2361 --json
```

Confirm the header text is "Locations & coaches" / "Choose where this service is offered and…" (node `1:2361`/`1:2362`/`1:2363`), and the body is a single full-width (1110px) bordered card.

- [ ] **Step 2: Write the failing test**

`src/screens/Step4.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider } from '../context/BookingContext'
import Step4 from './Step4'

test('renders locations and coaches fields', async () => {
  render(
    <MemoryRouter initialEntries={['/step-4']}>
      <BookingProvider>
        <Step4 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Location')).toBeInTheDocument())
  expect(screen.getByLabelText('Coach')).toBeInTheDocument()
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- Step4`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement Step4**

`src/screens/Step4.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step4() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={2}
      title="Locations & coaches"
      description="Choose where this service is offered and who runs it."
      onBack={() => navigate('/step-3')}
      onNext={() => navigate('/step-5')}
    >
      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Location" value={data.location} onChange={(v) => updateField('location', v)} placeholder="e.g. Downtown Studio" />
          <Input label="Coach" value={data.coach} onChange={(v) => updateField('coach', v)} placeholder="e.g. Jamie Lee" />
        </div>
      </Card>
    </StepLayout>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Step4`
Expected: PASS

- [ ] **Step 6: Add the route**

In `src/App.tsx`: `<Route path="/step-4" element={<Step4 />} />`

- [ ] **Step 7: Visual verification against Figma**

```bash
figma-cli verify 1:2225 --out /tmp/figma-step4.png
```
Compare `http://localhost:5173/step-4` against `/tmp/figma-step4.png`; adjust until matched, re-running `npm test -- Step4` after each change.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Step4.tsx src/screens/Step4.test.tsx src/App.tsx
git commit -m "feat: build Step4 (locations & coaches) screen"
```

---

### Task 14: Screen 5 — Bookable durations & settings (`/step-5`)

**Files:**
- Create: `src/screens/Step5.tsx`
- Modify: `src/App.tsx` (add route)
- Test: `src/screens/Step5.test.tsx`

**Interfaces:**
- Consumes: `StepLayout`, `Card`, `Input`, `useBooking`.
- Produces: `Step5` default export routed at `/step-5`; reads/writes `duration`; Back → `/step-4`, Next → `/step-6`.

- [ ] **Step 1: Extract and inspect the Figma scaffold**

```bash
figma-cli export-jsx 1:2364 --out /tmp/figma-step5.tsx
figma-cli inspect 1:2396 --json
figma-cli inspect 1:2399 --json
```

Confirm "Section header" (1:2396) is the title/description block and "Bookable durations & settings" (1:2399) is a row of duration option cards.

- [ ] **Step 2: Write the failing test**

`src/screens/Step5.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider } from '../context/BookingContext'
import Step5 from './Step5'

test('renders duration field', async () => {
  render(
    <MemoryRouter initialEntries={['/step-5']}>
      <BookingProvider>
        <Step5 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument())
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- Step5`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement Step5**

`src/screens/Step5.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step5() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={3}
      title="Bookable durations & settings"
      description="Set how long each session runs."
      onBack={() => navigate('/step-4')}
      onNext={() => navigate('/step-6')}
    >
      <Card>
        <Input
          label="Duration (minutes)"
          value={data.duration}
          onChange={(v) => updateField('duration', v)}
          placeholder="e.g. 60"
        />
      </Card>
    </StepLayout>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Step5`
Expected: PASS

- [ ] **Step 6: Add the route**

In `src/App.tsx`: `<Route path="/step-5" element={<Step5 />} />`

- [ ] **Step 7: Visual verification against Figma**

```bash
figma-cli verify 1:2364 --out /tmp/figma-step5.png
```
Compare `http://localhost:5173/step-5` against `/tmp/figma-step5.png`; adjust until matched, re-running `npm test -- Step5` after each change.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Step5.tsx src/screens/Step5.test.tsx src/App.tsx
git commit -m "feat: build Step5 (bookable durations & settings) screen"
```

---

### Task 15: Screen 6 — Pricing & payment method (`/step-6`)

**Files:**
- Create: `src/screens/Step6.tsx`
- Modify: `src/App.tsx` (add route)
- Test: `src/screens/Step6.test.tsx`

**Interfaces:**
- Consumes: `StepLayout`, `Card`, `Input`, `useBooking`.
- Produces: `Step6` default export routed at `/step-6`; reads/writes `price`, `paymentMethod`; Back → `/step-5`, Next → `/step-7`.

- [ ] **Step 1: Extract and inspect the Figma scaffold**

```bash
figma-cli export-jsx 1:2439 --out /tmp/figma-step6.tsx
figma-cli inspect 1:2488 --json
figma-cli inspect 1:2492 --json
figma-cli inspect 1:2510 --json
```

Confirm header text "Pricing" / "Set one base price, then add rules for t…" (1:2489/1:2490), a "Time-based price rules" card (1:2492), and a "Payment Method" card (1:2510).

- [ ] **Step 2: Write the failing test**

`src/screens/Step6.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider } from '../context/BookingContext'
import Step6 from './Step6'

test('renders price and payment method fields', async () => {
  render(
    <MemoryRouter initialEntries={['/step-6']}>
      <BookingProvider>
        <Step6 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Base price')).toBeInTheDocument())
  expect(screen.getByLabelText('Payment method')).toBeInTheDocument()
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- Step6`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement Step6**

`src/screens/Step6.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step6() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={4}
      title="Pricing"
      description="Set one base price, then add rules for time-based pricing."
      onBack={() => navigate('/step-5')}
      onNext={() => navigate('/step-7')}
    >
      <div className="flex flex-col gap-4">
        <Card>
          <Input label="Base price" value={data.price} onChange={(v) => updateField('price', v)} placeholder="e.g. 50" />
        </Card>
        <Card>
          <Input
            label="Payment method"
            value={data.paymentMethod}
            onChange={(v) => updateField('paymentMethod', v)}
            placeholder="e.g. Card on file"
          />
        </Card>
      </div>
    </StepLayout>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Step6`
Expected: PASS

- [ ] **Step 6: Add the route**

In `src/App.tsx`: `<Route path="/step-6" element={<Step6 />} />`

- [ ] **Step 7: Visual verification against Figma**

```bash
figma-cli verify 1:2439 --out /tmp/figma-step6.png
```
Compare `http://localhost:5173/step-6` against `/tmp/figma-step6.png`; adjust until matched, re-running `npm test -- Step6` after each change.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Step6.tsx src/screens/Step6.test.tsx src/App.tsx
git commit -m "feat: build Step6 (pricing & payment method) screen"
```

---

### Task 16: Screen 7 — Review + success confirmation (`/step-7`)

**Files:**
- Create: `src/screens/Step7.tsx`
- Modify: `src/App.tsx` (add route)
- Test: `src/screens/Step7.test.tsx`

**Interfaces:**
- Consumes: `StepLayout`, `ErrorBanner`, `useBooking`.
- Produces: `Step7` default export routed at `/step-7`; renders a read-only review of all `BookingData` fields; clicking "Publish" (the Next button, relabeled) sets `nextState="loading"`, simulates a submit via `simulateAsyncLoad`, then replaces the review body with a success confirmation panel; Back → `/step-6`.

- [ ] **Step 1: Extract and inspect the Figma scaffold**

```bash
figma-cli export-jsx 1:2522 --out /tmp/figma-step7.tsx
figma-cli inspect 1:2560 --json
```

Confirm header "Review this is what customers will see" / "Check the booking page preview on the ri…" (1:2558/1:2559), and a "Details container" (1:2560) with 7 label/value line rows separated by `#E4E4E7` divider lines (Service, Locations, Coaches, Durations, Start times, Pricing, Payment).

- [ ] **Step 2: Write the failing tests**

`src/screens/Step7.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step7 from './Step7'

test('renders a read-only review of booking data', async () => {
  render(
    <MemoryRouter initialEntries={['/step-7']}>
      <BookingProvider>
        <Step7 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByText('Service')).toBeInTheDocument())
  expect(screen.getByText('Payment')).toBeInTheDocument()
})

test('publishing shows a loading state then a success confirmation', async () => {
  render(
    <MemoryRouter initialEntries={['/step-7']}>
      <BookingProvider>
        <Step7 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => screen.getByRole('button', { name: 'Publish' }))
  await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
  expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()

  await waitFor(() => expect(screen.getByText(/service published/i)).toBeInTheDocument())
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- Step7`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement Step7**

`src/screens/Step7.tsx`:
```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { ErrorBanner } from '../components/ErrorBanner'
import { useBooking } from '../context/BookingContext'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

const REVIEW_ROWS: { label: string; key: keyof ReturnType<typeof useBooking>['data'] }[] = [
  { label: 'Service', key: 'serviceName' },
  { label: 'Locations', key: 'location' },
  { label: 'Coaches', key: 'coach' },
  { label: 'Durations', key: 'duration' },
  { label: 'Pricing', key: 'price' },
  { label: 'Payment', key: 'paymentMethod' },
]

export default function Step7() {
  const navigate = useNavigate()
  const { data } = useBooking()
  const [status, setStatus] = useState<'idle' | 'publishing' | 'error' | 'success'>('idle')

  async function handlePublish() {
    setStatus('publishing')
    try {
      await simulateAsyncLoad(600)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <StepLayout stepIndex={6} title="Review" description="Your service is live." onNext={() => {}} backDisabled>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-lg font-medium text-black">Service published</span>
              <p className="text-sm text-brand-textMuted">Customers can now book "{data.serviceName || 'this service'}".</p>
            </div>
          </Card>
        </motion.div>
      </StepLayout>
    )
  }

  return (
    <StepLayout
      stepIndex={6}
      title="Review"
      description="Check the booking page preview on the right before publishing."
      onBack={() => navigate('/step-6')}
      onNext={handlePublish}
      nextLabel="Publish"
      nextState={status === 'publishing' ? 'loading' : 'default'}
    >
      <div className="flex flex-col gap-4">
        {status === 'error' && <ErrorBanner message="Publishing failed. Please try again." />}
        <Card>
          <dl className="flex flex-col divide-y divide-brand-border">
            {REVIEW_ROWS.map((row) => (
              <div key={row.key} className="flex items-center justify-between py-3">
                <dt className="text-sm text-brand-textMuted">{row.label}</dt>
                <dd className="text-sm text-black">{data[row.key] || '—'}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </StepLayout>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- Step7`
Expected: PASS

- [ ] **Step 6: Add the route**

In `src/App.tsx`: `<Route path="/step-7" element={<Step7 />} />`

- [ ] **Step 7: Visual verification against Figma**

```bash
figma-cli verify 1:2522 --out /tmp/figma-step7.png
```
Compare `http://localhost:5173/step-7` (review state) against `/tmp/figma-step7.png`; adjust until matched, re-running `npm test -- Step7` after each change. The success confirmation panel has no Figma source — verify only that it's legible and consistent with the app's visual language.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Step7.tsx src/screens/Step7.test.tsx src/App.tsx
git commit -m "feat: build Step7 (review) screen with publish loading and success confirmation states"
```

---

### Task 17: Full-flow integration test and final verification pass

**Files:**
- Test: `src/App.test.tsx` (extend)

**Interfaces:**
- Consumes: the full routed `App` from Task 9 and all seven screens.
- Produces: no new production code — a regression test asserting the complete Step 1 → Step 7 journey, plus a manual visual sweep.

- [ ] **Step 1: Write the failing integration test**

Add to `src/App.test.tsx`:
```tsx
test('walks the full booking flow from step 1 to a published confirmation', async () => {
  render(<App />)

  await waitFor(() => screen.getByRole('button', { name: 'Get started' }))
  await userEvent.click(screen.getByRole('button', { name: 'Get started' }))

  await waitFor(() => screen.getByLabelText('Service name'))
  await userEvent.type(screen.getByLabelText('Service name'), 'Personal Training')
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))

  await waitFor(() => screen.getByRole('button', { name: 'Next' }))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 3 -> 4

  await waitFor(() => screen.getByLabelText('Location'))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 4 -> 5

  await waitFor(() => screen.getByLabelText('Duration (minutes)'))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 5 -> 6

  await waitFor(() => screen.getByLabelText('Base price'))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 6 -> 7

  await waitFor(() => screen.getByRole('button', { name: 'Publish' }))
  await userEvent.click(screen.getByRole('button', { name: 'Publish' }))

  await waitFor(() => expect(screen.getByText(/service published/i)).toBeInTheDocument())
})
```

Add the needed imports at the top of `src/App.test.tsx`: `import userEvent from '@testing-library/user-event'` and `import { waitFor } from '@testing-library/react'` (extend the existing `@testing-library/react` import).

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- App`
Expected: FAIL if any route is missing or a label text doesn't match — fix the mismatch in the relevant screen/route, not the test.

- [ ] **Step 3: Run the full suite until the integration test passes**

Run: `npm test`
Expected: PASS — all component, context, and screen tests plus this integration test are green.

- [ ] **Step 4: Manual full-flow visual sweep**

```bash
npm run dev &
```
Using the browser tool, walk `/step-1` through `/step-7` clicking Next each time, confirming: the Stepper advances and highlights correctly, the fade/slide page transition plays between steps, Back is disabled only on step 1, and the Publish button shows its loading spinner before the success confirmation renders. Screenshot each step against the earlier `figma-cli verify` PNGs saved in Tasks 10–16 for a final side-by-side check.

- [ ] **Step 5: Commit**

```bash
git add src/App.test.tsx
git commit -m "test: add full booking flow integration test"
```
