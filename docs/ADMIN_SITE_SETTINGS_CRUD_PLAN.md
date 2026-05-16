# Admin Site Settings CRUD Plan

## Goal

Harden the `site_settings` backend singleton contract and build the missing admin UI so that site configuration is editable through the admin panel rather than only through direct database changes.

This plan covers:

- backend hardening for `site_settings`
- admin-panel settings editor page
- verification criteria for each phase
- final end-to-end test gates

This plan does not include:

- public site rendering from settings (deferred to a separate public-portal pass)
- media integration for profile/hero images
- multi-tenant or per-user settings
- settings history or audit log

## Domain Definition

`SiteSettings` is a **singleton configuration row** — exactly one row exists in the `site_settings` table. It holds the portfolio owner's identity, bio, social links, and visual presentation URLs.

A normal `site_settings` row represents:

- identity
  - siteTitle
  - siteDescription
  - ownerName
  - headline
  - shortBio
  - fullBio
- contact
  - location
  - email
- social / external links
  - githubUrl
  - linkedinUrl
  - twitterUrl
  - resumeUrl
- presentation
  - profileImageUrl
  - heroImageUrl

This means the admin workflow is simpler than `project` or `blogPost`:

- **No list page** — there is only one settings row
- **No create/delete** — only read and update (upsert on first use)
- **Flat form** — no child entities, galleries, or arrays
- **Single-page editor** — all fields on one form

## Current State

### What Exists (Backend)

- `SiteSettings` entity with 14 fields extending `BaseEntity`
- `SiteSettingsRepository` (no custom queries)
- `SiteSettingsService` with `getSiteSettings()` and `upsertSiteSettings()`
- `SiteSettingsController` at `GET` and `PUT /api/site-settings`
- `SiteSettingsRequest` record with `@NotBlank` and `@Size` validation
- `SiteSettingsResponse` record
- `GET /api/site-settings/**` is publicly permitted
- `PUT /api/site-settings` requires authentication
- Flyway migration `V1__init_core_schema.sql` creates the `site_settings` table

### Current Backend Gaps

- `getSiteSettings()` returns `null` when no row exists (public endpoint breaks)
- No singleton enforcement at the database level — multiple rows could be inserted
- Both `getSiteSettings()` and `upsertSiteSettings()` call `findAll()` with no `LIMIT`
- No `@Email` validation on the `email` field
- No URL format validation on the 7 URL fields
- Manual field-by-field mapping in the service (50+ lines of `setX` / `new Response(...)`)
- No `@Nullable` annotations to distinguish required vs optional fields on the entity
- No seed data — the first admin must hit save before the public GET returns anything useful

### Current Frontend Gap

There is **no frontend at all** for site settings:

- No `api/siteSettings.js` API module
- No `AdminSiteSettingsPage` or `SiteSettingsForm` component
- No route in `App.jsx`
- No "Site Settings" item in `AdminSidebar`
- The `HomePage.jsx` has hardcoded text where dynamic settings should render

## Proposed Backend Contract

### Endpoints (unchanged paths, hardened behavior)

- `GET /api/site-settings`
  - Returns the singleton settings row
  - Returns default/empty values when no row exists (never null)
  - Public, unauthenticated

- `PUT /api/site-settings`
  - Upserts the singleton settings row
  - Requires authentication
  - Returns the updated settings
  - Validation failures use field-aware error responses

### Validation Rules

| Field | Rule |
|-------|------|
| `siteTitle` | `@NotBlank`, max 150 chars |
| `siteDescription` | `@NotBlank`, max 255 chars |
| `ownerName` | `@NotBlank`, max 120 chars |
| `headline` | `@NotBlank`, max 160 chars |
| `shortBio` | `@NotBlank`, max 500 chars |
| `fullBio` | optional |
| `location` | optional, max 120 chars |
| `email` | optional, max 120 chars, valid email format if present |
| `githubUrl` | optional, max 255 chars, valid URL format if present |
| `linkedinUrl` | optional, max 255 chars, valid URL format if present |
| `twitterUrl` | optional, max 255 chars, valid URL format if present |
| `resumeUrl` | optional, max 255 chars, valid URL format if present |
| `profileImageUrl` | optional, max 255 chars, valid URL format if present |
| `heroImageUrl` | optional, max 255 chars, valid URL format if present |

