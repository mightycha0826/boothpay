# BoothPay

학교 축제 부스 판매 관리 시스템 (SvelteKit + Supabase + Tailwind + xlsx).

## Setup

```bash
npm install
cp .env.example .env       # fill in Supabase keys + ADMIN_PASSWORD
npm run dev
```

## Supabase

1. Create a project, then in the SQL editor run `supabase/schema.sql`.
2. Copy the project URL, anon key, and **service role** key into `.env`.
3. The `checkout` RPC is `security definer` — it validates PIN, decrements stock,
   and inserts `orders` + `order_items` atomically.

## Architecture

```
src/
  lib/
    supabaseClient.ts        # browser (anon) — visible products + public_clubs view
    server/supabaseAdmin.ts  # server-only (service role)
    stores/session.ts        # club login persisted in localStorage
    stores/cart.ts           # cart map + derived total/count
  routes/
    +page.svelte             # landing
    sales/+page.svelte       # PIN login + cart + checkout
    api/login/               # validates PIN server-side
    api/checkout/            # calls the atomic checkout RPC
    admin/                   # password-gated via hooks.server.ts
      +page.svelte           # stats
      clubs/                 # CRUD
      products/              # CRUD
      export/                # xlsx download
    api/admin/login/         # sets bp_admin cookie
    api/admin/sales/         # flattened rows for xlsx
  hooks.server.ts            # admin cookie gate
```

## Security notes

- PIN is never sent to the browser; the `public_clubs` view exposes only `id` + `name`.
- All writes (CRUD + checkout) go through server endpoints using the service-role key
  or the security-definer RPC. RLS blocks anon writes by default.
- Admin pages and `/api/admin/*` require the `bp_admin` cookie set after password login.
- For production, swap the cookie/password gate for Supabase Auth with an `is_admin` claim.

## Excel export columns

`Timestamp | Club Name | Student ID | Product Name | Unit Price | Quantity | Subtotal`
