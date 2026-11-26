# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is an interactive wedding invitation website (Aline & Alan) built with **React 19**, **TanStack Start/Router**, **Vite 7**, **Tailwind CSS 4**, and **Framer Motion**. It is a fully static client-side SPA with no backend or database. Deployment target is Cloudflare Workers.

### Prerequisites

- **Node.js >= 22.12.0** (required by `@tanstack/react-start`). Install via NodeSource `setup_22.x`.
- Package manager: **npm** (lockfile: `package-lock.json`).

### Common commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (Vite on port 8080) |
| Lint | `npm run lint` (ESLint + Prettier) |
| Format | `npm run format` (Prettier write) |
| Build | `npm run build` |
| Preview | `npm run preview` |

### Notes

- The dev server binds to port **8080** (configured by `@lovable.dev/vite-tanstack-config`), not the default 5173.
- ESLint will report pre-existing Prettier formatting errors in the codebase; these are cosmetic and do not block the dev server or build.
- There are no automated tests configured in this project (no test runner or test scripts).
- `vite.config.ts` uses `@lovable.dev/vite-tanstack-config` which bundles all necessary Vite plugins (TanStack Start, React, Tailwind, Cloudflare, etc.) — do not add duplicate plugins.
- The `wrangler.jsonc` config is for Cloudflare Workers deployment only; local dev uses `npm run dev` without Wrangler.
- Google Fonts are loaded from CDN at runtime; they may not render in environments without internet access.

- RSVP data is written only through server functions calling SECURITY DEFINER RPCs (save_rsvp/get_rsvp) restricted to service_role; guests table has RLS with no client policies because guests are anonymous.
- Anonymous RSVP and gift access use an HttpOnly browser capability checked against a database hash; a guest ID or name alone must never authorize private reads or gift changes.
- Gift selection replacements run in one service-role RPC transaction and preserve paid rows and pending price snapshots so future payment processing can trust them.
- Gift seed data lives in a client-safe catalog and an idempotent SQL-generating script; local illustrations live in public/gifts to keep the catalog independent of external media.
