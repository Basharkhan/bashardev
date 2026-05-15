# Admin Project CRUD Plan

## Goal

Add a production-ready `project` CRUD workflow for the admin panel without forcing the frontend to compensate for weak backend contracts.

This plan covers:

- backend hardening for `project`
- admin-panel CRUD for `project`
- verification criteria for each phase

This plan does not yet include:

- public projects page redesign
- analytics
- bulk actions
- project categories or tagging

## Current State

The backend already contains a `project` module with:

- `Project` entity
- public project endpoints
- admin project CRUD endpoints
- basic validation

The main issue is that the `project` module is less mature than `blog` and `tags`.

### Current Backend Gaps

- admin list endpoint is not paged
- admin list endpoint has no search or filters
- duplicate slug errors are not field-aware
- `galleryImageUrls` is stored as raw text
- `techStack` is stored as raw text
- admin list and public list both use full response shapes
- project business rules are still minimal

### Current Frontend Implication

If the admin panel is built directly on top of the current backend shape, the UI will likely become:

- over-coupled to string parsing
- harder to validate cleanly
- harder to scale once project count grows
- inconsistent with the stronger blog and tag admin flows

## Product Direction

### Decisions

- Treat `project` as a content-heavy admin workflow, closer to `blog post` than `tag`.
- Harden backend contracts before building the full admin UI.
- Use paged admin listing even if project count is currently small.
- Separate `summary` and `detail` response shapes.
- Replace stringly-typed multi-value fields with structured data.

### Recommended Data Direction

For the first solid version, `project` should support:

- core identity
  - title
  - slug
  - summary
- content
  - long-form description or content
- presentation
  - cover image
  - gallery items
  - featured flag
  - display order
- links
  - live URL
  - repository URL
- metadata
  - status
  - published date
  - SEO title
  - SEO description
- stack
  - structured tech stack items

## Proposed Backend Contract

### Public

- `GET /api/projects?page=&size=`
  - paged published project summaries
- `GET /api/projects/slug/{slug}`
  - full published project detail

### Admin

- `GET /api/admin/projects?page=&size=&search=&status=&featured=`
  - paged project summaries
- `GET /api/admin/projects/{id}`
  - full project detail
- `POST /api/admin/projects`
  - create project
- `PUT /api/admin/projects/{id}`
  - update project
- `DELETE /api/admin/projects/{id}`
  - delete project

### DTO Direction

- `ProjectSummaryResponse`
  - for admin list and public cards
- `ProjectResponse`
  - for admin detail and public detail
- `ProjectRequest`
  - structured request payload

## Proposed Admin Information Architecture

### Admin Routes

- `/admin/projects`
  - projects index
- `/admin/projects/new`
  - create project
- `/admin/projects/:id/edit`
  - edit project

### Projects Index

- search
- quick filters
  - all
  - draft
  - published
  - featured
- scan-friendly list
- clear create action
- pagination

### Project Editor

- top action bar
  - back
  - save draft
  - publish or update
- main content column
  - title
  - summary
  - long-form content
- secondary settings column
  - status
  - publish date
  - featured
  - display order
  - cover image
  - gallery
  - links
  - tech stack
  - SEO

## Phase Plan

## Phase 1: Backend Contract Review and Data Model Decision

### Scope

Lock the backend design before writing CRUD UI code.

### Checklist

- [ ] Confirm whether `gallery` will be stored as:
  - child table, or
  - JSON array
- [ ] Confirm whether `tech stack` will be stored as:
  - child table, or
  - JSON array
- [ ] Confirm public sorting rules for published projects.
- [ ] Confirm whether multiple featured projects are allowed.
- [ ] Confirm whether `publishedAt` is required for `PUBLISHED`.
- [ ] Confirm whether project detail content remains markdown or changes to richer content later.
- [ ] Confirm whether media should stay URL-based or integrate with `media_assets`.

### Test Criteria

- [ ] There is one documented decision for gallery storage.
- [ ] There is one documented decision for tech stack storage.
- [ ] Public and admin sorting rules are explicit.
- [ ] Publish-state behavior is explicit.
- [ ] No frontend form work starts before these decisions are agreed.

