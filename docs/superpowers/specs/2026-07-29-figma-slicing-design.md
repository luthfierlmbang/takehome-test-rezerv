# Rezerv Home Test — Figma Slicing Design

## Goal

Slice all 7 screens of the "Rezerv Home Test" Figma file (`8Ea5h7hI3OqcVCRGGhYR0w`) into a pixel-perfect (1:1) React app, fill in missing interaction/UI states, and add motion/animation.

Figma node tree (top-level screens):
- Screen 01 (1:2086) — service intro / landing step
- Screen 02 (1:2122) — basic details + service image
- Screen 03 (1:2172) — basic details + service image (variant)
- Screen 04 (1:2225)
- Screen 05 (1:2364)
- Screen 06 (1:2439)
- Screen 07 (1:2522) — final step, becomes confirmation/success screen

All screens share: `Navigation barTertiary` (sidebar nav), `Breadcrumb group`, `Stepper`, `Page header Description`, `Action buttons` (Back/Next footer).

## Stack

- Vite + React + TypeScript + Tailwind CSS
- React Router (routes `/step-1` … `/step-7`)
- Framer Motion (page transitions + micro-interactions)
- Single `BookingContext` holds form state across steps so Back/Next preserves user input

## Folder structure

```
src/
  components/   # Navbar, Button, Breadcrumb, Stepper, Card, Input, PageHeader, ActionButtons
  screens/      # Step1..Step7, one route each
  context/      # BookingContext (form state + navigation)
  lib/          # validation helpers
  styles/       # tailwind config + design tokens extracted from Figma (color, radius, spacing)
```

## Shared components (built once, reused across screens)

- `Navbar` (sidebar + Navbar Card)
- `Breadcrumb` / `BreadcrumbGroup`
- `Stepper` (progress indicator for steps 1–7)
- `Button` (variant prop: primary `#083035`, secondary outline `#E4E4E7`, etc.)
- `PageHeader` (title + description block per step)
- `ActionButtons` (Back/Next footer bar)
- `Card` (bordered container, `#E4E4E7` stroke, 16px radius)

## States to add (not fully present in the static Figma design)

- **Button**: default / hover / active(pressed) / disabled / loading (spinner)
- **Input/form field**: empty / focus / filled / error (with message) / disabled
- **Stepper**: current / completed / upcoming step visuals
- **Loading**: skeleton on initial data load per screen (simulated async)
- **Empty state**: for unfilled image/service fields
- **Validation/error**: inline field errors + error banner/toast on failed submit
- **Success/confirmation**: Screen 07 becomes a confirmation page shown after successful submit

## Motion scope (micro-interactions + page transitions)

- Button: hover/tap scale + opacity feedback
- Input: border-color transition on focus/error
- Page transition between steps: fade + horizontal slide, direction based on Next vs Back
- Stepper: animated progress/step-indicator transition
- Loading: spinner / skeleton shimmer

## Build process (per screen/component)

1. `figma-cli export-jsx` on the target node → JSX/Tailwind scaffold
2. Cross-check against `figma-cli inspect` / `get` (position, color, spacing, typography) for pixel accuracy
3. Wire up states, context, motion
4. `figma-cli verify` screenshot vs. dev-server screenshot, compare before moving to the next screen

## Out of scope

- Backend/API integration (all data is local/simulated)
- Screens or components not present in the Figma file
- Design changes beyond adding the agreed-upon missing states
