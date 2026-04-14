# Commanda Mobile User Flows

## 1. Purpose

This document translates the product study into wireframe-ready mobile flows for the MVP. The goal is not final UI design, but a practical structure that a designer or builder can turn into screens quickly.

## 2. Design Principles for the Mobile MVP

- The app is used in short bursts, often immediately after a message or call.
- The fastest path must be saving a new order.
- The seller should not need to switch between many screens for the core workflow.
- Recent and active work should be prioritized over full history.
- Search must be easy because many sellers think in terms of customer name, phone number, or product name.
- Archive should be visible but separated from daily operations.

## 3. Primary Navigation Recommendation

Use a simple bottom navigation with four primary areas.

- Home
- Orders
- Customers
- More

The main call to action for adding an order should remain visually persistent on the Home and Orders screens.

## 4. Core MVP Flow: Save a New Order

### User goal

The seller has just received an order on Facebook, Instagram, or WhatsApp and wants to record it quickly.

### Entry points

- Home screen quick action.
- Orders tab floating action button.
- Customer profile if the buyer already exists.

### Flow steps

1. Seller taps New Order.
2. App opens a lightweight order form.
3. Seller enters or selects customer.
4. Seller enters product name and optional quantity or price snapshot.
5. Seller selects delivery company.
6. Seller enters delivery details and notes.
7. Seller sets initial status, likely New or Confirmed.
8. Seller taps Save.
9. App redirects to Order Details with a success confirmation and next actions.

### Wireframe blocks

- Header with back action and title.
- Customer section.
- Product section.
- Delivery company section.
- Delivery details section.
- Notes section.
- Save button fixed near the bottom.

### UX notes

- Returning users should be able to select an existing customer quickly.
- Delivery company options should come from the seller's saved list.
- Form should support quick save, not long data entry.

## 5. Customer Selection Flow

### Goal

The seller needs to attach the order to a known customer or create a new one without friction.

### Flow steps

1. Seller taps customer field in the order form.
2. App opens customer picker.
3. Seller searches by name or phone.
4. If found, seller selects existing customer.
5. If not found, seller taps Add New Customer.
6. Seller enters minimum required information.
7. App returns to the order form with the new customer attached.

### Minimum customer fields

- Full name.
- Phone number.
- Delivery address.
- Optional city or region.
- Optional notes.

## 6. Delivery Company Selection Flow

### Goal

The seller chooses the courier used for this specific order.

### Flow steps

1. Seller taps delivery company field.
2. App shows saved delivery companies.
3. Seller selects one company.
4. If not present, seller adds a new delivery company inline.
5. App returns to the order form.

### Minimum delivery company fields

- Company name.
- Contact reference if needed.
- Optional notes.

## 7. Order Details Flow

### Goal

The seller reviews one order and updates it as the delivery progresses.

### Main sections on the screen

- Status badge and quick update action.
- Customer summary.
- Product summary.
- Delivery company and delivery notes.
- Timeline or status history.
- Edit and archive actions.

### Core actions

- Change status.
- Edit order.
- Open customer profile.
- Archive order.

## 8. Orders List Flow

### Goal

The seller needs an operational queue, not a reporting screen.

### Default view

- Active orders only.
- Sorted by most recent activity or most urgent status.
- Status chips visible.
- Customer name and product summary visible.

### Quick controls

- Search bar.
- Status filter.
- Delivery company filter.
- Add order action.

### Performance rule

Archived orders should not appear in the default operational list.

## 9. Customers List Flow

### Goal

The seller needs to quickly find a buyer and see past orders.

### Screen content

- Search input.
- Customer cards or rows.
- Last order date.
- Order count.

### Customer detail screen

- Customer identity and contact details.
- Address.
- Notes.
- Recent order history.
- New order shortcut.

## 10. Archive Flow

### Goal

Completed or old orders should remain available without slowing daily operations.

### Flow steps

1. Seller opens an order.
2. Seller chooses Archive.
3. App confirms the action.
4. Order is removed from active views.
5. Order stays available in Archive search or archive list.

### Archive screen behavior

- Separate from active orders.
- Searchable by customer, phone, order reference, or product.
- Read-friendly and retrieval-oriented.
- Restore action can exist later if needed.

## 11. Home Dashboard Flow

### Goal

The seller should understand what needs attention in seconds.

### Recommended content

- New Order primary button.
- Count of active orders.
- Count of orders awaiting shipment.
- Count of delivered orders today or this week.
- Recent orders list.

### Rule

Do not overload the home screen with analytics in MVP.

## 12. Onboarding Flow

### Goal

A new seller should reach first value fast.

### Flow steps

1. Sign up or sign in.
2. Create seller workspace.
3. Add store or seller name.
4. Add first delivery company or skip.
5. Land directly on Home with a prompt to create the first order.

### Onboarding principle

Reduce setup friction. Anything non-essential should be skippable.

## 13. Premium-Oriented Future Flows

These should not block MVP wireframes but should shape future UX structure.

- Team invitation and permissions.
- Bulk order status updates.
- Analytics dashboard.
- Product catalog management.
- Courier sync center.
- Export center.
- E-invoicing flow later.

## 14. Screen Inventory for Wireframing

- Splash or auth entry screen.
- Sign up and sign in screens.
- Workspace setup screen.
- Home screen.
- Orders list screen.
- New order screen.
- Customer picker screen.
- New customer screen.
- Delivery company picker screen.
- New delivery company screen.
- Order detail screen.
- Customer list screen.
- Customer detail screen.
- Archive list screen.
- More or settings screen.

## 15. Recommended UX Summary

The mobile MVP should revolve around one dominant action: save an order fast. Home, Orders, and Customer screens should all feed into this action. The active order list should stay light and fast, while archive and history stay accessible but separated. This creates a product that feels operationally useful on the free plan while staying scalable for the future premium roadmap.