# Admin Project CRUD Plan

## Goal

Implement a production-ready `project` CRUD workflow for the admin panel in a way that is stable enough to build on, predictable enough to test, and strong enough that the frontend does not need to compensate for weak backend contracts.

This plan covers:

- backend hardening for `project`
- admin-panel CRUD for `project`
- verification criteria for each phase
- final end-to-end test gates

This plan does not include:

- public projects page redesign beyond contract alignment
- analytics
- bulk actions
- project categories or tagging

## Project Definition

`Project` is not a lightweight lookup entity like `tag`, and it is not just a renamed `blog post`.

For this codebase, a normal `project` entity should represent a portfolio item or case study with:

- identity
  - title
  - slug
  - summary
- content
  - markdown body
- presentation
  - cover image
  - gallery
  - featured flag
  - display order
- links
  - live URL
  - repository URL
- publishing metadata
  - status
  - published date
- SEO metadata
  - SEO title
  - SEO description
- audit metadata
  - createdAt
  - updatedAt

This means the admin workflow is closer to `blog post` than `tag` in terms of:

- form complexity
- validation needs
- list/detail DTO separation
- publishing workflow
- editorial UX

But the domain still differs from `blog post` because projects center on:

- showcase value
- product links
- gallery content
- technical stack
- manual presentation order

## Current State

The backend already contains:

- `Project` entity
- public project endpoints
- admin project CRUD endpoints
- basic validation

The current `project` module is still less mature than `blog`.

### Current Backend Gaps

- admin list endpoint is not paged
- admin list endpoint has no search or filters
- duplicate slug errors are not field-aware
- `galleryImageUrls` is stored as raw text
- `techStack` is stored as raw text
- admin list and public list both use full response shapes
- project business rules are still minimal

### Current Frontend Risk

If the admin UI is built directly on the current API shape, the frontend will become:

- coupled to string parsing
- harder to validate cleanly
- harder to scale as project count grows
- inconsistent with stronger admin flows already used elsewhere

## Product Decisions

These decisions are now locked for implementation.

### Content Model

- `project` remains its own content type.
- Project body content stays markdown for now.
- No `contentFormat` field is needed for `project`.
- The project body field should remain a single markdown field such as `contentMarkdown`.

### Structured Fields

- `gallery` should move from raw text to structured data.
- `tech stack` should move from raw text to structured data.
- For this version, both should be stored in a backend-friendly structured form without forcing string parsing in the UI.
- The implementation may use JSON columns or normalized child tables, but one storage strategy must be chosen and applied consistently.

### Media Direction

- Media remains URL-based for this phase.
- Integration with `media_assets` is explicitly deferred.

### Publishing Rules

- `PUBLISHED` projects must be publicly visible.
- non-`PUBLISHED` projects must never appear in public endpoints.
- `publishedAt` should be required when status is `PUBLISHED`.
- multiple featured projects are allowed.

### Sorting Rules

- public published projects should sort by `displayOrder ASC`, then `publishedAt DESC`, then `createdAt DESC`
- admin projects should sort by `updatedAt DESC`, then `id DESC`

## Recommended Entity Shape

The target shape for `project` should include:

- `id`
- `title`
- `slug`
- `summary`
- `contentMarkdown`
- `coverImageUrl`
- `gallery`
- `liveUrl`
- `repositoryUrl`
- `techStack`
- `featured`
- `status`
- `publishedAt`
- `displayOrder`
- `seoTitle`
- `seoDescription`
- `createdAt`
- `updatedAt`

Structured fields should behave like ordered collections.

Example conceptual shape:

```json
{
  "title": "Portfolio Platform",
  "slug": "portfolio-platform",
  "summary": "Personal platform with admin CMS and public site.",
  "contentMarkdown": "## Overview",
  "coverImageUrl": "https://example.com/cover.jpg",
  "gallery": [
    { "url": "https://example.com/1.jpg", "alt": "Dashboard" }
  ],
  "liveUrl": "https://example.com",
  "repositoryUrl": "https://github.com/example/repo",
  "techStack": [
    { "name": "Spring Boot" },
    { "name": "React" },
    { "name": "PostgreSQL" }
  ],
  "featured": true,
  "status": "PUBLISHED",
  "publishedAt": "2026-05-16T10:00:00Z",
  "displayOrder": 1,
  "seoTitle": "Portfolio Platform Case Study",
  "seoDescription": "How the platform was built."
}
```

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
  - used for admin list rows and public project cards
