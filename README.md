# Video Editor Portfolio

Single-page portfolio/sales site for a freelance video editor specializing in
talking-head content for long-form YouTube.

## Stack

- Vite + React
- Tailwind CSS v4 (CSS-first theme tokens in `src/index.css`)
- Framer Motion for animations
- Lightweight in-house i18n (EN / PL) — `src/i18n/`

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Structure

- `src/index.css` — the entire design system as Tailwind theme tokens (colors, glows, radii). No raw hex values in components.
- `src/i18n/translations.js` — every user-facing string, keyed by section, in `en` and `pl`.
- `src/i18n/LanguageContext.jsx` — `useLanguage()` context with `t()` lookup, localStorage persistence, dynamic `<html lang>`.
- `src/components/` — background canvas (horizon arc + cursor glow), floating nav, EN/PL toggle, shared UI.
- `src/sections/` — Splash, Hero, Portfolio, BeforeAfter, Testimonials, About, Contact, Footer.
