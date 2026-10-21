# Schema Blueprint — Profiles Table

## Overview

The `public.profiles` table stores user metadata, billing tier, and platform role information. This document defines the canonical column ordering for optimal query performance and conceptual clarity.

## Profiles Table — Column Layout (Left to Right)

### Identity & Contact (High-Frequency Lookups)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `id` | `uuid` | NO | Primary key, foreign key from `auth.users` |
| `display_name` | `text` | YES | User's chosen display name (fallback: email prefix) |
| `email` | `text` | YES | User's email, synced from `auth.users` via trigger |

### Billing & Access Control (Dashboard Load)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `plan` | `text` | YES | Stripe plan identifier (`single-venue`, `multi-venue`, etc.) |
| `tier` | `text` | YES | Internal billing tier (`free`, `pro`, `venue_single`, `venue_multi`) |
| `subscription_active` | `boolean` | YES | Subscription status (null = never billed, false = lapsed, true = active) |
| `stripe_customer_id` | `text` | YES | Stripe customer ID for billing reconciliation |

### Platform Role & Permissions (Auth)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `platform_role` | `text` | YES | User's role (`staff`, `venue_manager`, `multi_venue_manager`, `admin`) |

### Metadata & Audit (Rarely Queried)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `created_at` | `timestamp with time zone` | YES | Account creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | Last profile update |

## Design Rationale

### Left-to-Right Ordering

1. **Identity First** — `id`, `display_name`, `email` are the canonical user identifier and contact info. These are the first things referenced in any user context.

2. **Billing Second** — `plan`, `tier`, `subscription_active`, `stripe_customer_id` follow immediately. The dashboard's tier access control (lib/session.ts) checks these columns on every page load, making them the most frequently accessed after identity.

3. **Permissions Third** — `platform_role` is checked in auth middleware but accessed less frequently than billing status.

4. **Metadata Last** — `created_at`, `updated_at` are auditing columns used rarely.

### Performance Implications

- **Hot columns** (id, plan, tier, subscription_active) are contiguous in memory, reducing cache misses in hot paths.
- The `email` column is synced via trigger from `auth.users`, eliminating the need for joins to auth tables during permission checks.
- **Not indexed separately** — these columns are primarily accessed by `id` (primary key) or used in RLS policies that don't require additional indexes.

## Query Patterns

### Dashboard Permission Check (Most Common)

```sql
SELECT id, plan, tier, subscription_active, platform_role
FROM profiles
WHERE id = $1  -- PK lookup
```

### User Display (Frequent)

```sql
SELECT id, display_name, email, platform_role
FROM profiles
WHERE id = $1
```

### Billing State Machine (Webhook)

```sql
UPDATE profiles
SET plan = $1, tier = $2, subscription_active = $3, stripe_customer_id = $4
WHERE id = $5
```

## Migration History

- **20260629_profiles_email_and_cleanup.sql** — Added `email` column, created sync trigger, dropped dead columns (`avatar_url`, `is_founding_user`)
- Previous — profiles table initially created by Supabase Auth

## RLS Policies

- **profiles_select_own** — Authenticated users can SELECT their own row only
- **profiles_update_own** — Authenticated users can UPDATE their own row only