## Phase 2: Backend Admin List Hardening

### Scope

Bring project listing to the same standard as blog and tags.

### Checklist

- [ ] Add paged admin list response using `PagedResponse`.
- [ ] Add `page` and `size` query params.
- [ ] Add `search` query param for title or slug.
- [ ] Add `status` filter.
- [ ] Add `featured` filter.
- [ ] Define stable admin sort behavior.
- [ ] Add `ProjectSummaryResponse`.
- [ ] Keep full detail payload out of the admin list endpoint.

### Test Criteria

- [ ] `GET /api/admin/projects` supports paging.
- [ ] Search returns expected title or slug matches.
- [ ] Status filtering returns only matching records.
- [ ] Featured filtering returns only featured records when requested.
- [ ] Admin list payload is smaller than full detail payload.
- [ ] Sort order is stable across repeated requests.

## Phase 3: Backend Validation and Error Quality

### Scope

Make project create/update dependable for the admin UI.

### Checklist

- [ ] Replace plain duplicate slug conflict with field-aware validation.
- [ ] Add URL validation for cover, live, and repository URLs if those fields are present.
- [ ] Add validation for non-negative display order.
- [ ] Add publish-state validation rules.
- [ ] Normalize slug handling consistently.
- [ ] Validate structured gallery payload.
- [ ] Validate structured tech stack payload.
- [ ] Keep error messages frontend-friendly and field-specific.

### Test Criteria

- [ ] Duplicate slug returns a field-level error for `slug`.
- [ ] Invalid URLs return field-level errors.
- [ ] Invalid publish state is rejected consistently.
- [ ] Invalid gallery or tech stack payload is rejected predictably.
- [ ] Validation failures use the same response shape pattern as tags/blog.

## Phase 4: Backend Detail and Persistence Refactor

### Scope

Move project storage away from weak raw-string fields.

### Checklist

- [ ] Add migration for structured gallery persistence.
- [ ] Add migration for structured tech stack persistence.
- [ ] Update entity model to reflect structured data.
- [ ] Update request mapping logic.
- [ ] Update response mapping logic.
- [ ] Preserve existing project data via migration or compatibility transform.
- [ ] Re-check public detail and admin detail payloads after refactor.

### Test Criteria

- [ ] Existing project records remain readable after migration.
- [ ] Gallery items persist in defined order.
- [ ] Tech stack items persist in defined order.
- [ ] Admin create and update no longer depend on raw text serialization.
- [ ] Public detail responses still render required content.

## Phase 5: Backend Test Coverage

### Scope

Add enough backend coverage that frontend work is not blocked by contract uncertainty.

### Checklist

- [ ] Add controller tests for admin list filters and paging.
- [ ] Add controller tests for create and update validation failures.
- [ ] Add service tests for slug uniqueness.
- [ ] Add service tests for publish-state rules.
- [ ] Add tests for gallery and tech stack ordering.
- [ ] Add tests for public published-only access.

### Test Criteria

- [ ] Admin list tests cover page, size, search, status, and featured.
- [ ] Validation tests cover duplicate slug and malformed field inputs.
- [ ] Public endpoints never return draft projects.
- [ ] Structured fields persist and return in expected order.

## Phase 6: Frontend Admin API Layer

### Scope

Prepare the frontend to consume the improved backend contract cleanly.

### Checklist

- [ ] Add `frontend/src/api/projects.js` admin methods if missing or incomplete.
- [ ] Separate list and detail fetch helpers.
- [ ] Add request payload shaping for structured gallery and tech stack fields.
- [ ] Normalize API error handling for field-aware project errors.
- [ ] Add lightweight frontend types or documented response assumptions.

### Test Criteria

- [ ] Admin list fetch supports paging and filters.
- [ ] Admin detail fetch returns full editor payload.
- [ ] Field-level backend errors can be mapped into form UI without custom hacks.
- [ ] No screen performs inline ad hoc payload transformation.

## Phase 7: Frontend Projects Index

### Scope

Build a project management index that stays readable as project count grows.

### Checklist

