# Commanda Feature Design

## 1. Objective

Define a practical feature system for Commanda that can be built iteratively with a usable MVP at the end of each feature slice.

## 2. Product Operating Principle

The first product promise is simple: once a seller receives an order, they can save and manage it in under one minute on mobile.

## 3. Feature Modules and Iterative MVP Slices

## Module A: Workspace and Access

### Feature intent

Each seller has a separate business space and cannot see other sellers' data.

### MVP slice A1

- Sign up and sign in.
- One workspace per seller account.
- Seller can access only their own data.

### Done state

One seller logs in and sees an empty personal workspace ready for order capture.

## Module B: Customer Management

### Feature intent

Sellers can create and reuse customer records quickly during order entry.

### MVP slice B1

- Create customer with minimum data.
- Search customer by name or phone.
- View customer profile with basic details.

### Done state

Seller can attach existing or new customers to orders without leaving workflow.

## Module C: Delivery Company Management

### Feature intent

Sellers can maintain multiple delivery companies and select one per order.

### MVP slice C1

- Add and edit delivery companies.
- List active delivery companies.
- Select delivery company in order form.

### Done state

Every order can be assigned to the right courier with no hardcoded provider.

## Module D: Order Capture

### Feature intent

Order entry is fast and reliable from mobile, with all critical information saved.

### MVP slice D1

- Create order with product snapshot, customer, delivery company, and notes.
- Set initial status.
- View order details after save.

### Done state

The core workflow works end-to-end for a solo seller.

## Module E: Order Lifecycle and Archive

### Feature intent

Sellers can track orders from new to delivered while keeping active lists fast.

### MVP slice E1

- Update order status.
- Record status history.
- Archive delivered or old orders.
- Separate active versus archive views.

### Done state

Operational list remains focused on active work; historical data remains retrievable.

## Module F: Search and Operational Dashboard

### Feature intent

Sellers can quickly find what they need and see what needs attention today.

### MVP slice F1

- Search orders by customer, phone, or reference.
- Filter active orders by status.
- Home dashboard with core counts.

### Done state

Seller can recover any operational context in seconds.

## Module G: Free Plan Controls

### Feature intent

Keep the free tier usable while controlling cost and preserving platform quality.

### MVP slice G1

- Enforce workspace-level free limits.
- Keep essential workflow available.
- Show soft-limit messaging when approaching thresholds.

### Done state

Free users can operate normally; platform has clear boundaries for growth.

## Module H: Premium Foundation

### Feature intent

Prepare monetization without adding heavy complexity too early.

### MVP slice H1

- Add plan tiers and feature entitlements.
- Gate premium features behind feature flags.
- Keep billing integration optional until conversion target is proven.

### Done state

Product can enable premium features without schema redesign.

## 4. Post-MVP Premium Feature Waves

### Premium wave 1

- Team accounts and role permissions.
- Bulk status updates.
- Advanced filters and exports.
- Basic analytics and repeat-customer metrics.

### Premium wave 2

- Courier integrations.
- Branded documents.
- Multi-store controls.

### Premium wave 3

- Country compliance modules.
- E-invoicing last.

## 5. Non-Functional Feature Constraints

- Strict tenant isolation on all modules.
- Mobile-first performance for all high-frequency screens.
- Archive-aware query behavior by default.
- Feature additions must not degrade free plan core flow.

## 6. Feature Build Sequence Recommendation

1. Workspace and access.
2. Customer and delivery company models.
3. Order capture.
4. Status lifecycle and archive.
5. Search and dashboard.
6. Free limit controls.
7. Premium foundations.

This sequence ensures usable value appears early and grows iteratively without rework.