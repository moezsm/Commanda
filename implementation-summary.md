# Commanda Implementation Summary

## Product Direction

Commanda is a mobile-first freemium SaaS for social-media sellers, starting in Tunisia. The core promise is fast post-order capture: product, client, delivery company, and delivery details saved immediately after order reception.

## Feature Strategy

The product is designed in iterative modules where each iteration ends with a usable MVP slice:

1. Foundation and scope lock
2. Access and workspace isolation
3. Customers and delivery companies
4. Order capture core loop
5. Lifecycle and archive
6. Search and operational dashboard
7. Free plan controls
8. Premium foundation

This sequence ensures value is delivered early while preserving future premium expansion.

## Technology Choices

- Frontend: Next.js App Router with TypeScript
- Hosting: Vercel Hobby at launch
- Backend: Supabase (Postgres, Auth, RLS, optional Storage)
- Authorization: Workspace-based multi-tenancy with strict RLS
- Premium readiness: Feature flags and entitlement model first, Stripe later

This stack minimizes launch cost and complexity while supporting secure scaling.

## Key Architecture Rules

- Every operational record is scoped to a seller workspace.
- Tenant-first query design and indexes are mandatory.
- Active and archived orders are separated by default behavior.
- Big-seller activity must not degrade small-seller performance.

## Monetization Logic

- Free plan remains genuinely usable for daily operations.
- Premium monetizes productivity and scale features, not basic order survival.
- E-invoicing is intentionally postponed to a late premium phase.

## Handoff to Implement Agent

Use the tasks folder as the execution contract:

- Start from tasks/iteration-00-foundation/tasks.md
- Complete one iteration at a time
- Validate acceptance criteria and MVP end state before moving to next iteration

## Current Planning Assets

- product-study.md
- pricing-model.md
- feature-design.md
- technology-selection.md
- data-model-plan.md
- mobile-user-flows.md
- task-breakdown.md
- tasks/README.md
- study-summary.excalidraw
