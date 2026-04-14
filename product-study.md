# Commanda Product Study

## 1. Problem Statement

Commanda is a mobile-first SaaS application for small social media sellers who manage orders manually through Facebook, Instagram, and messaging apps. These sellers often lose time and accuracy because orders, customer details, and delivery information are spread across chats, notebooks, and spreadsheets.

The initial objective is narrow and practical: once a seller receives an order, they should be able to save it quickly in Commanda with the product, client information, selected delivery company, and delivery details. The system must remain usable on the free plan, work well on mobile devices, and preserve performance for small sellers even when larger sellers join the platform.

## 2. Assumptions

- The first target market is Tunisia.
- Most early users are solo sellers or very small teams.
- Users are price-sensitive and expect a meaningful free plan.
- The product is not trying to replace full ERP, accounting, or warehouse software in v1.
- Each seller needs strict separation of orders, customers, and operational data.
- Different orders may use different delivery companies.
- E-invoicing is not required for MVP and should be introduced only in a later premium phase.
- The preferred technical stack is Next.js, Supabase, and Vercel with a $0 launch target.

## 3. Target Users

### Primary users

- Small Facebook and Instagram sellers in Tunisia.
- Home-based businesses and informal merchants.
- Sellers managing orders manually through DMs, comments, or WhatsApp.

### Secondary users

- Growing sellers with higher order volume who need workflow discipline.
- Small teams with one owner and one or two operators.

### Later expansion users

- Francophone sellers in France who need stronger reporting and compliance support.
- Sellers in North and West Africa who share similar social-commerce workflows but may use different delivery and payment practices.

## 4. Business Model

### Core model

Commanda should launch as a freemium SaaS.

- Free plan: fully usable for solo sellers with essential daily order management.
- Premium plan: adds automation, team workflows, analytics, and country-specific operational tools.
- Optional future revenue streams: courier integrations, invoice/compliance modules, and paid messaging or notification bundles.

### Why freemium fits this product

- The target audience is highly price-sensitive.
- Users need to experience operational value before paying.
- Free usage supports word-of-mouth growth among seller communities.
- Premium conversion can happen naturally when order volume, team size, or reporting needs increase.

### Monetization structure

| Tier | Positioning | Revenue logic |
|---|---|---|
| Free | Daily operations for solo sellers | Acquisition and retention |
| Premium | Productivity and growth tools | Monthly subscription |
| Add-on services later | Compliance, advanced automation, integrations | Upsell revenue |

## 5. Free vs Premium Feature Split

### Free plan must remain genuinely usable

The free plan should cover the complete core workflow for a small seller.

- Create and manage orders.
- Save product name or SKU snapshot per order.
- Save customer profile and delivery address.
- Assign a delivery company per order.
- Track basic order statuses: new, confirmed, prepared, shipped, delivered, canceled, archived.
- Search recent orders and customers.
- View customer order history.
- Basic mobile dashboard.

### Premium features that scale well

These features should increase value without making the free plan non-functional.

- Advanced analytics and sales insights.
- Team accounts and staff permissions.
- Automated status updates and reminders.
- Bulk actions on orders.
- Reusable product catalog with pricing history.
- Courier integrations and status sync.
- Export tools and advanced reporting.
- Customer segmentation and repeat-buyer tracking.
- Branded documents and labels.
- Multi-store or multi-page management.
- API access and external integrations.

### Premium features to introduce later

These should not be in the first premium wave.

- E-invoicing.
- Country-specific tax workflows.
- Advanced accounting integrations.

## 6. Product Scope for MVP

### Main user journey

1. Seller receives an order through social media.
2. Seller opens Commanda on mobile.
3. Seller creates an order.
4. Seller enters product details, customer details, delivery company, and delivery notes.
5. Seller updates status as the order progresses.
6. Seller can later find the customer and order history quickly.

### MVP feature set

- Authentication.
- Seller workspace setup.
- Order creation and editing.
- Customer records linked to orders.
- Delivery company records and per-order assignment.
- Order status workflow.
- Mobile-first order list and detail pages.
- Basic filters and search.
- Manual archive flow for completed or old orders.

### Out of scope for MVP

- Full inventory management.
- Marketplace integrations.
- Real-time courier API syncing.
- Team permissions.
- E-invoicing.
- Advanced analytics.

## 7. Stack Mapping

| Need | Recommended component | Reason |
|---|---|---|
| Mobile-first web app | Next.js App Router with TypeScript | Fast product iteration, good mobile web delivery, strong Copilot compatibility |
| Hosting | Vercel Hobby | $0 launch hosting with preview deployments |
| Authentication | Supabase Auth | Built-in auth without extra infrastructure |
| Main database | Supabase Postgres | Relational model fits orders, customers, couriers, and status history |
| Per-user data separation | Supabase Row-Level Security | Enforces tenant isolation at the data layer |
| File storage later | Supabase Storage | Useful for proof-of-delivery images, invoices, or labels |
| Server-side workflows | Next.js server actions or API routes | Keeps backend simple for MVP |
| Background or secure logic later | Supabase Edge Functions | Good for premium automations and integrations |
| Payments later | Stripe | Standard subscription path once premium is introduced |

## 8. Hosting Plan and Cost Progression

### $0 launch baseline

The MVP should fit within Vercel Hobby and Supabase Free if the product remains focused on text-heavy operational workflows.

- Vercel Hobby hosts the Next.js application.
- Supabase Free handles auth and the main Postgres database.
- No heavy file uploads in v1.
- No expensive external APIs required for launch.

### Likely first paid threshold

The first likely pressure points are:

- Supabase database size if order history grows quickly.
- Vercel bandwidth if mobile traffic increases significantly.
- Supabase auth or database usage if many active sellers join.