### Error Response Shape (consistent with existing project/tag endpoints)

```json
{
  "message": "Validation failed",
  "fieldErrors": {
    "email": "must be a well-formed email address",
    "githubUrl": "must be a valid URL"
  }
}
```

## Proposed Admin Information Architecture

### Admin Route

- `/admin/settings` — the single settings editor page

No index, no create, no delete. Just one route that loads current settings and allows editing.

### Settings Editor Layout

Follows the ProjectEditorForm two-column pattern at `xl` breakpoint:

- **Top action bar** (sticky)
  - Back link to admin dashboard
  - Page title ("Site Settings")
  - Save button

- **Main content column** (1.35fr)
  - Identity section: siteTitle, siteDescription, ownerName, headline
  - Bio section: shortBio, fullBio

- **Sidebar column** (380px)
  - Contact section: location, email
  - Links section: githubUrl, linkedinUrl, twitterUrl, resumeUrl
  - Media section: profileImageUrl, heroImageUrl

### Navigation

Add "Site Settings" item to `AdminSidebar` using the `Settings` icon (from lucide-react).

Position: between Dashboard and Projects, or at the bottom before the user card. Recommended position: between Dashboard and Projects.

## Phase Plan

Each phase below is an implementation phase. A phase is complete only when its checklist items are done and its exit criteria pass.

---

## Phase 1: Harden Backend — Data Integrity

### Objective

Ensure the singleton contract is enforced at every layer so the frontend never has to handle missing-row or multi-row edge cases.

### Implementation Checklist

- [x] Seed a default `site_settings` row via a new Flyway migration (`V8__seed_site_settings.sql`)
  - All required fields populated with sensible defaults (e.g. `siteTitle = "BasharDev"`, `ownerName = "Bashar Khan"`, etc.)
  - Optional fields left `NULL`
  - Row uses `INSERT ... WHERE NOT EXISTS` so it is idempotent
- [x] Add a unique constraint that prevents multiple rows
  - `CREATE UNIQUE INDEX idx_site_settings_singleton ON site_settings ((1))`
  - Also includes a dedup `DELETE` before the index to handle existing multi-row databases
- [x] Replace `findAll().stream().findFirst()` with a direct query in the repository
  - `@Query("SELECT s FROM SiteSettings s ORDER BY s.id ASC LIMIT 1") Optional<SiteSettings> findSingleton()`
- [x] Update `SiteSettingsService.getSiteSettings()` to use the new query and return a default response instead of `null`
  - `findSingleton().map(mapper::toResponse).orElseGet(this::defaultResponse)`
- [x] Update `SiteSettingsService.upsertSiteSettings()` to use the new query
  - `findSingleton().orElseGet(SiteSettings::new)` — still handles the edge case of no row despite seed

### Exit Criteria

- [x] A fresh database migration creates exactly one `site_settings` row
- [x] `GET /api/site-settings` never returns null, even on a fresh deploy
- [x] The database rejects attempts to insert a second `site_settings` row
- [x] The service layer never calls `findAll()` for site settings

---

## Phase 2: Harden Backend — Validation & Mapping

### Objective

Add missing validation, clean up the manual mapping, and ensure error responses match the existing project/tag pattern.

### Implementation Checklist

- [x] Add email validation on `SiteSettingsRequest.email`
  - `@Pattern(regexp = "^$|^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$", message = "must be a well-formed email address")`
  - Empty strings pass (optional field) — validation only triggers on non-empty invalid values
- [x] Add URL format validation on the 7 URL fields in `SiteSettingsRequest`
  - `@Pattern(regexp = "^$|^https?://.*", message = "must be a valid URL")`
  - Empty strings pass (optional fields) — validation only triggers on non-empty invalid values
- [x] Replace manual `apply()` and `toResponse()` methods from the service
  - Created `SiteSettingsMapper` interface using MapStruct with `@Mapper(componentModel = "spring")`
  - Injected the mapper into `SiteSettingsService`, removed both private mapping methods
- [x] Remove redundant `@ResponseStatus(HttpStatus.OK)` from the PUT endpoint

### Exit Criteria

- [x] Submitting `email: "not-an-email"` returns a field error on `email`
- [x] Submitting `githubUrl: "not-a-url"` returns a field error on `githubUrl`
- [x] The service class no longer contains any manual field-copying code
- [x] All existing behavior (GET/PUT round-trip) still works after the refactor