- [ ] Add `/admin/projects` page if missing or rebuild it on the new API.
- [ ] Add clear page heading and create action.
- [ ] Add search input.
- [ ] Add status filter.
- [ ] Add featured filter.
- [ ] Add summary cards only if they improve scanning.
- [ ] Use a row/card hybrid layout rather than an overly wide table.
- [ ] Show essential fields only:
  - title
  - slug
  - status
  - featured
  - updated
  - display order
- [ ] Add pagination controls.
- [ ] Keep edit and delete actions obvious.

### Test Criteria

- [ ] Projects can be found quickly by search.
- [ ] Filters work without full page reload.
- [ ] The index remains readable at laptop widths.
- [ ] The screen does not require excessive horizontal scrolling.
- [ ] Pagination reflects backend state accurately.

## Phase 8: Frontend Project Editor Foundation

### Scope

Build the full-page editor route structure and layout before polishing every field group.

### Checklist

- [ ] Add `/admin/projects/new`.
- [ ] Add `/admin/projects/:id/edit`.
- [ ] Create a dedicated `AdminProjectEditorPage`.
- [ ] Support both create and edit flows.
- [ ] Add top action bar with save/publish actions.
- [ ] Create a writing-first main column and settings sidebar.
- [ ] Stack sections cleanly on smaller screens.

### Test Criteria

- [ ] New and edit entry points use routes rather than modals.
- [ ] Browser navigation works naturally between index and editor.
- [ ] Layout works on desktop and mobile without clipping controls.
- [ ] Long forms remain usable without horizontal scrolling.

## Phase 9: Frontend Project Form Completion

### Scope

Finish the project form with all required field groups and validation behavior.

### Checklist

- [ ] Add core fields:
  - title
  - slug
  - summary
  - content
- [ ] Add publishing controls:
  - status
  - publishedAt
  - featured
  - displayOrder
- [ ] Add links section:
  - live URL
  - repository URL
- [ ] Add cover image field or picker.
- [ ] Add gallery editor UI.
- [ ] Add tech stack editor UI.
- [ ] Add SEO section.
- [ ] Add inline validation messages.
- [ ] Add loading and save states.

### Test Criteria

- [ ] A new draft project can be created successfully.
- [ ] An existing project can be edited and saved successfully.
- [ ] Field validation errors appear next to the correct inputs.
- [ ] Structured gallery editing is predictable.
- [ ] Structured tech stack editing is predictable.
- [ ] Saving preserves values after reload.

## Phase 10: Frontend Delete and Edge-State Handling

### Scope

Finish the workflow around destructive actions and unusual states.

### Checklist

- [ ] Add delete confirmation flow.
- [ ] Handle missing project detail gracefully.
- [ ] Handle expired auth gracefully.
- [ ] Handle empty project list state.
- [ ] Handle filtered empty state.
- [ ] Handle API failure states in both index and editor.
- [ ] Consider unsaved-change protection if practical.

### Test Criteria

- [ ] Delete requires explicit confirmation.
- [ ] Deleted project disappears from the list after success.
- [ ] Missing or invalid IDs do not break the admin app shell.
- [ ] Empty and error states are distinct and understandable.
- [ ] Token expiry returns the user to a safe auth flow.

## Suggested Implementation Order

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7
8. Phase 8
9. Phase 9
10. Phase 10

This order is intentional.

- Backend contract stability should come before admin form implementation.
- Structured data decisions should come before frontend field UX.
- Index work should land before the editor only if the list contract is ready.

## Review Questions

Before implementation starts, these are the most important review decisions:

1. Should `gallery` and `tech stack` be normalized tables or JSON payloads?
2. Should project content stay markdown for now?
3. Should project media remain URL-based or integrate with the media library?
4. Should the public projects endpoint become paged now, or only the admin endpoint?
5. Should `featured` affect public ordering directly, and if yes, how?

## Definition of Ready

The project CRUD implementation is ready to begin when:

- [ ] the data-model decision for gallery and tech stack is approved
- [ ] the admin API contract is approved
- [ ] the route structure is approved
- [ ] validation rules are approved
- [ ] list vs detail DTO separation is approved
