# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Transubtil Record — a music label website with React frontend (Vite + TypeScript) and Node.js/Express backend. Features studio booking, artist profiles, music releases, file management via SFTP (o2switch), and Supabase for auth/database.

## Commands

Package manager / script runner: **Bun** (`bun.lock`). Vite remains the bundler.

- `bun run dev` — Vite dev server (frontend only, proxies `/api` to port 8788)
- `bun run build` — Production build into `dist/`: client build, SSR build of `src/entry-server.tsx`, then `scripts/prerender.ts` (static HTML per public route + `sitemap.xml` + `llms.txt`)
- `bun run preview` — Preview production build
- `bun run dev:api` — Build, then serve `dist/` + Cloudflare Pages Functions + local D1 via wrangler (port 8788)
- `bun run db:migrate:local` / `db:migrate:remote` — Apply `db/migrations/` to D1
- `bun run deploy` — Build and deploy a preview of the current git branch to Cloudflare Pages
- `bun run deploy:prod` — Build and deploy to production (Pages production branch: `main`)
- `bun run newsletter <newsletters/file.md> [--preview | --test email | --send]` — branded Resend broadcast from a Markdown file (draft by default; see `newsletters/_example.md`)
- `bun run newsletter:releases [--dry-run | --send | --mark-all]` — broadcast for each release in `src/data/releases.ts` not yet in D1 `announced_releases` (draft unless `--send` or `NEWSLETTER_AUTO_SEND=true` in `.dev.vars`). Needs the full-access `RESEND_API_KEY` in `.dev.vars`
- Legacy Express backend (studio/auth, feature-flagged off): `bun run dev:server`, `bun run server`

No test runner or linter is configured. Typecheck with `bunx tsc --noEmit -p tsconfig.json` (app) and `bunx tsc --noEmit -p functions/tsconfig.json` (Pages Functions).

## Feature flags

`src/config/features.ts`: `VITE_FEATURE_STUDIO` and `VITE_FEATURE_AUTH` (off unless `"true"`) gate the studio, auth, dashboard and admin routes and UI. When auth is off, `AuthProvider` never calls Supabase.

## SEO

- Every public page renders `<Seo>` (`src/components/site/Seo.tsx`): title, description, canonical, Open Graph/Twitter, schema.org JSON-LD from `src/lib/structuredData.ts`. Site URL in `src/config/seo.ts`.
- Pages are prerendered at build time so crawlers that don't run JS (AI assistants) get full HTML. New public routes must be added to `routes` in `src/entry-server.tsx`. Prerendered files are written as `route.html` (Cloudflare Pages serves them without a trailing-slash redirect).
- `HelmetProvider` lives in `main.tsx` / `entry-server.tsx`, not in `App`. Code that touches `window`/`document` must stay inside effects (the app is rendered with `renderToString`).
- `public/robots.txt` explicitly allows AI crawlers; `public/og-default.jpg` is the default social preview.

## Cloudflare (v2 target)

- `wrangler.toml`: Pages build output `dist/`, D1 binding `DB` (`transubtil-db`)
- `functions/api/*` — Pages Functions; shared `Env` type in `cf/env.ts`
- `db/migrations/` — D1 (SQLite) schema: `subscribers`, `submissions`

## Architecture

### Frontend (src/)
- **React 18 + TypeScript + Vite** with SWC compiler
- **Routing**: React Router v6 in `App.tsx`. Public routes (`/`, `/artists`, `/releases`, `/studio`, `/about`) and protected routes (`/dashboard`, `/studio/request`, `/admin/*`). `ProtectedRoute` component handles auth gating with optional `requireAdmin` prop.
- **Auth**: Supabase auth via `AuthContext` (`src/contexts/AuthContext.tsx`). Provides `useAuth()` hook with user, profile, session, role booleans (`isAdmin`, `isArtist`).
- **Data**: Artists and releases are hardcoded in `src/data/`. Database-driven data (studio requests, submissions, bookings, notifications, share links) comes from Supabase.
- **Styling**: Tailwind CSS with custom brand palette (`brand-900`, `brand-700`, `brand-500`, `brand-300`, `brand-acid`) and custom fonts (Acumin Variable, Eras ITC). Animations via framer-motion.
- **Types**: Shared interfaces in `src/types/` (release, artist, studio, nextcloud).

### Backend (server/)
- **Express 5** on port 3001
- `server/index.ts` — Entry point, file upload endpoint (`POST /api/upload`)
- `server/admin-storage.ts` — Admin file management routes (SFTP operations)
- `server/share-routes.ts` + `server/file-sharing.ts` — Token-based file sharing with password/download limits
- **SFTP**: Singleton pattern via `O2SwitchStorage.getInstance()` in `src/lib/sftp.ts`, stores files on o2switch at `/home/faji2535/admin-files/`

### Key Patterns
- File uploads use XHR with progress tracking (95% client-side, 5% reserved for server SFTP transfer) in `src/lib/upload-service.ts`
- Supabase service role key used server-side to bypass RLS for admin operations
- Landing page (`/`) renders fullscreen without the standard Layout wrapper

## Environment Variables

Frontend (prefixed `VITE_`):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Backend (in `.env`):
- Supabase credentials, SFTP/FTP connection details
