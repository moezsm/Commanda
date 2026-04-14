# Commanda Technology Selection

## 1. Selection Goal

Choose a simple, cost-conscious technology stack that supports a freemium SaaS launch in Tunisia at $0 baseline and scales toward premium and regional expansion.

## 2. Final Technology Choices

| Layer | Choice | Why this choice | Launch cost fit |
|---|---|---|---|
| Frontend framework | Next.js App Router with TypeScript | Strong mobile web support, fast iteration, clear server/client boundaries | Fits Vercel Hobby |
| Styling/UI | Tailwind CSS plus component primitives | Rapid UI delivery with consistent mobile layouts | No extra platform cost |
| Hosting and CI preview | Vercel Hobby | Preview deployments and simple operations for MVP | $0 baseline |
| Database | Supabase Postgres | Relational model for orders, customers, delivery, status history | Supabase Free |
| Authentication | Supabase Auth | Native integration and low setup complexity | Included in Free |
| Authorization | Supabase Row-Level Security | Enforces tenant separation at data layer | Included |
| File storage | Supabase Storage, disabled in early MVP | Keeps path ready for proofs and documents later | Included in Free cap |
| Server business logic | Next.js server actions and route handlers | Minimal backend complexity for v1 | Runs on Vercel |
| Background logic later | Supabase Edge Functions | Good for async premium jobs and integrations | Free-tier allowance exists |
| Search strategy | PostgreSQL indexes plus scoped queries | Enough for MVP without extra search service | Included |
| Analytics | Vercel Analytics plus product events in database | Lightweight product and traffic insight | Free entry point |
| Payments later | Stripe subscriptions | Standard SaaS billing path | No monthly fee at start |
| Transactional email | Supabase auth email initially, Resend later if needed | Cost control and upgrade flexibility | Free entry point |

## 3. Architecture Pattern

### Pattern

Single web app plus single backend platform.

- Next.js handles UI and app endpoints.
- Supabase handles auth, Postgres, RLS, and optional storage.
- No microservices in MVP.

### Why

- Lowest operational complexity.
- Clean fit for iterative feature rollout.
- Avoids infrastructure fragmentation early.

## 4. Data and Tenant Isolation Decisions

- Workspace-based multi-tenancy.
- workspace_id on all operational tables.
- RLS policies for read and write isolation.
- Tenant-first query indexes.
- Archive-first list strategy to keep active views fast.

These decisions directly address the requirement that large sellers must not impact small seller performance.

## 5. Free Tier and Upgrade Triggers

## $0 baseline capability

- Text-first order workflow fits in Supabase Free and Vercel Hobby.
- Initial MVP avoids heavy media storage and external integrations.

## Expected first limits

- Supabase database growth due to order history.
- Vercel bandwidth if traffic scales quickly.

## Upgrade path

- Supabase Pro first when database headroom or backup/ops needs increase.
- Vercel Pro when team/deployment governance and traffic require it.
- Stripe activation when premium conversion starts.

## 6. Security and Compliance Baseline

- Supabase Auth for authentication.
- RLS policies mandatory before production data use.
- Basic audit trace via order status history.
- Data minimization for customer personal information.
- Country-specific compliance modules introduced later, not in MVP core schema.

## 7. Technology Risks and Controls

| Risk | Impact | Control |
|---|---|---|
| Poor query design across tenants | Slowdowns for small sellers | Tenant-first indexing and strict workspace filters |
| Archive ignored by product flows | Operational list degradation | Separate active and archive query paths |
| Early overuse of external tools | Higher cost and complexity | Supabase and Vercel native-first rule |
| Too-early billing complexity | Slower product learning | Feature flags first, Stripe later |

## 8. Recommended Technology Summary

Commanda should stay on a lean Next.js plus Supabase plus Vercel architecture with TypeScript throughout. This stack is enough for fast MVP delivery, strong tenant isolation, and low launch cost, while still providing a clean path to premium capabilities and regional expansion.