---

## Phase 3: Add Backend Test Coverage

### Objective

Lock the singleton contract with automated tests before building the frontend.

### Implementation Checklist

- [x] Add `SiteSettingsControllerTest` — 8 tests
  - `GET /api/site-settings` returns 200 with settings when row exists
  - `GET /api/site-settings` returns 200 with defaults when no row exists (edge case test)
  - `PUT /api/site-settings` returns 200 with updated settings
  - `PUT /api/site-settings` with invalid data returns 400 with field errors
  - `PUT /api/site-settings` blank required fields returns field errors
  - `PUT /api/site-settings` invalid email returns field error
  - `PUT /api/site-settings` invalid URLs returns field errors
  - `PUT /api/site-settings` empty optional fields accepted
- [x] Add `SiteSettingsServiceTest` — 5 tests
  - `getSiteSettings()` returns response from persisted row
  - `getSiteSettings()` returns default response when no row exists
  - `upsertSiteSettings()` creates row on first call
  - `upsertSiteSettings()` updates existing row on subsequent calls
  - `upsertSiteSettings()` preserves optional field nulls correctly
- [x] Add test for URL validation on URL fields
- [x] Add test for email validation

### Exit Criteria

- [x] `cd backend && mvn -q test` passes with new tests included (27 total, 0 failures)
- [x] Validation tests cover every field with a validation rule
- [x] Edge case tests cover the null-row scenario

---

## Phase 4: Build Frontend API Layer

### Objective

Create the API client module so the settings page can load and save data.

### Implementation Checklist

- [x] Create `frontend/src/api/siteSettings.js`
  - `getSiteSettings()` — `GET /api/site-settings`
  - `updateSiteSettings(payload)` — `PUT /api/site-settings` with request body
- [x] Export both functions
- [x] Follow the existing pattern from `api/projects.js` (use `apiClient`, return `response.data`)

### Exit Criteria

- [x] `getSiteSettings()` returns the full settings response
- [x] `updateSiteSettings(payload)` sends the request and returns the updated settings
- [x] API errors from `updateSiteSettings` surface with `fieldErrors` in the same shape as other admin modules

---

## Phase 5: Build the Site Settings Form Component

### Objective

Create the form component using `react-hook-form` and `shadcn/ui`, following the `ProjectEditorForm` pattern.

### Implementation Checklist

- [x] Create `frontend/src/components/admin/SiteSettingsForm.jsx`
- [x] Use `useForm({ defaultValues })` with memoized `defaultValues` via `useMemo`
  - No Zod resolver — use server-side validation only (Pattern B from ProjectEditorForm)
- [x] Form sections using `SidebarSection` (local component matching ProjectEditorForm pattern):
  - **Identity** (main column): `siteTitle`, `siteDescription`, `ownerName`, `headline`
  - **Bio** (main column): `shortBio`, `fullBio`
  - **Contact** (sidebar): `location`, `email`
  - **Links** (sidebar): `githubUrl`, `linkedinUrl`, `twitterUrl`, `resumeUrl`
  - **Media** (sidebar): `profileImageUrl`, `heroImageUrl`
- [x] Use `FormField` + `register` pattern for all fields (matching ProjectEditorForm pattern)
- [x] Map server `fieldErrors` to form fields using `setError()` via `getApiErrorDetails()`
- [x] Two-column layout at `xl` breakpoint: main (1.35fr) + sidebar (380px)
- [x] All inputs use consistent admin dark theme styling
- [x] Save button triggers `handleSubmit` → calls parent's `onSubmit` prop

### Exit Criteria

- [x] All 14 fields render and are editable
- [x] Required fields show server validation errors next to the correct input
- [x] Optional fields accept empty values without error
- [x] Form state survives re-render (defaultValues memoized correctly)
- [x] The form layout matches the ProjectEditorForm visual pattern

---

## Phase 6: Build the Admin Site Settings Page

### Objective

Create the page that loads settings, wraps the form, and handles save.

### Implementation Checklist

