

## Plan: Eliminate horizontal scrolling on mobile

### Problem
Content overflows horizontally on mobile (iPhone 16 Pro, 402pt), causing unwanted horizontal scroll.

### Changes

**1. `src/index.css` — Add global overflow-x protection**
- Add `overflow-x: hidden` to `html` and `body` in the base layer to prevent any horizontal scroll globally.

**2. `src/components/AppLayout.tsx` — Add overflow-x-hidden to layout**
- Add `overflow-x-hidden` to the root div and main element to contain any child overflow.

**3. `src/pages/MisRecetas.tsx` — Fix header overflow**
- On mobile, hide text labels on "Exportar" and "Importar" buttons (show only icons). Keep "+ Nueva" with text.
- Add `min-w-0` to the title container to allow text truncation if needed.

These 3 changes together ensure no content can cause horizontal scroll on any mobile screen.

