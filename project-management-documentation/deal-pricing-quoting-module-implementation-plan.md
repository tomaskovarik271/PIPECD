# Deal Pricing & Quoting Module: Detailed Implementation Plan

This document outlines the detailed implementation plan for the Deal Pricing & Quoting Module, based on the functional requirements and staged development plan previously defined.

## Guiding Architectural Principles

*   **Modular Design:** The pricing module will be a distinct "engine" or service.
*   **Well-Defined APIs:** Communication with the main CRM happens exclusively through well-defined APIs (GraphQL).
*   **Data Ownership:** The pricing module owns its core data.
*   **Configuration over Code:** Prioritize configurability.
*   **Minimal Shared Kernel:** Avoid CRM-specific logic in shared libraries.
*   **Frontend Component Library:** Self-contained and styled UI components.

---
## Stage 1: Core Calculation Engine & Basic UI (MVP)

**Goal:** Replicate core Excel functionality with a robust backend and functional UI, architecturally sound for future expansion and decoupling.

### 1.1. Backend Development

#### 1.1.1. Database Schema (Supabase - `supabase/migrations/`)
    *   **New Table: `price_quotes`** `[x]` (Migration exists: `TIMESTAMP_create_price_quotes_table.sql`)
        *   `id` (UUID, PK) `[x]`
        *   `deal_id` (UUID, FK to `deals.id`, NOT NULL) `[x]`
        *   `user_id` (UUID, FK to `auth.users.id`, NOT NULL) `[x]`
        *   `version_number` (INT, default 1, NOT NULL) `[x]`
        *   `name` (TEXT, e.g., "Initial Quote", "Scenario A") `[x]`
        *   `status` (TEXT, e.g., 'draft', 'proposed', 'archived', default 'draft') `[x]`
        *   `base_minimum_price_mp` (DECIMAL, nullable) `[x]`
        *   `target_markup_percentage` (DECIMAL, nullable) `[x]`
        *   `final_offer_price_fop` (DECIMAL, nullable) `[x]`
        *   `overall_discount_percentage` (DECIMAL, nullable, default 0) `[x]`
        *   `upfront_payment_percentage` (DECIMAL, nullable) `[x]`
        *   `upfront_payment_due_days` (INT, nullable) `[x]`
        *   `subsequent_installments_count` (INT, nullable) `[x]`
        *   `subsequent_installments_interval_days` (INT, nullable) `[x]`
        *   `created_at` (TIMESTAMPTZ, default now()) `[x]`
        *   `updated_at` (TIMESTAMPTZ, default now()) `[x]`
        *   *Calculated Output Fields (for snapshotting/denormalization):* `[x]` (All present in migration)
            *   `calculated_total_direct_cost` (DECIMAL, nullable) `[x]`
            *   `calculated_target_price_tp` (DECIMAL, nullable) `[x]`
            *   `calculated_full_target_price_ftp` (DECIMAL, nullable) `[x]`
            *   `calculated_discounted_offer_price` (DECIMAL, nullable) `[x]`
            *   `calculated_effective_markup_fop_over_mp` (DECIMAL, nullable) `[x]`
            *   `escalation_status` (TEXT, e.g., 'ok', 'requires_committee_approval', 'requires_ceo_approval', nullable) `[x]`
            *   `escalation_details` (JSONB, nullable, details of breached thresholds) `[x]`
    *   **New Table: `quote_additional_costs`** `[x]` (Migration exists: `TIMESTAMP_create_quote_additional_costs_table.sql`)
        *   `id` (UUID, PK) `[x]`
        *   `price_quote_id` (UUID, FK to `price_quotes.id` ON DELETE CASCADE, NOT NULL) `[x]`
        *   `description` (TEXT, NOT NULL) `[x]`
        *   `amount` (DECIMAL, NOT NULL) `[x]`
        *   `created_at` (TIMESTAMPTZ, default now()) `[x]`
        *   `updated_at` (TIMESTAMPTZ, default now()) `[x]`
    *   **New Table: `quote_markup_factors`** `[ ]` (Not found in migrations, plan notes it's for future if `target_markup_percentage` becomes complex)
        *   `id` (UUID, PK)
        *   `price_quote_id` (UUID, FK to `price_quotes.id` ON DELETE CASCADE, NOT NULL)
        *   `factor_name` (TEXT, NOT NULL)
        *   `factor_value` (DECIMAL or TEXT, depends on how they are used in calculation)
        *   `created_at` (TIMESTAMPTZ, default now())
        *   `updated_at` (TIMESTAMPTZ, default now())
    *   **New Table: `quote_invoice_schedule_entries`** `[x]` (Migration exists: `TIMESTAMP_create_quote_invoice_schedule_entries_table.sql`)
        *   `id` (UUID, PK) `[x]`
        *   `price_quote_id` (UUID, FK to `price_quotes.id` ON DELETE CASCADE, NOT NULL) `[x]`
        *   `entry_type` (TEXT, e.g., 'upfront', 'installment_1', 'milestone_fee') `[x]`
        *   `due_date` (DATE, NOT NULL) `[x]`
        *   `amount_due` (DECIMAL, NOT NULL) `[x]`
        *   `description` (TEXT, nullable) `[x]`
        *   `created_at` (TIMESTAMPTZ, default now()) `[x]`
        *   `updated_at` (TIMESTAMPTZ, default now()) `[x]`
    *   **RLS Policies:** `[~]` (Partially done. Policies for users exist in `price_quotes` migration; admin policy is a TODO)
        *   Users can create quotes. `[x]`
        *   Users can read/update/delete their own quotes (or quotes for deals they have access to - aligned with deal RLS). `[x]`
        *   Admins can manage all quotes. `[ ]` (TODO in migration file)

#### 1.1.2. Backend Logic (`/lib`)
    *   **New Service: `priceQuoteService.ts`** `[~]` (Exists. `createPriceQuote` is implemented. `getPriceQuoteById`, `updatePriceQuote`, `deletePriceQuote`, `listPriceQuotesForDeal` are stubs/TODOs. Internal helpers `calculateAndSnapshotQuoteOutputs`, `generateInvoiceScheduleForQuote` are present and use `priceCalculator`.)
        *   `createPriceQuote(dealId: string, userId: string, input: PriceQuoteCreateInput): Promise<PriceQuote>` `[x]`
        *   `getPriceQuoteById(quoteId: string, userId: string): Promise<PriceQuote | null>` `[ ]` (Stub)
        *   `updatePriceQuote(quoteId: string, userId: string, input: PriceQuoteUpdateInput): Promise<PriceQuote>` `[ ]` (Stub)
        *   `deletePriceQuote(quoteId: string, userId: string): Promise<boolean>` `[ ]` (Stub)
        *   `listPriceQuotesForDeal(dealId: string, userId: string): Promise<PriceQuote[]>` `[ ]` (Stub)
        *   `calculateAndSnapshotQuoteOutputs(quoteData: PriceQuoteInputData): PriceQuoteCalculatedOutputs` (internal helper) `[x]`
        *   `generateInvoiceScheduleForQuote(quoteData: PriceQuoteInputData, calculatedOfferPrice: number): InvoiceScheduleEntryData[]` (internal helper) `[x]`
        *   Helper functions for CRUD on `quote_additional_costs`, `quote_markup_factors`, `quote_invoice_schedule_entries` linked to a quote. `[~]` (Handled within `createPriceQuote` for `additional_costs` and `invoice_schedule_entries`. Not for `markup_factors`.)
    *   **New Module: `priceCalculator.ts` (Pure functions, easily testable)** `[x]` (Exists and functions are implemented)
        *   `calculateTotalDirectCost(mp: number, additionalCosts: { amount: number }[]): number` `[x]`
        *   `calculateTargetPrice(mp: number, targetMarkupPercentage: number): number` (TP based on MP markup) `[x]`
        *   `calculateFullTargetPrice(targetPrice: number, additionalCosts: { amount: number }[]): number` (FTP = TP + AC) `[x]`
        *   `calculateDiscountedOfferPrice(fop: number, discountPercentage: number): number` `[x]`
        *   `calculateEffectiveMarkupFopOverMp(fop: number, mp: number): number` `[x]`
        *   `determineEscalationStatus(fop: number, mp: number, totalDirectCost: number, /* other relevant params */): { status: string, details: any }` `[x]` (Placeholder logic exists)
        *   `generateBasicInvoiceSchedule(finalOfferPrice: number, upfrontPercent: number, upfrontDueDays: number, numInstallments: number, installmentIntervalDays: number): InvoiceScheduleEntryData[]` `[x]`
    *   **Shared Types (`/lib/types.ts` or new `pricingTypes.ts`)** `[x]` (`pricingTypes.ts` exists and contains relevant types)
        *   `PriceQuote`, `AdditionalCost`, `MarkupFactor`, `InvoiceScheduleEntry` interfaces. `[x]` (Present in `pricingTypes.ts`, `MarkupFactor` might be minimal if not used yet)
        *   Input types for service methods: `PriceQuoteCreateInput`, `PriceQuoteUpdateInput`, `PriceQuoteInputData`, `PriceQuoteCalculatedOutputs`, `InvoiceScheduleEntryData`. `[x]` (Present in `pricingTypes.ts`)

#### 1.1.3. GraphQL API (`netlify/functions/graphql/`)
    *   **Schema Extensions (`schema/pricing.graphql`):** `[x]` (File exists and content aligns with Stage 1 plan)
        *   `PriceQuote` type (mirroring DB + calculated fields from denormalized store or computed by resolver). `[x]`
        *   `AdditionalCost` type, `AdditionalCostInput`. `[x]`
        *   `MarkupFactor` type, `MarkupFactorInput`. `[ ]` (Schema has comment deferring `MarkupFactor` type)
        *   `InvoiceScheduleEntry` type. `[x]`
        *   `PriceQuoteCreateInput`, `PriceQuoteUpdateInput` types. `[x]`
        *   `Query`: `[x]`
            *   `priceQuote(id: ID!): PriceQuote` `[x]`
            *   `priceQuotesForDeal(dealId: ID!): [PriceQuote!]!` `[x]`
        *   `Mutation`: `[x]`
            *   `createPriceQuote(dealId: ID!, input: PriceQuoteCreateInput!): PriceQuote!` `[x]`
            *   `updatePriceQuote(id: ID!, input: PriceQuoteUpdateInput!): PriceQuote!` `[x]`
            *   `deletePriceQuote(id: ID!): Boolean` `[x]`
            *   `calculatePriceQuotePreview(input: PriceQuoteUpdateInput!): PriceQuote` (For on-the-fly calculations without saving, returns a full PriceQuote object with calculated fields) `[x]`
    *   **Resolvers (`resolvers/pricing.ts` or extend `query.ts`, `mutation.ts`):** `[~]` (Partially done. `pricing.ts` and `mutations/pricingMutations.ts` exist. Query resolvers call service stubs. `createPriceQuote` and `calculatePriceQuotePreview` mutations seem functional. `update/delete` mutations call service stubs. Relational resolvers for `Deal`/`User` on `PriceQuote` are stubs.)
        *   Implement resolvers, calling `priceQuoteService`. `calculatePriceQuotePreview` will call calculation logic directly without saving. `[~]`
        *   Ensure user authentication and authorization (via deal access or quote ownership). `[x]` (Checks for `context.currentUser` are present)
    *   **Input Validation (`validators.ts`):** `[~]` (Zod schemas for `PriceQuoteCreateInput` and `PriceQuoteUpdateInput` exist in `validators.ts`. However, `pricingMutations.ts` has duplicate local definitions that should be removed in favor of imports from `validators.ts`.)

### 1.2. Frontend Development

#### 1.2.1. State Management (Zustand - `frontend/src/stores/`)
    *   **New Slice: `priceQuoteStore.ts`** `[x]` (File `usePriceQuoteStore.ts` exists and is comprehensive)
        *   State: `currentQuoteInputs` (form data), `currentQuotePreview` (result of calculation), `quotesForDealList`, `isLoading`, `error`. `[x]` (All present, `currentQuoteInputs` includes `additional_costs`)
        *   Actions: `[x]` (All planned actions seem to be implemented)
            *   `fetchPriceQuotesForDeal(dealId: string)` `[x]`
            *   `fetchPriceQuoteById(quoteId: string)` (populates `currentQuoteInputs` and `currentQuotePreview`) `[x]`
            *   `createPriceQuote(dealId: string, data: PriceQuoteCreateInput)` `[x]`
            *   `updatePriceQuote(quoteId:string, data: PriceQuoteUpdateInput)` `[x]`
            *   `deletePriceQuote(quoteId: string)` `[x]`
            *   `updateCurrentQuoteInputValue(field: string, value: any)` (updates `currentQuoteInputs`) `[x]`
            *   `getQuotePreview(inputs: PriceQuoteUpdateInput)` (calls `calculatePriceQuotePreview` mutation, updates `currentQuotePreview`) `[x]`
            *   `resetCurrentQuoteForm()` `[x]`

#### 1.2.2. UI Components (`frontend/src/components/pricing/`)
    *   **New Directory: `frontend/src/components/pricing/`** `[x]` (Exists)
    *   `PriceQuoteForm.tsx`: `[~]` (Exists. Core form elements are present. Integration of `AdditionalCostList` is still pending - import is commented out, placeholder text present.)
        *   Inputs for MP, AC items (list with add/remove), Target Markup Factors/Percentage, FOP, Discount %. `[~]` (MP, Target Markup %, FOP, Discount % are present. AC items integration is pending.)
        *   Inputs for invoice schedule parameters. `[x]`
        *   Calls `getQuotePreview` on input changes. `[ ]` (Preview is triggered by a button, not on input changes yet)
        *   Save/Update buttons. `[x]`
    *   `PriceQuoteSummaryDisplay.tsx`: `[x]` (Exists)
        *   Displays fields from `currentQuotePreview` (TP, FTP, FMP, Discounted Offer Price, Escalation Status). `[x]` (Likely, assuming component functions as named)
    *   `AdditionalCostItem.tsx`, `AdditionalCostList.tsx`. `[~]` (Files exist, but `AdditionalCostList` is not yet integrated into `PriceQuoteForm.tsx`)
    *   `InvoiceScheduleDisplay.tsx`: `[x]` (Exists)
        *   Shows generated schedule from `currentQuotePreview.invoiceScheduleEntries`. `[x]` (Likely)
    *   `PriceQuoteListItem.tsx`: For listing quotes under a deal. `[x]` (Exists)
    *   `DealPricingTabContent.tsx`: `[x]` (Exists)
        *   Manages selected quote. `[x]` (Handled via store)
        *   Displays `PriceQuoteForm` and `PriceQuoteSummaryDisplay` for the selected/new quote. `[x]`
    *   `DealPricingSection.tsx` (to be embedded in Deal details page): `[x]` (Exists)
        *   Lists existing quotes for the deal using `PriceQuoteListItem`. `[x]`
        *   Button to "Create New Quote" / Select existing quote to load into `DealPricingTabContent`. `[x]`

#### 1.2.3. Pages & Routing (`frontend/src/pages/`)
    *   No new top-level pages. Functionality integrated into existing Deal detail view via `DealPricingSection.tsx`. `[x]` (This seems to be the case)

#### 1.2.4. API Integration
    *   Define GraphQL operations (queries/mutations) for pricing. `[x]` (Defined as strings in `usePriceQuoteStore.ts`)
    *   Zustand actions use these operations via `graphqlClient`. `[x]` (Implemented in `usePriceQuoteStore.ts`)

### 1.3. Testing

#### 1.3.1. Backend
    *   **Unit Tests (Vitest - `/lib/*.test.ts`):** `[ ]` (No `priceCalculator.test.ts` or `priceQuoteService.test.ts` found)
        *   `priceCalculator.ts`: Extensive tests for all calculation functions. `[ ]`
        *   `priceQuoteService.ts`: Mock Supabase client, test CRUD logic and internal calculation/snapshotting calls. `[ ]`
    *   **Integration Tests (Vitest):** `[ ]` (No specific test files found for GraphQL resolvers)
        *   GraphQL resolvers: Test `create/updatePriceQuote` for data persistence and correct response. Test `calculatePriceQuotePreview`. `[ ]`

#### 1.3.2. Frontend
    *   **Component Tests (Vitest/React Testing Library):** `[ ]` (No test files found alongside pricing components)
        *   `PriceQuoteForm.tsx`: Input handling, state updates, preview triggering. `[ ]`
        *   `PriceQuoteSummaryDisplay.tsx`: Correct rendering of preview data. `[ ]`
    *   **Store Tests (Vitest):** `[ ]` (No `priceQuoteStore.test.ts` found)
        *   `priceQuoteStore` actions and state changes, especially preview logic. `[ ]`

#### 1.3.3. E2E Tests (Playwright - `/e2e/`) `[~]` (Partially PASSED - Core CRUD, preview, AC, and invoice schedule functionality verified through manual E2E testing TC_PQ_001-TC_PQ_013)
    *   Basic flow: Navigate to a deal, create a quote, fill inputs (including MP, AC), see preview update, save, edit (MP, AC), delete, verify displayed data and calculations. `[PASSED - TC_PQ_001, TC_PQ_003-TC_PQ_005, TC_PQ_008]`
    *   Verify invoice schedule generation in preview and after save/update. `[PASSED - TC_PQ_002 and other TCs covering invoice schedule aspects like TC_PQ_009-TC_PQ_013]`
    *   Verify quote deletion and status changes (e.g., archiving). `[PASSED - TC_PQ_006, TC_PQ_007]`

### 1.4. Key Decisions & Considerations - Stage 1

*   **Calculation Logic Precision:** Double-confirm Excel calculation formulas for MP, AC, Target Markup %, TP, FTP, FMP, and Escalation logic. The FR suggests: `TotalDirectCost = MP + sum(AC)`; `TargetPrice (TP)` based on `MP & TargetMarkup%`; `FullTargetPrice (FTP) = TP + AC`. Ensure this is correctly translated. `[~]` (Logic is in `priceCalculator.ts`, needs verification against Excel)
*   **Calculated Outputs:** The `calculatePriceQuotePreview` mutation will provide real-time calculations to the frontend. Upon save (`create/updatePriceQuote`), these calculated fields will be stored in `price_quotes` table for consistency and history. `[x]` (Implemented this way)
*   **Markup Factors:** For Stage 1, `target_markup_percentage` will be a single direct input. The `quote_markup_factors` table is for potential future use if this becomes a list of named factors. `[x]` (Implemented as single input)
*   **Initial UI:** Focus on a clean, functional UI. Advanced conditional rendering or complex layouts can be deferred. `[x]` (UI is functional)
*   **Linting and Code Quality Best Practices:** `[~]` (Generally good, but identified duplicate Zod schemas. Ongoing.)
    *   **Naming Conventions:** Strictly adhere to project-defined naming conventions as outlined in `DEVELOPER_GUIDE_V2.md` (e.g., `camelCase` for functions/variables, `PascalCase` for types/interfaces/React components). `[~]` (Appears mostly followed)
    *   **Explicit Typing:** Ensure all functions and methods have explicit return types. Avoid the `any` type; use `unknown` with appropriate type checking or define precise interfaces/types. `[~]` (Mostly good, some `any` types might exist, e.g. in store error handling or resolver parents)
    *   **GraphQL Generated Types:** Prioritize the use of auto-generated GraphQL types (from `codegen.ts`) for all API-related data structures (resolvers, service layer, frontend API calls, and stores) to ensure consistency and type safety. `[~]` (Store uses manually defined GQL types and fragments, plan mentions codegen)
    *   **React Best Practices:** In React components, always provide unique and stable `key` props for list items. Strictly follow the rules of hooks. `[~]` (To be verified in detail, but components look standard)
    *   **Accessibility (jsx-a11y):** Actively address accessibility warnings from the linter. Provide `alt` text for images, `aria-label` attributes for icon buttons, and ensure proper form labeling. `[~]` (Form labels exist, detailed a11y check pending)
    *   **ESLint Directives:** Minimize the use of `eslint-disable` comments; they should be rare and well-justified. `[~]` (To be verified)
    *   **Import Management:** Regularly remove unused imports. Adhere to consistent import path strategies and ordering if enforced by the linter. `[~]` (Generally looks okay)
    *   **Non-Null Assertions (`!`):** Use the non-null assertion operator (`!`) with extreme caution. Prefer explicit type guards or checks. `[~]` (To be verified)
    *   **Promise Handling:** Ensure all Promises are correctly handled using `await` within `async` functions or by attaching `.then().catch()` error handlers. `[x]` (Looks good in store and resolvers)
    *   **Code Formatting:** Assume code formatting rules (e.g., Prettier) are enforced by the linting process. Ensure code is formatted correctly before committing. `[x]` (Assumed)
    *   **Zod Schemas:** Ensure Zod validation schemas in `validators.ts` precisely match the structure and optionality of their corresponding GraphQL Input types. `[~]` (Schemas exist; duplication issue noted)

---
## Stage 2: Enhanced Costing, Profitability & Flexibility

**Goal:** Introduce more granular costing, true profitability metrics (GPM), and more flexible markup/discounting.

### 2.1. Backend Development

#### 2.1.1. Database Schema
    *   **Modify Table: `price_quotes`**
        *   Add `offer_currency_code` (TEXT, e.g., 'USD', 'EUR', default 'USD', NOT NULL)
        *   Add `cost_buildup_type` (TEXT, e.g., 'simplified_mp_ac', 'detailed_line_items', default 'simplified_mp_ac')
        *   Add `calculated_gross_profit_margin_gpm` (DECIMAL, nullable) - Store calculated GPM.
    *   **New Table: `price_catalog_services`**
        *   `id` (UUID, PK), `name` (TEXT, UNIQUE, NOT NULL), `default_unit_cost` (DECIMAL, NOT NULL), `default_list_price` (DECIMAL, nullable), `cost_category` (TEXT, nullable), `unit_name` (TEXT, e.g., 'hour', 'item', default 'item'), `is_active` (BOOLEAN, default true), `created_at`, `updated_at`
    *   **New Table: `price_catalog_roles`**
        *   `id` (UUID, PK), `name` (TEXT, UNIQUE, NOT NULL), `default_cost_rate_hourly` (DECIMAL, NOT NULL), `is_active` (BOOLEAN, default true), `created_at`, `updated_at`
    *   **New Table: `quote_cost_line_items`** (Replaces `quote_additional_costs` for detailed buildup)
        *   `id` (UUID, PK)
        *   `price_quote_id` (UUID, FK to `price_quotes.id` ON DELETE CASCADE, NOT NULL)
        *   `item_type` (TEXT, e.g., 'catalog_service', 'catalog_role', 'direct_pass_through', 'custom_labor')
        *   `catalog_service_id` (UUID, FK to `price_catalog_services.id`, nullable)
        *   `catalog_role_id` (UUID, FK to `price_catalog_roles.id`, nullable)
        *   `description` (TEXT, NOT NULL)
        *   `quantity` (DECIMAL, NOT NULL)
        *   `unit_cost` (DECIMAL, NOT NULL) - Sourced from catalog or overridden
        *   `total_cost` (DECIMAL, calculated as quantity * unit_cost)
        *   `markup_percentage_override` (DECIMAL, nullable)
        *   `is_pass_through` (BOOLEAN, default false)
        *   `created_at`, `updated_at`
    *   **RLS:** Read access for catalog tables for authenticated users. Admin roles for catalog CRUD.

#### 2.1.2. Backend Logic (`/lib`)
    *   **Modify `priceQuoteService.ts`:**
        *   Handle `cost_buildup_type`. If 'detailed', use `quote_cost_line_items`.
        *   Calculate `Total Direct Cost` from `quote_cost_line_items`.
        *   Calculate `Gross Profit Margin (GPM)`: `(FOP - TotalDirectCost) / FOP`. Store GPM.
        *   Update `calculateAndSnapshotQuoteOutputs` to include GPM and handle detailed costs.
    *   **Modify `priceCalculator.ts`:**
        *   `calculateTotalDirectCostFromLineItems(lineItems: CostLineItemData[]): number`
        *   `calculateGPM(fop: number, totalDirectCost: number): number`
        *   Update `determineEscalationStatus` to be primarily GPM-driven.
    *   **New Service: `priceCatalogService.ts`** (Manages catalog within this module)
        *   CRUD for `price_catalog_services` and `price_catalog_roles`.

#### 2.1.3. GraphQL API
    *   **Schema Extensions (`pricing.graphql`):**
        *   Update `PriceQuote`: add `offerCurrencyCode`, `costBuildupType`, `grossProfitMarginGPM`, `costLineItems: [QuoteCostLineItem!]`.
        *   New Types: `PriceCatalogService`, `PriceCatalogRole`, `QuoteCostLineItem`, `QuoteCostLineItemInput`.
        *   Update `PriceQuoteCreateInput`, `PriceQuoteUpdateInput`: include `costBuildupType`, `offerCurrencyCode`, `costLineItems: [QuoteCostLineItemInput!]`. Conditionally use simplified MP/AC or line items.
        *   New Queries: `listPriceCatalogServices`, `listPriceCatalogRoles`.
        *   New Mutations for catalog CRUD (admin only).
    *   **Resolvers:** Updated for `PriceQuote`, new for catalog.

### 2.2. Frontend Development

#### 2.2.1. State Management (`priceQuoteStore.ts`)
    *   Add state for `catalogServices`, `catalogRoles`. Fetch actions.
    *   Handle `costBuildupType`, `costLineItems` in `currentQuoteInputs`.
    *   GPM in `currentQuotePreview`.

#### 2.2.2. UI Components
    *   **Modify `PriceQuoteForm.tsx`:**
        *   Selector for `costBuildupType`.
        *   Conditionally show MP/AC inputs OR `QuoteCostLineItemsList.tsx`.
        *   Input for `offerCurrencyCode`.
    *   **New: `QuoteCostLineItemRow.tsx`, `QuoteCostLineItemsList.tsx`:**
        *   Manage detailed cost line items (add from catalog, custom, edit, remove).
    *   **Modify `PriceQuoteSummaryDisplay.tsx`:** Display GPM, update in real-time.
    *   **(Optional) UI for Catalog Management:** If managed here.

### 2.3. Testing (Similar structure to Stage 1, focusing on new features)

#### 2.3.1. Backend: Test GPM, detailed costing, catalog service.
#### 2.3.2. Frontend: Test line item UI, GPM display, conditional form logic.
#### 2.3.3. E2E: Create quote with detailed line items, verify GPM and escalation.

### 2.4. Key Decisions & Considerations - Stage 2

*   **Catalog Management Source:** Confirm if internal tables are sufficient or if an external source needs consideration. (Assume internal for now).
*   **Currency for Costs:** Stage 2 assumes all line item costs are entered in the `offer_currency_code`. Defer multi-currency cost inputs.
*   **Default Markups:** Introduce global default markup, or per service/role? (Line-item override is in schema; global default can be a setting later).

---
## Stage 3: Advanced Quoting Features & Workflow Prep

**Goal:** Introduce scenario planning, more sophisticated invoicing, and lay groundwork for approval workflows.

### 3.1. Backend Development

#### 3.1.1. Database Schema
    *   **Modify `price_quotes`:** Add `parent_quote_id` (UUID, FK to `price_quotes.id`, nullable), `is_template` (BOOLEAN, default false).
    *   **New Table: `quote_value_added_fees`**
        *   `id` (UUID, PK), `price_quote_id` (FK), `description` (TEXT), `fee_type` (TEXT), `value` (DECIMAL), `revenue_share_base_amount` (DECIMAL, nullable), `is_commissionable` (BOOLEAN), `included_in_margin_calc` (BOOLEAN), `created_at`, `updated_at`.
    *   **Modify `quote_invoice_schedule_entries`:** Add `milestone_description` (TEXT, nullable), make `due_date` nullable for milestones.
    *   **New Table: `price_quote_audit_log`**
        *   `id` (UUID, PK), `price_quote_id` (FK), `user_id` (FK), `timestamp`, `action` (TEXT), `field_changed` (TEXT, nullable), `old_value` (TEXT, nullable), `new_value` (TEXT, nullable), `details_json` (JSONB, nullable).

#### 3.1.2. Backend Logic (`/lib`)
    *   **`priceQuoteService.ts`:**
        *   `clonePriceQuote(quoteId: string, userId: string, newName: string): Promise<PriceQuote>`
        *   Integrate `quote_value_added_fees` into calculations.
        *   Enhance invoice schedule generation for milestones/custom.
        *   Implement audit logging for CUD on quotes and sub-entities.
        *   `