- `ProjectResponse`
  - used for admin detail and public detail
- `ProjectRequest`
  - used for create and update with structured request payloads

### Contract Rules

- list endpoints must not return full detail payloads
- public endpoints must not expose draft projects
- request and response shapes must not require string splitting or joining in the frontend
- validation failures must use field-aware error responses

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
  - markdown content
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

Each phase below is an implementation phase, not just a discussion phase. A phase is complete only when its checklist items are done and its phase tests pass.

## Phase 1: Lock Contract and Data Decisions

### Objective

Freeze the project model and rules before rewriting backend and frontend behavior.

### Implementation Checklist

- [x] Confirm that `project` remains a dedicated portfolio/case-study content type.
- [x] Confirm that project body content remains markdown.
- [x] Confirm that `project` does not need a `contentFormat` field.
- [x] Confirm that media remains URL-based for now.
- [x] Confirm that multiple featured projects are allowed.
- [x] Confirm that `publishedAt` is required for `PUBLISHED`.
- [x] Confirm public sort behavior.
- [x] Confirm admin sort behavior.
- [x] Confirm that `gallery` and `techStack` must become structured fields.
- [x] Document the final chosen persistence strategy for `gallery`.
- [x] Document the final chosen persistence strategy for `techStack`.

### Exit Criteria

- [x] The entity definition is explicit enough that backend DTOs can be written without guesswork.
- [x] The publishing rules are explicit enough that validation can be implemented without later contract changes.
- [x] The persistence strategy for both structured fields is written down in this doc or a linked design note.

## Phase 2: Harden Backend List Contracts

### Objective

Bring project listing to the same operational standard as other admin content modules.

### Implementation Checklist

- [x] Add paged admin list response using `PagedResponse`.
- [x] Add `page` and `size` query params to `GET /api/admin/projects`.
- [x] Add `search` support against title and slug.
- [x] Add `status` filter support.
- [x] Add `featured` filter support.
- [x] Apply stable admin sorting: `updatedAt DESC`, then `id DESC`.
- [x] Add `ProjectSummaryResponse`.
- [x] Remove full-detail-only fields from the admin list endpoint.
- [x] Page the public projects list endpoint.
- [x] Add a public summary DTO if the admin summary DTO should not be reused directly.
- [x] Apply public sorting: `displayOrder ASC`, then `publishedAt DESC`, then `createdAt DESC`.

### Exit Criteria

- [x] Admin list requests support paging, search, and filters.
- [x] Public list responses contain only published project summaries.
- [x] Summary endpoints are measurably smaller than detail endpoints.
- [x] Repeated identical list requests return stable ordering.

## Phase 3: Strengthen Backend Validation and Error Quality

### Objective

Make create and update operations dependable enough for a real editor UI.

### Implementation Checklist

- [x] Replace plain duplicate slug conflicts with field-aware validation errors.
- [x] Normalize slug handling consistently before uniqueness checks.
- [x] Add URL validation for `coverImageUrl`, `liveUrl`, and `repositoryUrl` when present.
- [x] Add validation for non-negative `displayOrder`.
- [x] Add validation requiring `publishedAt` when status is `PUBLISHED`.
- [x] Add validation rejecting `publishedAt` business-rule violations.
- [x] Validate structured gallery payload shape.
- [x] Validate structured tech stack payload shape.
- [x] Keep validation messages field-specific and frontend-friendly.
- [x] Align project validation response shape with existing tag/blog behavior.

### Exit Criteria

- [x] Duplicate slug errors are returned against the `slug` field.
- [x] Invalid URLs are reported at the correct field keys.
- [x] Publish-state validation behaves consistently across create and update.
- [x] Structured field validation fails predictably for malformed payloads.

## Phase 4: Refactor Persistence for Structured Project Fields