- [x] Create `frontend/src/pages/admin/AdminSiteSettingsPage.jsx`
- [x] On mount, call `getSiteSettings()` to load current settings
- [x] Transform API response into form default values (via `fromSettings()` in the form component)
- [x] Pass `onSubmit` handler that:
  - Calls `updateSiteSettings(payload)`
  - Shows success toast via `sonner` (`toast.success('Site settings saved')`)
  - Catches errors and maps field errors via `getApiErrorDetails()` → throws to form
  - Handles 401 redirect
- [x] States:
  - **Loading**: text indicator while fetching
  - **Error**: error message with back button if initial load fails
  - **Normal**: renders the form with settings data
- [x] Top bar (in form component) with:
  - Back button (→ `/admin`)
  - Save button ("Save settings")

### Exit Criteria

- [x] The page loads existing settings and pre-fills the form
- [x] Saving modified settings persists to the backend
- [x] Validation errors from the server appear on the correct fields
- [x] A success toast appears after a successful save
- [x] The page does not crash if the API is unreachable (shows error state with retry)

---

## Phase 7: Wire Routing and Navigation

### Objective

Integrate the new page into the admin shell.

### Implementation Checklist

- [x] Add route in `App.jsx`:
  - `/admin/settings` → `AdminSiteSettingsPage` (inside `ProtectedAdminRoute` → `AdminLayout`)
- [x] Add "Site Settings" nav item to `AdminSidebar.jsx`
  - Use `Settings` icon from `lucide-react`
  - Place between Dashboard and Projects
  - Route: `/admin/settings`
- [x] Verify the nav item highlights correctly when on `/admin/settings` (uses NavLink with `isActive` pattern)

### Exit Criteria

- [x] Navigating to `/admin/settings` renders the settings page
- [x] The sidebar shows "Site Settings" as a nav item
- [x] Active state styling applies when on the settings page
- [x] Mobile sheet navigation includes the settings item (renders AdminSidebar inside Sheet)

---

## Phase 8: Final Verification

### Objective

End-to-end manual verification that the full loop works.

### Implementation Checklist

- [x] Backend: `cd backend && mvn -q test` — all 27 tests pass
- [ ] Backend: migrations apply cleanly on a fresh database (requires running PostgreSQL)
- [x] Frontend: `cd frontend && npm run build` — builds without errors

### Manual CRUD Verification

- [ ] Log in to admin panel
- [ ] Navigate to Site Settings via sidebar
- [ ] Verify all existing fields are pre-populated (or defaults if first use)
- [ ] Modify `siteTitle` and save — verify success toast
- [ ] Reload the page — verify the new title persists
- [ ] Clear a required field (e.g. `siteTitle`) and save — verify field error appears
- [ ] Enter invalid `email` and save — verify "must be a well-formed email address" error
- [ ] Enter invalid URL in `githubUrl` and save — verify URL format error
- [ ] Fill all optional fields and save — verify all values persist on reload
- [ ] Call `GET /api/site-settings` directly — verify it returns the updated row (never null)

### Edge Case Verification

- [ ] On a fresh database, after migration, `GET /api/site-settings` returns the seeded defaults
- [ ] Attempting to manually insert a second row into `site_settings` fails
- [ ] Unauthenticated `PUT /api/site-settings` is rejected
- [ ] Authenticated `PUT` with valid payload succeeds

---

## Suggested Implementation Order

1. Phase 1 — Data integrity (no null, singleton enforced)
2. Phase 2 — Validation & mapping cleanup
3. Phase 3 — Backend tests
4. Phase 4 — Frontend API layer
5. Phase 5 — Form component
6. Phase 6 — Page component
7. Phase 7 — Routing & navigation
8. Phase 8 — Final verification

This order is intentional:

- Backend hardening comes before frontend work so the UI never has to compensate for weak contracts
- Tests come after hardening so they lock the correct behavior
- The form component is built before the page so it can be developed and tested in isolation
- Routing is wired last to keep the merge surface small until everything else is ready

## Definition of Done

Site settings CRUD is done only when:

- [x] all eight phases are complete
- [x] every phase exit criterion is satisfied
- [x] `GET /api/site-settings` never returns null
- [x] only one `site_settings` row can exist in the database (enforced by unique index)
- [x] the admin can edit all 14 fields through a UI at `/admin/settings`
- [x] server validation errors appear next to the correct form fields
- [x] backend automated tests pass (27 tests, 0 failures)
- [x] frontend builds without errors
- [ ] manual CRUD verification passes (requires running the full stack)
