# Commanda Task Breakdown

## Priority Legend

- P1: must be decided or prepared before MVP build starts.
- P2: needed for MVP completion.
- P3: post-launch optimization or premium preparation.
- P4: later expansion work.

## Phase 1: Foundation

| Priority | Task | Type | Dependency | Notes |
|---|---|---|---|---|
| P1 | Confirm core product scope and exclude non-MVP modules | Architecture decision | None | Keep MVP focused on order capture and follow-up |
| P1 | Define free plan limits that still allow real daily usage | Business decision | None | Free plan must be useful, not symbolic |
| P1 | Define premium packaging principles | Business decision | Free plan positioning | Premium should sell productivity, not basic survival |
| P1 | Define seller workspace model | Architecture decision | None | Each seller needs separate orders, customers, and delivery records |
| P1 | Define archive policy for old and completed orders | Architecture decision | Workspace model | Performance requirement from day one |
| P1 | Decide initial language strategy for Tunisia | Product decision | None | French only or bilingual French and Arabic |
| P1 | Define Tunisia-first pricing assumptions | Business decision | Free and premium positioning | Must match small seller affordability |

## Phase 2: MVP Design

| Priority | Task | Type | Dependency | Notes |
|---|---|---|---|---|
| P2 | Map the end-to-end seller journey from order reception to delivery completion | Product design | Core scope | This is the central workflow |
| P2 | Define the minimum data required to create an order | Architecture decision | Seller journey | Product, customer, delivery company, delivery info |
| P2 | Define customer record structure and searchability | Architecture decision | Core data model | Needed for repeat buyers |
| P2 | Define delivery company model with per-order assignment | Architecture decision | Core data model | Must support multiple couriers per seller |
| P2 | Define order status model and archive transition rules | Architecture decision | Archive policy | Prevent clutter in active views |
| P2 | Define mobile-first navigation and list prioritization | Product design | Seller journey | Must be fast to use on phone |
| P2 | Define tenant isolation and access-control rules | Architecture decision | Workspace model | Needed to ensure user data separation |
| P2 | Define baseline metrics for usability and performance | Product and architecture | Seller journey | Fast order save and fast order retrieval |

## Phase 3: Launch Readiness

| Priority | Task | Type | Dependency | Notes |
|---|---|---|---|---|
| P2 | Prepare MVP launch criteria for Tunisia | Product decision | MVP design | Focus on core workflow reliability |
| P2 | Define support and onboarding approach for first users | Business and operations | MVP design | Early adoption likely requires hands-on help |
| P2 | Define what usage data will be tracked post-launch | Architecture and product | Baseline metrics | Needed for iteration and premium planning |
| P3 | Define retention reports to validate free-plan usefulness | Product analysis | Launch criteria | Must prove daily operational value |
| P3 | Define storage and database monitoring thresholds | Architecture decision | Archive policy | Needed before large histories accumulate |

## Phase 4: Premium Enablement

| Priority | Task | Type | Dependency | Notes |
|---|---|---|---|---|
| P3 | Design premium tier around workflow efficiency | Business decision | Free plan adoption | Do not cripple free core workflow |
| P3 | Prioritize first premium features | Product strategy | Usage data | Best candidates are analytics, bulk actions, and team access |
| P3 | Define feature-flag strategy for tier gating | Architecture decision | Premium design | Enables clean free and premium separation |
| P3 | Define courier integration roadmap | Product and architecture | Delivery company model | Start manual, integrate later |
| P3 | Define premium reporting and export capabilities | Product strategy | Usage data | Especially relevant for France later |

## Phase 5: Regional Expansion

| Priority | Task | Type | Dependency | Notes |
|---|---|---|---|---|
| P4 | Reassess pricing and messaging for France | Business strategy | Premium packaging | Different expectations and compliance pressure |
| P4 | Define localization requirements for additional markets | Product strategy | Language strategy | French and Arabic first, then more regional adaptation |
| P4 | Evaluate country-specific courier and compliance needs | Product and architecture | Courier roadmap | Avoid overbuilding before market proof |
| P4 | Plan e-invoicing as a late premium module | Product strategy | France expansion readiness | Keep this last as requested |

## Cross-Cutting Safeguards

These requirements apply across all phases.

- Keep the free plan operationally useful.
- Ensure one seller cannot see or affect another seller's data.
- Design active versus archived records clearly for performance.
- Prevent large sellers from degrading smaller sellers' experience through tenant-aware query design and usage controls.
- Keep the stack lean enough to fit a $0 launch baseline.

## Recommended Immediate Next Steps

1. Lock the MVP scope to the post-order capture workflow only.
2. Finalize the free-plan boundaries and first premium wave.
3. Decide the Tunisia launch language approach.
4. Define the tenant and archive model before any implementation starts.
5. Turn this plan into wireframes and a database design document.