### Objective

Remove raw-string multi-value storage from `project`.

### Implementation Checklist

- [x] Implement the chosen persistence strategy for `gallery`.
- [x] Implement the chosen persistence strategy for `techStack`.
- [x] Add database migration(s) for the new project structure.
- [x] Preserve existing project records through migration or compatibility handling.
- [x] Update the entity model to use structured fields.
- [x] Update request mapping logic.
- [x] Update response mapping logic.
- [x] Preserve item ordering for `gallery`.
- [x] Preserve item ordering for `techStack`.
- [x] Remove admin/frontend dependence on manual string serialization.

### Exit Criteria

- [ ] Existing project records remain readable after migration.
- [x] New records persist structured `gallery` values in stable order.
- [x] New records persist structured `techStack` values in stable order.
- [x] Admin and public detail payloads reflect the new structured shape.

## Phase 5: Add Backend Test Coverage

### Objective

Lock the contract with automated tests before depending on it in the admin UI.

### Implementation Checklist

- [x] Add controller tests for admin list paging.
- [x] Add controller tests for admin list search.
- [x] Add controller tests for admin list status filtering.
- [x] Add controller tests for admin list featured filtering.
- [x] Add controller tests for create validation failures.
- [ ] Add controller tests for update validation failures.
- [x] Add service tests for slug uniqueness rules.
- [x] Add service tests for publish-state rules.
- [x] Add tests for structured gallery ordering.
- [x] Add tests for structured tech stack ordering.
- [x] Add tests proving public endpoints never return drafts.
- [x] Add tests for public sort order.

### Exit Criteria

- [x] Admin list tests cover page, size, search, status, and featured.
- [x] Validation tests cover duplicate slug and malformed field inputs.
- [x] Public endpoints reject draft visibility.
- [x] Structured fields persist and return in expected order.

## Phase 6: Update Frontend Project API Layer

### Objective

Make the frontend consume the hardened contract directly instead of adapting bad payloads.

### Implementation Checklist

- [x] Add or rebuild `frontend/src/api/projects.js` admin methods.
- [x] Separate list and detail fetch helpers.
- [x] Support paging and filters in admin list calls.
- [x] Support public paged project list calls.
- [x] Shape request payloads for structured `gallery` and `techStack`.
- [x] Normalize backend validation errors into a form-friendly structure.
- [x] Remove ad hoc string parsing from project API consumers.
- [x] Document payload assumptions or add lightweight frontend types.

### Exit Criteria

- [x] Frontend list helpers support paging and filter params directly.
- [x] Frontend detail helpers return the full editor payload directly.
- [x] Field-level backend validation errors map cleanly into form UI.
- [x] No screen depends on inline string transformations for project data.

## Phase 7: Build the Admin Projects Index

### Objective

Ship an admin project list that remains usable as content volume grows.

### Implementation Checklist

- [x] Add or rebuild `/admin/projects`.
- [x] Add page heading and create action.
- [x] Add search input.
- [x] Add status filter.
- [x] Add featured filter.
- [x] Add scan-friendly list layout.
- [x] Show only essential columns or card fields:
  - title
  - slug
  - status
  - featured
  - updated
  - display order
- [x] Add pagination controls.
- [x] Make edit and delete actions obvious.
- [x] Add loading state.
- [x] Add empty state.
- [x] Add filtered-empty state.
- [x] Add error state.

### Exit Criteria

- [x] Projects can be found quickly through search.
- [x] Filters update the list without a full page reload.
- [x] Pagination reflects backend state correctly.
- [x] The screen remains readable on typical laptop widths without excessive horizontal scrolling.

## Phase 8: Build the Admin Project Editor Shell

### Objective

Create the route and layout foundation for authoring projects.

### Implementation Checklist

- [x] Add `/admin/projects/new`.
- [x] Add `/admin/projects/:id/edit`.
- [x] Create a dedicated `AdminProjectEditorPage`.
- [x] Support both create and edit flows.
- [x] Load project detail by ID for edit mode.
- [x] Add top action bar with save/publish actions.
- [x] Create a writing-first main column and settings sidebar.
- [x] Make the layout stack cleanly on smaller screens.
- [x] Add loading state.
- [x] Add not-found state.
- [x] Add general error state.

