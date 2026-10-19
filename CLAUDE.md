# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Transubtil Record — a music label website with React frontend (Vite + TypeScript) and Node.js/Express backend. Features studio booking, artist profiles, music releases, file management via SFTP (o2switch), and Supabase for auth/database.

## Commands

Package manager / script runner: **Bun** (`bun.lock`). Vite remains the bundler.

- `bun run dev` — Vite dev server (frontend only, proxies `/api` to port 8788)
- `bun run build` — Production build (Vite) into `dist/`
- `bun run preview` — Preview production build
- `bun run dev:api` — Build, then serve `dist/` + Cloudflare Pages Functions + local D1 via wrangler (port 8788)
- `bun run db:migrate:local` / `db:migrate:remote` — Apply `db/migrations/` to D1
- `bun run deploy` — Build and deploy to Cloudflare Pages
- Legacy Express backend (studio/auth, feature-flagged off): `bun run dev:server`, `bun run server`

No test runner or linter is configured. Typecheck with `bunx tsc --noEmit -p tsconfig.json` (app) and `bunx tsc --noEmit -p functions/tsconfig.json` (Pages Functions).

## Feature flags

`src/config/features.ts`: `VITE_FEATURE_STUDIO` and `VITE_FEATURE_AUTH` (off unless `"true"`) gate the studio, auth, dashboard and admin routes and UI. When auth is off, `AuthProvider` never calls Supabase.

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
