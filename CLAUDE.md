# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NatuVital — a platform for managing, exchanging, and leveraging organic waste (Residuos Orgánicos Aprovechables / R.O.A). Connects waste generators, transformers, and consumers in a circular economy ecosystem. All UI text is in Spanish.

## Commands

```bash
bun run dev              # Dev server at localhost:8080
bun run build            # Production build → dist/
bun run deploy           # Build + deploy to Cloudflare Pages (production)
bun run deploy:preview   # Build + deploy to preview environment
bun run deploy:status    # List Cloudflare deployments
bun run lint             # ESLint
bun run preview          # Preview production build locally
```

No test framework is configured.

## Architecture

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Cloudflare Pages

**Entry point**: `src/main.tsx` → `src/App.tsx` (routing via React Router v6)

### Key architectural decisions

- **UI components**: shadcn-ui (Radix primitives + Tailwind) in `src/components/ui/`. Do not modify these directly.
- **State management**: React Query (TanStack Query v5) for server state. No Redux/Zustand.
- **Data access**: All Supabase operations go through custom hooks in `src/hooks/` — never call `supabase.from()` directly in components.
- **Auth**: `useAuth()` hook wraps Supabase Auth. Protected routes via `<ProtectedRoute>`.
- **Admin**: `useAdmin()` is the single source of truth for admin data. Child components (ProductosManagement, LotesManagement, UsersManagement) receive `deleteEntity`, `updateEntityStatus`, `deleteUserCompletely` as **props** — they must NOT call `useAdmin()` themselves (causes duplicate state instances with empty arrays).
- **Forms**: React Hook Form + Zod for validation.
- **Notifications**: Sonner toasts via `toast()` from `@/hooks/use-toast`.
- **Path alias**: `@/` maps to `src/`.

### Data flow

```
Pages (src/pages/)
  → Components (src/components/{domain}/)
    → Hooks (src/hooks/use{Domain}.tsx)
      → Supabase client (src/integrations/supabase/client.ts)
        → PostgreSQL (Supabase hosted)
```

### Domain modules

| Domain | Hook | Components dir | Key concepts |
|--------|------|---------------|--------------|
| Lotes (batches) | `useLotes`, `usePublicLotes`, `useSearchLotes` | `components/lotes/` | Soft-delete via `deleted_at`, Haversine distance search, status workflow (pendiente→aprobado→rechazado) |
| Productos | `useProductos` | `components/productos/` | Hard delete, admin approval workflow |
| Órdenes | `useOrdenes` | `components/ordenes/` | Links solicitante ↔ proveedor, item_id references lotes or productos |
| Calificaciones | `useCalificaciones` | `components/calificaciones/` | Ratings between users per order |
| Guías | `useGuias` | `components/guias/` | Educational content, featured on landing |
| Admin | `useAdmin` | `components/admin/` | 9-tab dashboard, audit trail, status management |
| Auth | `useAuth` | `components/auth/` | Supabase Auth, OAuth hash bridge |
| Search | `useSearchLotes` | `components/search/` | Leaflet map, GPS geolocation, radius filtering |

### Supabase

- **Project ref**: `gvegsztwqsaomkuywirl`
- **Client**: `src/integrations/supabase/client.ts` (auto-generated, do not edit)
- **Types**: `src/integrations/supabase/types.ts` (auto-generated from schema)
- **Edge Functions**: `supabase/functions/` — notify-status-change, notify-product-status, notify-order-status, notify-delete-entity, notify-new-message, suspend-user, delete-user-completely
- **RLS**: Row Level Security is active on all tables. Admin operations require `is_current_user_admin()` policy. DELETE policies must exist explicitly for admin deletion to work.
- **Migrations**: `supabase/migrations/` — schema changes tracked here

### Deployment

- **Hosting**: Cloudflare Pages, project name `natuvital`
- **Production URL**: `natuvital.pages.dev`
- **Production branch**: `main` (deploy with `--branch main`)
- **Preview branch**: `data` (deploys automatically create preview URLs)
- **CI/CD**: `.github/workflows/deploy-cloudflare.yml`
- **Wrangler config**: `wrangler.toml` with `pages_build_output_dir = "dist"`
- **Static files**: `_headers` (security headers), `_redirects` (SPA routing)

### TypeScript config

Loose checking is enabled (`noImplicitAny: false`, `strictNullChecks: false`). Do not tighten these without a full codebase audit.

### Important gotchas

- Supabase `.delete()` with RLS returns `{ error: null }` even when 0 rows are affected (policy silently blocks). Always use `.select()` after delete/update to verify rows were actually modified.
- Supabase `.single()` returns 406 when 0 rows match. Use `.maybeSingle()` or batch queries with `.in()` for lookups that may return nothing.
- Edge Functions use `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` for privileged operations — this key is only available server-side.
- The `auditoria_admin` table uses `user_id` to reference the admin who performed the action (not the affected user).
- Leaflet maps inside Dialogs need `map.invalidateSize()` after the dialog opens (container has 0px height when hidden).