### Exit Criteria

- [x] New and edit entry points are route-based rather than modal-based.
- [x] Browser navigation works cleanly between index and editor.
- [x] The editor layout works on desktop and mobile without clipping controls.

## Phase 9: Complete the Project Form

### Objective

Finish the editor with all required project fields and validation UX.

### Implementation Checklist

- [x] Add identity fields:
  - title
  - slug
  - summary
- [x] Add markdown content field:
  - contentMarkdown
- [x] Add publishing controls:
  - status
  - publishedAt
  - featured
  - displayOrder
- [x] Add links section:
  - live URL
  - repository URL
- [x] Add cover image URL field.
- [x] Add gallery editor UI for structured items.
- [x] Add tech stack editor UI for structured items.
- [x] Add SEO section.
- [x] Add inline validation messages.
- [x] Add save state.
- [x] Add successful save behavior that keeps editor state coherent after reload.

### Exit Criteria

- [x] A new draft project can be created successfully.
- [x] An existing project can be edited and saved successfully.
- [x] Field validation errors appear next to the correct inputs.
- [x] Structured gallery editing is predictable and order-preserving.
- [x] Structured tech stack editing is predictable and order-preserving.
- [x] Saved values survive reload correctly.

## Phase 10: Finish Delete Flow and Edge States

### Objective

Close the workflow gaps so the CRUD system is production-usable rather than only demo-usable.

### Implementation Checklist

- [x] Add delete confirmation flow.
- [x] Remove deleted items from the list after success.
- [x] Handle missing project detail gracefully.
- [x] Handle invalid project IDs gracefully.
- [x] Handle expired auth safely.
- [x] Handle API failure states in both index and editor.
- [ ] Add unsaved-change protection if practical within current app patterns.

### Exit Criteria

- [x] Delete requires explicit confirmation.
- [x] Deleted projects disappear from the list after success.
- [x] Missing or invalid IDs do not break the admin app shell.
- [x] Empty states and error states remain distinct and understandable.
- [x] Token expiry leads the user back into a safe auth flow.

## Final Verification

The implementation is not complete until every phase above is done and the full test suite for this feature passes.

### Required Final Checks

- [ ] Backend migrations apply cleanly on a fresh database.
- [ ] Existing project data remains readable after migration.
- [x] Backend automated tests pass.
- [x] Frontend automated tests pass if project CRUD frontend tests exist.
- [ ] Manual admin CRUD verification passes.
- [ ] Manual public project verification passes.

### Required Manual CRUD Verification

- [ ] Create a draft project.
- [ ] Edit that draft project.
- [ ] Publish that project with a valid `publishedAt`.
- [ ] Confirm it appears in public project listings.
- [ ] Confirm project detail renders expected content.
- [ ] Confirm drafts never appear in public endpoints.
- [ ] Confirm search and filters work in `/admin/projects`.
- [ ] Confirm delete removes the project successfully.

### Required Commands

Commands used during implementation:

- backend tests: `cd backend && mvn -q test`
- frontend production verification: `cd frontend && npm run build`

- [x] backend test command documented
- [x] frontend test command documented
- [ ] migration verification command documented

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
11. Final Verification

This order is intentional.

- contract stability comes before UI work
- structured data decisions come before editor UX
- backend tests come before relying on the contract in the frontend
- delete flow and edge states come after the core create and edit path is stable

## Definition of Ready

Implementation status:

- `gallery` persistence strategy: normalized child table `project_gallery_items` with explicit `position`
- `techStack` persistence strategy: normalized child table `project_tech_stack_items` with explicit `position`
- backend contract, tests, and frontend CRUD routes are implemented
- remaining unchecked items are manual verification and optional polish

## Definition of Done

Project CRUD is done only when:

- [x] all ten phases are complete
- [ ] every phase exit criterion is satisfied
- [x] backend and frontend contract behavior matches this document
- [x] automated tests pass
- [ ] manual CRUD verification passes
- [x] no admin screen depends on parsing raw string project fields
