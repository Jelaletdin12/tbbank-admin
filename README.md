# TBBank Admin Panel

A full-featured internal banking administration panel built with **React 19 + Vite + TypeScript**. It supports loan management, card operations, international payments, user/role management, currency tracking, and system configuration — all in one place.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [Architecture Overview](#architecture-overview)
   - [Entry Point & Provider Tree](#entry-point--provider-tree)
   - [Router](#router)
   - [Layouts](#layouts)
   - [State Management (Zustand)](#state-management-zustand)
   - [Data Fetching (React Query)](#data-fetching-react-query)
   - [HTTP Client (Axios)](#http-client-axios)
   - [Internationalization (i18n)](#internationalization-i18n)
   - [Theming (Light / Dark)](#theming-light--dark)
   - [Error Handling](#error-handling)
   - [Form Validation (Zod + RHF)](#form-validation-zod--rhf)
7. [Feature Modules](#feature-modules)
8. [Shared Components](#shared-components)
9. [Route Map](#route-map)
10. [Development Standards](#development-standards)
11. [Known Issues & Gaps](#known-issues--gaps)

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI Framework | React | ^19.2.5 |
| Build Tool | Vite | ^8.0 |
| Language | TypeScript | ~6.0 |
| Styling | Tailwind CSS v4 | ^4.2 |
| UI Components | shadcn/ui (Radix-UI) | ^1.4 |
| State Management | Zustand | ^5.0 |
| Data Fetching | TanStack React Query | ^5.100 |
| HTTP Client | Axios | ^1.15 |
| Routing | React Router DOM | ^7.14 |
| Forms | React Hook Form + Zod | ^7.75 / ^4.4 |
| Tables | TanStack React Table | ^8.21 |
| Notifications | Sonner | ^2.0 |
| i18n | i18next + react-i18next | ^26 / ^17 |
| Charts | Recharts | ^3.8 |
| Rich Text | Tiptap | ^3.23 |
| Icons | Lucide React | ^1.14 |
| Fonts | Geist + Inter (variable) | ^5.2 |

---

## Prerequisites

- **Node.js** ≥ 20.x (LTS recommended)
- **npm** ≥ 10.x
- A running backend API — see [Environment Variables](#environment-variables)

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd tbbank-admin

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local     # then fill in VITE_API_BASE_URL

# 4. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173** by default.

```bash
# Type-check + production build
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint
```

---

## Environment Variables

Create a `.env.local` file in the project root. **All variables must be prefixed with `VITE_`** to be exposed to the client bundle.

```env
# Base URL for all API requests — no trailing slash
VITE_API_BASE_URL=https://api.tbbank.gov.tm/v1
```

> The Axios client reads `import.meta.env.VITE_API_BASE_URL` at runtime.  
> The refresh-token endpoint is called at `{VITE_API_BASE_URL}/auth/refresh`.

---

## Project Structure

```
src/
├── App.tsx                  # Root component — mounts RouterProvider
├── main.tsx                 # Entry point — renders provider tree into #root
├── index.css                # Global styles, CSS tokens, Tailwind directives
│
├── app/
│   ├── providers/
│   │   ├── QueryProvider.tsx     # TanStack Query client + global error toasts
│   │   ├── ThemeProvider.tsx     # next-themes wrapper (light/dark)
│   │   └── ErrorBoundary.tsx     # GlobalErrorBoundary + PageErrorBoundary
│   ├── router/
│   │   └── index.tsx             # All routes (createBrowserRouter), lazy imports
│   └── store/
│       ├── authStore.ts          # Zustand — token, user, login, logout, refreshToken
│       ├── themeStore.ts         # Zustand — light/dark toggle, persisted
│       └── i18nStore.ts          # Zustand — active language, persisted
│
├── assets/                  # Static files (SVG icons, images)
│
├── components/
│   ├── ui/                  # shadcn/ui primitives (button, input, select, …)
│   │   ├── sonner.tsx           # <Toaster /> — placed once in main.tsx
│   │   ├── spinner.tsx          # Reusable loading spinner
│   │   ├── skeleton.tsx         # Skeleton loader
│   │   └── statusBadge.tsx      # Colored status chip (success/warning/error/info)
│   ├── dataTable.tsx            # Generic paginated TanStack Table wrapper
│   ├── dataTableToolbar.tsx     # Search, filters, column toggle, per-page selector
│   ├── formInput.tsx            # Comprehensive single-step form builder
│   ├── stepBarV2.tsx            # Multi-step form with Progressive Disclosure
│   ├── viewPageComponents.tsx   # <InfoRow>, section wrappers for detail pages
│   ├── formActions.tsx          # Save / Cancel action bar used in forms
│   ├── creditCardVisual.tsx     # Animated card visual for card-related pages
│   ├── tableButton.tsx          # Small icon button used inside table rows
│   └── tableSearch.tsx          # Standalone search input for tables
│
├── features/                # Feature-Sliced Design — one folder per domain
│   └── [feature]/
│       ├── api/             # Axios calls + TypeScript types/interfaces
│       ├── hooks/           # React Query hooks (useQuery + useMutation)
│       ├── components/      # Feature-specific shared components (e.g. *Form.tsx)
│       └── schemas/         # Zod schemas for form validation
│
├── layouts/
│   └── DashboardLayout.tsx  # Sidebar + header + <Outlet /> for all auth'd pages
│
├── lib/
│   ├── api/
│   │   └── client.ts        # Axios instance — auth header + 401/403 interceptors
│   ├── i18n/
│   │   ├── index.ts         # i18next init — reads localStorage for saved locale
│   │   └── locales/
│   │       ├── en.json      # English translations
│   │       ├── ru.json      # Russian translations
│   │       └── tk.json      # Turkmen translations
│   ├── hooks/
│   │   ├── useMobile.ts     # Detects mobile viewport
│   │   └── useOutsideClick.ts
│   └── utils.ts             # cn() — clsx + tailwind-merge helper
│
└── pages/                   # Route-level page components (thin wrappers)
    ├── login/
    ├── dashboard/
    ├── loanDepartment/      # Loan orders, mobile loans, loan balance, certificates
    ├── cardDepartment/      # Card orders, transactions, requisites, balances, PINs
    ├── internationalPayments/  # Visa/Master, Sber payments
    ├── users/               # Operators, clients, all users
    ├── currencies/          # Currency rates, Visa/Master/Sber settings
    ├── onlinePaymentsHistory/
    ├── settings/
    │   ├── users/           # Roles, Permissions
    │   ├── loan/            # Loan types, Required documents
    │   ├── card/            # Card reasons, Card types
    │   └── location/        # Districts, Branches
    └── notFoundPage/
```

---

## Architecture Overview

### Entry Point & Provider Tree

`main.tsx` composes the provider stack in this exact order (outermost → innermost):

```
GlobalErrorBoundary
  └─ ThemeProvider          (next-themes — manages <html class="dark">)
       └─ QueryProvider     (TanStack Query client with global error toasts)
            └─ App          (RouterProvider)
                 └─ Toaster (sonner — placed here so it is always mounted)
```

**Why this order matters:**
- `GlobalErrorBoundary` catches JS crashes from _any_ child including providers.
- `ThemeProvider` must wrap everything so CSS variables resolve before first paint.
- `QueryProvider` creates the single shared `queryClient` with centralized `QueryCache` / `MutationCache` error handlers — so individual hooks do _not_ need their own `toast.error()`.

---

### Router

`src/app/router/index.tsx` uses `createBrowserRouter` (React Router v7).

**Guards (Outlet-based):**

| Guard | Behavior |
|---|---|
| `PublicGuard` | If already authenticated → redirect to `/dashboard` |
| `AuthGuard` | If not authenticated → redirect to `/login` |

**Lazy Loading:** Every page component is wrapped in `React.lazy()` + `<Suspense fallback={<PageLoader />}>`. This keeps the initial bundle tiny — only the login page is loaded on first visit.

**Error Element:** `<PageErrorFallback />` is set on all route levels so any render-time exception shows a recovery UI instead of a blank screen.

**Adding a new route:**
1. Create a `lazy()` import at the top of `router/index.tsx`.
2. Add the route object inside the `AuthGuard → DashboardLayout` children array.
3. Follow the pattern: list `/feature`, create `/feature/create`, view `/feature/:id`, edit `/feature/:id/edit`.

---

### Layouts

There is currently **one layout**: `DashboardLayout`.

`DashboardLayout` (`src/layouts/DashboardLayout.tsx`) renders:
- **`<AppSidebar />`** — collapsible 3-level navigation using shadcn `Sidebar` + Radix Collapsible. Auto-expands the active section based on `useLocation()`.
- **`<DashboardHeader />`** — breadcrumbs auto-generated from the URL path, language switcher (EN/RU/TK), theme toggle, and notifications bell.
- **`<Outlet />`** — the matched page is rendered here.
- **Footer** — copyright line.

The sidebar nav structure is a `NavGroup[]` array defined inside `AppSidebar`. When you add a new section, add it here alongside the route.

---

### State Management (Zustand)

All stores live in `src/app/store/` and use the `persist` middleware (localStorage).

| Store | Key | What it holds |
|---|---|---|
| `authStore` | `tbbank-auth` | `token`, `user`, `isAuthenticated`, `setAuth()`, `logout()`, `refreshToken()` |
| `themeStore` | `tbbank-theme` | `theme: 'light' \| 'dark'`, `setTheme()`, `toggleTheme()`. Applies class to `<html>` immediately on rehydration. |
| `i18nStore` | `tbbank-lang` | `language: 'en' \| 'ru' \| 'tk'`, `setLanguage()`. Calls `i18n.changeLanguage()` on change. |

> **Rule:** Zustand is for **global persistent UI state only**. Server data lives in React Query. Never put API responses into Zustand.

---

### Data Fetching (React Query)

`QueryProvider` creates one shared `queryClient` with:

- **`staleTime`**: 5 minutes — data is considered fresh for 5 min after fetch.
- **`gcTime`**: 10 minutes — cached data is garbage-collected after 10 min of inactivity.
- **`refetchOnWindowFocus`**: `false` — no surprise refetches when the user alt-tabs.
- **Retry logic**: Retries once on failure, but _never_ retries on `401`, `403`, or `404` responses.
- **Global `QueryCache.onError`**: Shows `toast.error()` for all failed queries (unless `meta.silent = true`).
- **Global `MutationCache.onError`**: Same for mutations.

**Hook pattern** (every feature follows this):

```ts
// features/[feature]/hooks/use[Feature]s.ts

export function use[Feature]s(params) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => fetch[Feature]s(params) })
}

export function useCreate[Feature]() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => create[Feature](payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      toast.success(t('...'))
    },
    // No onError needed — global MutationCache handles it
  })
}
```

> **Important:** Do **not** write `toast.error()` inside hooks — the global `MutationCache` already handles it. To suppress a toast for a specific query/mutation, pass `meta: { silent: true }`.

---

### HTTP Client (Axios)

`src/lib/api/client.ts` exports a single Axios instance (`apiClient`).

**Request Interceptor:**
- Reads `token` from `authStore.getState()` on every request.
- Injects `Authorization: Bearer <token>` header.

**Response Interceptor (401 handling):**
1. Catches `401 Unauthorized`.
2. If a refresh is already in progress, queues the failed request.
3. Calls `authStore.getState().refreshToken()` — which POSTs to `/auth/refresh` using a _separate_ plain `axios` instance (avoids circular dependency with `apiClient`).
4. On success: replays all queued requests with the new token.
5. On failure: calls `logout()` and dispatches the `auth:unauthorized` window event (the router listens for this to redirect to `/login`).

**403 handling:** Dispatches `auth:forbidden` event. The app shows a toast but keeps the user on the page.

> When connecting to a real backend, ensure `/auth/refresh` accepts the current (expired) JWT in the `Authorization` header and returns `{ token: string }`.

---

### Internationalization (i18n)

- **Supported locales:** `en`, `ru`, `tk` (Turkmen)
- **Translation files:** `src/lib/i18n/locales/{en,ru,tk}.json`
- **Initialization:** `src/lib/i18n/index.ts` — reads the saved language from `localStorage` (`tbbank-lang` key) before initializing so there is no flash of the wrong language.
- **Usage in components:** `const { t } = useTranslation()` → `t('some.key')`
- **Changing language:** Call `useI18nStore().setLanguage('ru')` — it updates both i18next and Zustand.

> **Hard-coded strings in JSX are forbidden.** Every user-facing string must have an entry in all three locale files.

**Adding a new translation key:**
1. Add the key-value pair to `en.json`.
2. Add the same key with the translated value to `ru.json` and `tk.json`.
3. Use `t('your.key')` in the component.

---

### Theming (Light / Dark)

- `ThemeProvider` wraps the app with `next-themes` (`attribute="class"`, `enableSystem={false}`).
- `themeStore` stores the user's preference and applies/removes the `dark` class on `<html>` immediately on store rehydration (no flash).
- All colors use Tailwind CSS semantic tokens (e.g. `bg-background`, `text-foreground`, `border-border`) defined as CSS custom properties in `index.css`. **Avoid raw color classes** like `bg-white` or `text-gray-900`.

---

### Error Handling

Two error boundary wrappers are exported from `src/app/providers/ErrorBoundary.tsx`:

| Component | Where used | Fallback |
|---|---|---|
| `GlobalErrorBoundary` | `main.tsx` — wraps the entire app | Full-screen error message + Reload button |
| `PageErrorBoundary` | Set as `errorElement` on each route | Same, but scoped to the content area |

> **Blank screens are forbidden.** Every boundary renders a meaningful fallback UI.

---

### Form Validation (Zod + RHF)

- Each feature's forms have a dedicated schema at `src/features/[feature]/schemas/[feature].schema.ts`.
- Schemas use `zod` and are connected to React Hook Form via `zodResolver`.
- Types are derived with `z.infer<typeof schema>` — **never** define a separate TypeScript interface for form data.
- Server validation errors are set with RHF's `setError()` on the relevant field.
- `if/else` manual validation is **forbidden**.

**Single-step forms** → use `<FormInput />` (`src/components/formInput.tsx`)  
**Multi-step forms** → use `<StepBarV2 />` (`src/components/stepBarV2.tsx`)

---

## Feature Modules

Each feature lives under `src/features/[feature]/` with this internal structure:

```
[feature]/
├── api/
│   └── [feature]Api.ts     # Types (interfaces), API functions (axios calls)
├── hooks/
│   └── use[Feature]s.ts    # useQuery + useMutation wrappers
├── components/
│   └── [Feature]Form.tsx   # Shared Create/Edit form (mode="create"|"edit")
└── schemas/
    └── [feature].schema.ts # Zod validation schema
```

**Currently implemented features:**

| Feature | Module path |
|---|---|
| Authentication | `features/auth` |
| Loan Orders | `features/loanOrders` |
| Loan Order Mobiles | `features/loanOrderMobiles` |
| Loan Remaining | `features/loanRemaining` |
| Loan Paid-Off Letters | `features/loanPaidOffLetters` |
| Loan Types (Settings) | `features/loanTypes` |
| Required Documents (Settings) | `features/requiredDocuments` |
| Order New Card | `features/orderNewCard` |
| Card Transactions | `features/cardTransactions` |
| Card Requisites | `features/cardRequisites` |
| Card Balance | `features/cardBalance` |
| Card Pins | `features/cardPins` |
| Card Reasons (Settings) | `features/cardReasons` |
| Card Types (Settings) | `features/cardTypes` |
| Visa/Master Payments | `features/visaMasterPayments` |
| Sber Payments | `features/sberPayments` |
| Visa/Master/Sber Settings | `features/visaMasterSberSettings` |
| Operators | `features/operators` |
| All Users | `features/allUsers` |
| Clients | `features/clients` |
| Currency Rates | `features/currencyRates` |
| Online Payment History | `features/onlinePaymentHistory` |
| Roles (Settings) | `features/roles` |
| Permissions (Settings) | `features/permissions` |
| Districts (Settings) | `features/districts` |
| Branches (Settings) | `features/branches` |

---

## Shared Components

### `DataTable` (`src/components/dataTable.tsx`)
Generic paginated table built on TanStack React Table v8. Accepts `ColumnDef[]`, `data[]`, loading state, column visibility/order, pagination controls.

### `DataTableToolbar` (`src/components/dataTableToolbar.tsx`)
Toolbar placed above `DataTable`. Provides: search input, dynamic filter dropdowns, column visibility toggle, column drag-to-reorder, per-page selector, and an action button (usually "Create").

### `FormInput` (`src/components/formInput.tsx`)
Comprehensive single-step form builder. Renders `text`, `select`, `date`, `textarea`, `rich-text` (Tiptap), and `file-upload` fields from a config array. Always paired with RHF + Zod.

### `StepBarV2` (`src/components/stepBarV2.tsx`)
Multi-step form shell with a step indicator bar. Use this when a create/edit form has more than one logical group of fields (Progressive Disclosure).

### `ViewPageComponents` (`src/components/viewPageComponents.tsx`)
`<InfoRow label="...">value</InfoRow>` — the standard layout for detail/view pages. Renders a two-column label-value grid inside a `bg-card` container.

### `StatusBadge` (`src/components/ui/statusBadge.tsx`)
Colored pill badge. Variants: `success` | `warning` | `error` | `info`.

### `FormActions` (`src/components/formActions.tsx`)
Sticky Save / Cancel action bar. Handles the loading state of the submit button.

---

## Route Map

All authenticated routes are nested under `DashboardLayout`. The full list:

```
/login                                      Public

/dashboard

/loan-orders
/loan-orders/create
/loan-orders/:id
/loan-orders/:id/edit

/loan-order-mobiles
/loan-order-mobiles/create
/loan-order-mobiles/:id
/loan-order-mobiles/:id/edit

/loan-remaining
/loan-remaining/create
/loan-remaining/:id
/loan-remaining/:id/edit

/loan-paid-off-letters

/order-new-card
/order-new-card/create
/order-new-card/:id
/order-new-card/:id/edit

/card-transactions
/card-transactions/create
/card-transactions/:id
/card-transactions/:id/edit

/card-requisites
/card-requisites/create
/card-requisites/:id
/card-requisites/:id/edit

/card-balances
/card-balances/create
/card-balances/:id
/card-balances/:id/edit

/card-pins
/card-pins/create
/card-pins/:id
/card-pins/:id/edit

/visa-master                               (list route — note: different from CRUD base)
/visa-master/create
/visa-master/:id
/visa-master/:id/edit

/sber-payments
/sber-payments/create
/sber-payments/:id
/sber-payments/:id/edit

/operators
/operators/create
/operators/:id
/operators/:id/edit

/clients
/clients/create
/clients/:id
/clients/:id/edit

/all-users
/all-users/create
/all-users/:id
/all-users/:id/edit

/currency-rates
/currency-rates/create
/currency-rates/:id
/currency-rates/:id/edit

/visa-master-sber-settings
/visa-master-sber-settings/create
/visa-master-sber-settings/:id/edit        (no view page)

/online-payments-history
/online-payments-history/:id

/settings/users/roles
/settings/users/roles/create
/settings/users/roles/:id
/settings/users/roles/:id/edit

/settings/users/permissions
/settings/users/permissions/create
/settings/users/permissions/:id
/settings/users/permissions/:id/edit

/settings/loan/loan-types
/settings/loan/loan-types/create
/settings/loan/loan-types/:id
/settings/loan/loan-types/:id/edit

/settings/loan/required-documents
/settings/loan/required-documents/create
/settings/loan/required-documents/:id
/settings/loan/required-documents/:id/edit

/settings/card/card-reasons
/settings/card/card-reasons/create
/settings/card/card-reasons/:id
/settings/card/card-reasons/:id/edit

/settings/card/card-types
/settings/card/card-types/create
/settings/card/card-types/:id
/settings/card/card-types/:id/edit

/settings/location/districts
/settings/location/districts/create
/settings/location/districts/:id
/settings/location/districts/:id/edit

/settings/location/branches
/settings/location/branches/create
/settings/location/branches/:id
/settings/location/branches/:id/edit

*                                           → NotFoundPage
```

---

## Development Standards

> This section is the quick-reference summary of `PROJECT_STANDARDS.md`. Read that file for the full spec.

### Adding a new module — checklist

- [ ] Create `src/features/[feature]/api/[feature]Api.ts` — define types and async functions using `apiClient`.
- [ ] Create `src/features/[feature]/schemas/[feature].schema.ts` — Zod schema, export `z.infer<>` type.
- [ ] Create `src/features/[feature]/hooks/use[Feature]s.ts` — wrap in `useQuery` / `useMutation`.
- [ ] Create `src/features/[feature]/components/[Feature]Form.tsx` — shared create/edit form with `mode: 'create' | 'edit'` prop.
- [ ] Create thin page wrappers in `src/pages/[section]/[feature]{Create,View,Edit}/index.tsx`.
- [ ] Register all routes in `src/app/router/index.tsx`.
- [ ] Add sidebar nav entries in `DashboardLayout.tsx → navGroups`.
- [ ] Add all user-facing strings to `en.json`, `ru.json`, `tk.json`.

### Strict rules

| Rule | Detail |
|---|---|
| No `any` | Use `unknown` or define proper interfaces/types. |
| No hard-coded strings | Every text must go through `t('key')`. |
| No duplicate forms | Create/Edit pages must share one `[Feature]Form` component. |
| No bare `try/catch` that swallows errors | Always `console.error` or rethrow. |
| No `toast.error()` in hooks | Global `MutationCache.onError` handles it. Use `meta: { silent: true }` to opt out. |
| Always show loading states | Use `<Spinner />` or `<Skeleton />` while data loads. |
| Disable buttons during mutation | `disabled={mutation.isPending}` on submit buttons. |
| `PageErrorBoundary` on every route | Already set via `errorElement` in the router. |

---

## Known Issues & Gaps

These items exist in the sidebar nav or codebase but are **not yet implemented** — good starting points for the next developer:

| Item | Status | Notes |
|---|---|---|
| **`/settings/language/locale-manager`** | ❌ No route or page | Sidebar entry exists but leads nowhere |
| **`/settings/language/resources`** | ❌ No route or page | Same as above |
| **`/backups`** | ❌ No route or page | Sidebar entry exists |
| **`/logs`** | ❌ No route or page | Sidebar entry exists |
| **`client.ts` uses `any`** | ⚠️ | `failedQueue: any[]` violates the no-`any` rule — should be typed |
| **`authStore` role type** | ⚠️ | `role: 'admin' \| 'manager' \| 'viewer'` — actual role enforcement (RBAC) not wired to UI |
| **`auth:unauthorized` / `auth:forbidden` events** | ⚠️ | Dispatched in `client.ts` but no global listener is registered in `App.tsx` or the router |
| **`useLoanOrders` toast duplication** | ⚠️ | The hook calls `toast.error()` inside `onError` while the global `MutationCache` also does — results in double toasts. Other features may have the same pattern. |
| **`DashboardLayout` sidebar strings** | ⚠️ | Nav item titles use `t("English", "Fallback")` instead of proper i18n keys — inconsistent with the project standard |
| **`AuthLayout`** | ❌ Missing | No dedicated layout for the login page; it renders without a wrapper layout |
| **Mock data** | ⚠️ | All API functions currently return **mock in-memory data**. When connecting a real backend, replace the functions in `[feature]Api.ts` with real `apiClient.get/post/put/delete()` calls. |

---

## Connecting a Real Backend

All API logic is isolated in `src/features/[feature]/api/[feature]Api.ts`. To go live:

1. Set `VITE_API_BASE_URL` in your `.env` file.
2. Open each `[feature]Api.ts`.
3. Replace the mock functions with real Axios calls, for example:

```ts
// Before (mock)
export async function fetchLoanOrders(params: LoanOrdersParams) {
  await delay(600)
  return { data: mockStore, total: mockStore.length, page: 1, perPage: 25 }
}

// After (real)
export async function fetchLoanOrders(params: LoanOrdersParams) {
  const { data } = await apiClient.get<LoanOrdersResponse>('/loan-orders', { params })
  return data
}
```

4. Adjust the response shape to match what your backend returns. Update the TypeScript interfaces in the same file accordingly.
5. Make sure the backend's `/auth/refresh` endpoint returns `{ token: string }` — that is what `authStore.refreshToken()` expects.

---

*Last updated: 2026-05-15 — TBBank Admin v2.0*
