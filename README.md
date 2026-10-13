# C.O.D.E. Club Website

**Community of Data Engineers** — Data Science Department, RNSIT

A multi-page club website and event-registration platform built with Next.js, Supabase, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (canary) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Validation | Zod |
| File Storage | Supabase Storage |
| Animations | Framer Motion + CSS |
| Hosting | Cloudflare Pages (zero-cost) |

---

## Getting Started

### Prerequisites

- Node.js v18+ (v22 recommended)
- npm v9+
- A [Supabase](https://supabase.com) project (free tier)
- Git

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/code-club.git
cd code-club
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for local dev |
| `NEXT_PUBLIC_UPI_ID` | Club's authorized UPI ID (add when available) |
| `NEXT_PUBLIC_UPI_PAYEE_NAME` | Club's UPI payee name |
| `RAZORPAY_KEY_ID` etc. | Razorpay dashboard (optional) |

> **Never commit `.env.local` to Git.** It is already in `.gitignore`.

### 3. Run database migrations

```bash
# Apply all migrations to your Supabase project
npx supabase db push
# Or if using the Supabase CLI:
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

Migration files are in `supabase/migrations/`. Run them in order against your Supabase project.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
  app/                      # Next.js App Router pages
    page.tsx                # Homepage
    about/page.tsx
    events/
      page.tsx              # Events listing
      [slug]/
        page.tsx            # Event detail
        register/page.tsx   # Registration form
    registration/
      [reference]/page.tsx  # Registration status lookup
    contact/page.tsx
    admin/
      login/page.tsx
      page.tsx              # Dashboard
      events/page.tsx
      registrations/page.tsx
    api/                    # API Route Handlers
      registrations/route.ts
      payments/
        upi/route.ts
        razorpay/route.ts
      webhooks/
        razorpay/route.ts

  components/
    layout/                 # Navbar, Footer, PageWrapper
    home/                   # Hero, FeaturedEvent, UpcomingEvents
    events/                 # EventCard, EventDetail, CountdownTimer
    registration/           # RegistrationForm, TeamMemberFields
    payment/                # UpiPayment, RazorpayPayment, StatusBadge
    admin/                  # Dashboard, EventEditor, RegistrationTable
    ui/                     # shadcn/ui primitives + custom atoms
    animations/             # BubbleEffect, ScrollReveal, MotionWrapper

  lib/
    supabase/               # Client, server, middleware helpers
    auth/                   # Admin auth utilities
    payments/               # UPI and Razorpay logic
    validation/             # Zod schemas
    utils.ts                # cn(), formatters, helpers

  types/
    index.ts                # Shared TypeScript types

supabase/
  migrations/               # SQL migration files (version controlled)

public/
  images/                   # Static images, logo
```

---

## Design Tokens

Design tokens (colours, typography, spacing, shadows, animation settings) are centralized in:
- `src/app/globals.css` — CSS custom properties
- `tailwind.config.ts` — Tailwind theme extension

To redesign the visual theme, update these files without touching business logic.

---

## Environment Variable Reference

See `.env.example` for a complete reference with descriptions.

---

## Database Migrations

All SQL is in `supabase/migrations/`. Files are numbered sequentially.

To apply to a new Supabase project:
1. Go to your Supabase project → SQL Editor
2. Run each migration file in order, or use `supabase db push`

---

## Admin Access

Admin accounts are managed through Supabase Auth. To add an administrator:
1. Create a user in Supabase Auth (Dashboard → Authentication → Users)
2. Insert their user ID into the `admin_users` table
3. They can then log in at `/admin/login`

---

## Payment Configuration

### UPI (default)
Set `NEXT_PUBLIC_UPI_ID`, `NEXT_PUBLIC_UPI_PAYEE_NAME`, and optionally `NEXT_PUBLIC_UPI_QR_IMAGE_URL` in `.env.local`.

Registration payments will show manual UPI instructions and require admin approval.

### Razorpay (optional)
Set all `RAZORPAY_*` variables. The integration is built but will show a configuration notice until live credentials are present. Use Razorpay test keys for development.

---

## Deployment (Cloudflare Pages)

1. Push the repository to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → Create a project → Connect GitHub
3. Build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Output directory:** `.vercel/output/static`
4. Add all environment variables (from `.env.example`) in the Cloudflare Pages dashboard
5. Deploy

> Cloudflare Pages free plan: Unlimited bandwidth, 500 builds/month, custom domains free.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Security Notes

- `.env.local` is gitignored — never commit secrets
- Supabase service-role key is server-only
- Row Level Security is enabled on all tables
- Admin routes are protected server-side
- Receipt images are stored in a private Supabase Storage bucket
- All user inputs are validated server-side with Zod