### Upgrade path

- Supabase Pro should be the first infrastructure upgrade when storage, backups, or database performance tuning become necessary.
- Vercel Pro should follow when traffic, observability, or team deployment needs justify it.
- Stripe is introduced only when premium billing starts.

### Hidden costs to monitor

- Database growth from long order history.
- File storage growth if proof-of-delivery uploads are added.
- Email provider costs for notifications.
- Payment processing fees once subscriptions begin.
- Potential localization or compliance work for France and later African expansion.

## 9. High-Level Data Model

### Core entities

- Seller workspace.
- User account.
- Customer.
- Order.
- Order item snapshot.
- Delivery company.
- Delivery details.
- Order status history.
- Archive metadata.
- Subscription and feature flags later.

### Data separation rule

Every operational table must include a workspace or tenant boundary so each seller only sees their own customers, orders, and delivery information.

### Practical model direction

- One seller workspace owns many customers.
- One seller workspace owns many delivery companies.
- One customer can have many orders.
- One order belongs to one customer and one selected delivery company.
- One order keeps status history for traceability.

## 10. Performance and Isolation Strategy

This is a critical product requirement, not an implementation detail.

### Goal

A large seller's volume must not degrade the experience of smaller sellers.

### Required architectural principles

- Strict tenant scoping on all queries.
- Database indexes centered on workspace and status filters.
- Row-Level Security to prevent cross-tenant access.
- Per-tenant pagination and capped list views.
- Rate limiting for expensive operations.
- Async processing for premium bulk jobs later.

### Archive strategy for performance

Archiving should be part of the design from the start.

- Active orders remain in the main operational view.
- Completed and older orders move to an archived state.
- Archived records stay searchable but are excluded from default views.
- Archive filters and date boundaries keep operational screens fast.
- Later, if needed, archived data can be moved into separate partitions or colder storage patterns without changing the product model.

## 11. Security, Privacy, and Operational Considerations

- Use Supabase Auth for secure user access.
- Enforce Row-Level Security on all seller data.
- Store only necessary personal customer information.
- Prepare for country-specific privacy notices as the product expands.
- Log critical status changes for operational traceability.
- Keep audit-friendly history for order lifecycle events.
- Avoid exposing one seller's metadata to another seller.

## 12. Geographic Expansion Strategy

### Phase 1: Tunisia

- Arabic and French usability should be considered early, even if one language launches first.
- Delivery workflows should support local courier variability.
- Pricing must stay accessible for solo sellers.

### Phase 2: France

- Stronger compliance expectations.
- Higher demand for invoices, exports, and business reporting.
- Premium readiness becomes more important.

### Phase 3: Selected African markets

- Reuse the same core order workflow.
- Add country-specific courier, language, and document variations as premium extensions where needed.

## 13. Scaling Milestones and Migration Triggers

| Stage | Product reality | Architectural response |
|---|---|---|
| Early MVP | Solo sellers, low volume | Single database, strict tenant isolation, simple archive model |
| Growth | More active sellers and larger order history | Better indexing, more aggressive archiving, move to Supabase Pro |
| Premium operations | Bulk actions, automations, integrations | Introduce Edge Functions and job-style processing |
| Regional expansion | More countries and compliance differences | Add localization, pricing tiers, and country modules |
| Heavy enterprise-like usage | Very large sellers dominate resource use | Consider tenant segmentation strategies and dedicated premium limits |

## 14. Delivery Phases

### Phase 1: Foundation

- Confirm product scope and pricing logic.
- Design tenant model and archive rules.
- Define the MVP user journey for mobile.

### Phase 2: MVP launch

- Auth and seller onboarding.
- Order, customer, and delivery company management.
- Status tracking and archive workflow.
- Free plan release in Tunisia.

### Phase 3: Growth features

- Search improvements.
- Basic reporting.
- Premium packaging design.
- Early conversion experiments.

### Phase 4: Premium enablement

- Team access.
- Bulk workflows.
- Courier integrations.
- Advanced analytics.

### Phase 5: Compliance and advanced monetization

- Exports.
- Branded documents.
- E-invoicing last.

## 15. Risks, Tradeoffs, and Open Questions

### Main risks

- Free users may generate significant historical data without converting.
- Courier workflows may vary more than expected by region.
- Users may eventually expect inventory, payment collection, and invoicing in one product.
- France expansion may require compliance work earlier than planned.

### Key tradeoffs

- A generous free plan improves adoption but increases storage pressure.
- Strong archiving keeps performance healthy but can reduce convenience if retrieval is clumsy.
- Starting with manual courier entry keeps MVP simple but limits automation value.

### Open questions

- Should the free plan include unlimited historical archive access or only a rolling window?
- Will pricing be flat by seller, by order volume, or by feature bundle?
- Which language should ship first in Tunisia: French, Arabic, or both?
- How soon should WhatsApp-centric workflows be considered alongside Facebook and Instagram?

## 16. Recommended Summary

Commanda should launch as a focused freemium SaaS for Tunisian social media sellers whose immediate need is to save and track orders quickly on mobile after receiving them through chats or social platforms. The MVP should center on order capture, customer records, delivery company assignment, and simple status tracking.

The free plan must be genuinely useful, while premium growth should come from team workflows, analytics, automation, and integrations rather than from restricting the core order workflow. From the start, the architecture must enforce strict tenant separation, strong query scoping, and an archive strategy so large sellers do not degrade platform performance for small sellers.

The stack should remain lean: Next.js on Vercel, Supabase for auth and database, and Stripe only when premium is introduced. Tunisia is the right launch market, while France and selected African markets should be treated as later expansion phases requiring localization and premium operational modules. E-invoicing should remain a late-stage premium feature, not an MVP dependency.