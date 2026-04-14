# Commanda Data Model Plan

## 1. Purpose

This document defines the high-level data structure for Commanda so implementation can start with clear tenant isolation, scalable query patterns, and an archive strategy that protects performance.

## 2. Architecture Goals

- Each seller must have a separate workspace for orders, customers, and operational data.
- A large seller must not degrade the daily experience of a small seller.
- The MVP schema must remain simple enough for fast implementation.
- The model must support free-plan usage without uncontrolled performance decline.
- The model should evolve cleanly toward premium features such as teams, analytics, and integrations.

## 3. Tenant Model

### Recommended pattern

Use a workspace-based multi-tenant model.

- One workspace represents one seller business.
- One or more authenticated users can belong to a workspace later.
- Every operational record belongs to exactly one workspace.

### Why this model fits

- It is simple to reason about.
- It maps directly to the requirement that each user has separate lists of orders and clients.
- It works well with Supabase Row-Level Security.
- It supports future team access without redesigning core data ownership.

## 4. Core Entities

### Workspace

Represents the seller business.

Suggested fields:

- id
- owner_user_id
- display_name
- country_code
- default_currency
- created_at
- plan_tier
- plan_status

### User profile

Represents the authenticated actor using the product.

Suggested fields:

- id
- workspace_id
- full_name
- role
- phone
- created_at

### Customer

Represents a buyer served by the seller.

Suggested fields:

- id
- workspace_id
- full_name
- phone_primary
- phone_secondary
- address_line
- city
- region
- country_code
- notes
- created_at
- updated_at

### Delivery company

Represents a courier or delivery provider that the seller uses.

Suggested fields:

- id
- workspace_id
- name
- contact_name
- contact_phone
- notes
- is_active
- created_at

### Order

Represents one sale transaction recorded after the seller receives an order.

Suggested fields:

- id
- workspace_id
- customer_id
- delivery_company_id
- order_reference
- source_channel
- status
- total_amount_snapshot
- currency_code
- delivery_address_snapshot
- delivery_city_snapshot
- delivery_region_snapshot
- client_name_snapshot
- client_phone_snapshot
- notes
- is_archived
- archived_at
- created_by
- created_at
- updated_at

### Order item snapshot

Represents the product data captured at the moment of order entry.

Suggested fields:

- id
- workspace_id
- order_id
- product_name_snapshot
- sku_snapshot
- quantity
- unit_price_snapshot
- line_total_snapshot
- created_at

### Order status history

Represents traceable state changes over time.

Suggested fields:

- id
- workspace_id
- order_id
- status
- changed_by
- change_note
- created_at

## 5. Why Snapshot Fields Matter

Order records should preserve key customer and product values as snapshots, even if the related customer or product data changes later.

This matters because:

- delivery details may differ across orders for the same customer;
- customer names or phone numbers can be corrected later;
- prices may change over time;
- historical orders should remain auditable.

## 6. Minimal Relationships

- One workspace has many customers.
- One workspace has many delivery companies.
- One workspace has many orders.
- One customer has many orders.
- One delivery company can be assigned to many orders.
- One order has many order item snapshots.
- One order has many status history entries.

## 7. Row-Level Security Direction

Every operational table should enforce workspace-level access.

### Access rule direction

- A user can only read records where workspace_id matches the user's workspace.
- A user can only create records inside their workspace.
- A user can only update records inside their workspace.
- Cross-workspace reads must be impossible by policy, not just by UI.

This is one of the core safeguards that ensures one seller never sees another seller's orders, clients, or courier data.

## 8. Query and Indexing Strategy

### Main operational queries in MVP

- List active orders by workspace.
- Filter active orders by status.
- Search orders by customer name, phone, or reference within one workspace.
- List customers by workspace.
- Search customers by name or phone within one workspace.
- List archived orders by workspace.

### Indexing direction

Indexes should favor tenant-first access.

- workspace_id plus created_at on orders.
- workspace_id plus status plus updated_at on orders.
- workspace_id plus is_archived plus updated_at on orders.
- workspace_id plus phone_primary on customers.
- workspace_id plus full_name on customers.
- workspace_id plus order_id on order items and status history.

### Why this matters

The platform should never rely on broad global scans. Tenant-first indexes reduce contention and keep each seller's workload logically isolated.

## 9. Archive Strategy

Archiving is part of the product model, not a cleanup afterthought.

### Recommended archive rule

- Orders move from active to archived when delivered, canceled, or sufficiently old.
- Active list views exclude archived orders by default.
- Archive remains searchable in a dedicated flow.
- Archive state should not break order history or customer history.

### MVP technical direction

Use an is_archived flag plus archived_at timestamp first.

This is sufficient for MVP because:

- it is simple;
- it supports quick filtering;
- it keeps restore options open later.

### Later evolution

If order history becomes large, the archive model can evolve toward:

- table partitioning by archived state or time window;
- cold-storage style export strategies;
- premium retention rules for advanced users.

## 10. Performance Protection for Small Sellers

This requirement must shape both schema and product behavior.

### Core safeguards

- All high-frequency queries must be scoped by workspace.
- Default screens should read active data only.
- Pagination is required for order lists.
- Search should remain workspace-scoped.
- Bulk or expensive operations belong in later asynchronous workflows.

### Practical outcome

A high-volume seller may create more records in the same database, but the day-to-day reads for a small seller remain bounded by tenant-scoped indexes and archive-aware queries.

## 11. Subscription and Feature Flag Readiness

The schema should be ready for freemium gating even if billing is not launched immediately.

Suggested later entities:

- subscription
- feature_flag
- workspace_feature_entitlement
- billing_customer_reference

This allows premium rollout without redesigning the operational model.

## 12. Country Expansion Readiness

To support Tunisia first and later France and African markets, keep these fields flexible from the start:

- country_code
- currency_code
- locale or language preference later
- delivery company records per workspace, not globally assumed

Avoid building country-specific tax or invoice logic into the MVP order schema.

## 13. Recommended Schema Decision Summary

Commanda should use a workspace-based multi-tenant relational model in Supabase Postgres. Every core table should carry workspace_id and be protected by Row-Level Security. Orders should include snapshot data for customer and delivery details so historical records remain stable. Active and archived orders should be explicitly separated at the query level from the first release.

This approach is lean enough for a $0 launch, strong enough for free-plan scale, and flexible enough to support premium features, teams, and future market expansion without major structural rework.