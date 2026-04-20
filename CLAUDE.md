# Serve By Example — Project Rules for Claude

## Security — Read These First

- **NEVER read `.env.local` or any `.env*` file.** These contain live production secrets (OpenAI API key, Supabase service role key, Stripe secret key).
- **NEVER print, log, or suggest hardcoding** any API key, secret, or credential.
- All secrets are managed in Cloudflare Pages environment variables. Reference variable names only (e.g. `process.env.OPENAI_API_KEY`).
- If a config change requires a secret value, ask the user to provide it directly — do not read it from any file.

## Project Overview

Serve By Example is an AI-powered hospitality staff training platform.
- Framework: Next.js (App Router) deployed on Cloudflare Pages via OpenNext
- Database: Supabase (Postgres + RLS + Auth)
- AI: OpenAI GPT-4o-mini (evaluation, coaching, translation)
- Payments: Stripe

## Key Architecture

- `app/` — Next.js App Router pages and API routes
- `components/learning-engine/` — 4-Stage Mastery Path (Stages 1–4)
- `components/mission-control/` — Manager Control Center
- `components/knowledge-base/` — Cocktail Library and 101 Knowledge Base
- `components/ui/` — Shared UI primitives
- `lib/mastery.ts` — Mastery engine (ELO, spaced repetition, confidence tracking)
- `lib/session.ts` — Session displacement and tier access control
- `lib/scaffolded-questions.ts` — Stage 1–3 question banks
- `supabase/` — SQL schema migration files

## Coding Conventions

- TypeScript throughout — no `any` unless unavoidable
- Tailwind for styling with custom CSS in `app/globals.css`
- Server components fetch data; client components handle interaction
- API routes validate input at the boundary before any DB access
- Rate limiting applied to all public-facing API routes
