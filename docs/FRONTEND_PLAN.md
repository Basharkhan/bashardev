# Frontend Execution Plan

## Goal

Turn the existing React and Vite scaffold into a real product frontend that:

- consumes the Spring Boot API
- renders public portfolio and blog content dynamically
- supports protected admin workflows
- stays simple enough to ship the MVP quickly

## Current State

The frontend already has:

- React Router route structure
- public and admin layouts
- a visual baseline with Tailwind CSS
- placeholder pages for public and admin routes

The frontend does not yet have:

- a shared API layer
- data fetching and error handling
- admin authentication flow
- CRUD forms and management screens
- loading, empty, and failure states for real content

## Routes That Already Exist

Current frontend routes in `frontend/src/App.jsx`:

- `/`
- `/projects`
- `/projects/:slug`
- `/blog`
- `/blog/:slug`
- `/contact`
- `/admin`

This matters because the initial implementation should extend the current route tree instead of redesigning it immediately.

## Backend Endpoints Already Available

These backend endpoints already exist and should drive the first frontend integrations:

### Public

- `GET /api/projects`
- `GET /api/projects/slug/:slug`
- `GET /api/blog-posts?page=0&size=10`
- `GET /api/blog-posts/slug/:slug`
- `GET /api/site-settings`

### Admin/Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/site-settings`

This means the frontend can already start Phase 1, Phase 2, and part of Phase 3 and Phase 5 without waiting for new backend work.

## Working Principle

Build the frontend in vertical slices instead of trying to complete all screens at once.

Each slice should:

- connect to a real backend endpoint
- handle loading, empty, success, and error states
- be visually acceptable on desktop and mobile
- leave the codebase cleaner than before

## Phase 1: Foundation

### Objective

Prepare the frontend to talk to the backend reliably.

### Tasks

1. Create a small API client layer using `axios`
2. Read the backend base URL from `VITE_API_BASE_URL`
3. Add shared request helpers for:
   - JSON requests
   - auth headers
   - error normalization
4. Create a small shared app structure such as:
   - `src/api/`
   - `src/components/`
   - `src/features/`
   - `src/utils/`
5. Add a simple pattern for page states:
   - loading
   - empty
   - error
6. Add a small auth storage helper for:
   - saving token
   - reading token
   - removing token

### Suggested File Additions

- `src/api/client.js`
- `src/api/projects.js`
- `src/api/blogPosts.js`
- `src/api/siteSettings.js`
- `src/api/auth.js`
- `src/utils/httpError.js`
- `src/utils/authStorage.js`
- `src/components/ui/LoadingState.jsx`
- `src/components/ui/EmptyState.jsx`
- `src/components/ui/ErrorState.jsx`

### Output

At the end of this phase, the frontend can make clean requests to the backend without duplicating fetch logic on each page.

## Phase 2: Public Read Experience

### Objective

Replace placeholder public pages with real API-driven content.

### Order

Start with the smallest reliable read flows first.

### Tasks

1. Wire `ProjectsPage`
   - fetch published projects
   - show cards or list items
   - add loading and empty states
2. Wire `ProjectDetailPage`
   - fetch a project by slug
   - render markdown or structured content
   - handle missing slug with a proper not-found state
3. Wire `BlogListPage`
   - fetch published blog posts
   - show excerpt, date, and read link
4. Wire `BlogDetailPage`
   - fetch post by slug
   - render markdown using `react-markdown`
5. Improve `HomePage`
   - pull featured content or latest content from API
   - replace roadmap copy with real data where possible
6. Decide what to do with `ContactPage`
   - keep it static temporarily, or
   - implement contact submission once the backend endpoint exists

### Implementation Notes

- Use `GET /api/projects` for `ProjectsPage`
- Use `GET /api/projects/slug/:slug` for `ProjectDetailPage`
- Use `GET /api/blog-posts?page=0&size=10` for `BlogListPage`
- Use `GET /api/blog-posts/slug/:slug` for `BlogDetailPage`
- Use `GET /api/site-settings` to improve `HomePage`
- Keep `ContactPage` static until a contact endpoint is ready

### Output

Public visitors can browse live projects and blog content without hardcoded placeholders.

## Phase 3: Admin Authentication

### Objective

Protect the admin area and make login functional.

### Tasks

1. Add an admin login page under `/admin/login`
2. Connect login form to the backend auth endpoint
3. Store the JWT for MVP use
4. Add protected route behavior for `/admin`
5. Add a current-user check on app start or admin entry
6. Add logout behavior
7. Handle expired or invalid tokens gracefully

### Route Changes

Add routes such as:

- `/admin/login`
- protected `/admin`

Recommended behavior:

- unauthenticated users attempting `/admin` should be redirected to `/admin/login`
- authenticated users visiting `/admin/login` should be redirected to `/admin`

### Output

The admin area is no longer publicly accessible and the app can identify an authenticated admin user.

## Phase 4: Admin Dashboard Shell

### Objective

Turn the admin layout into a usable application shell before building full CRUD.

### Tasks

1. Expand admin navigation
2. Add sections for:
   - dashboard
   - site settings
   - projects
   - blog posts
3. Add basic dashboard summary cards
4. Show the authenticated admin identity in the layout
5. Add navigation states and responsive behavior

### Suggested Admin Routes

- `/admin`
- `/admin/site-settings`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/:id/edit`
- `/admin/blog-posts`
- `/admin/blog-posts/new`
- `/admin/blog-posts/:id/edit`

### Output

The admin side becomes a navigable tool instead of a single placeholder page.

## Phase 5: Site Settings Management

### Objective

Make homepage and site identity content editable from the admin area.

### Tasks

1. Add a site settings form screen
2. Load existing values from the backend
3. Save updates back to the backend
4. Validate required fields
5. Reflect saved content on public pages where applicable

### API Mapping

- read: `GET /api/site-settings`
- save: `PUT /api/site-settings`

### Output

The main public site identity can be managed without code edits.

## Phase 6: Project Management

### Objective

Support full project CRUD in the admin area and reflect it publicly.

### Tasks

1. Add an admin projects list page
2. Add project create form
3. Add project edit form
4. Add delete action with confirmation
5. Support fields such as:
   - title
   - slug
   - summary
   - markdown content
   - cover image URL
   - repository URL
   - live URL
   - featured
   - status
6. Revalidate the public project pages after changes

### Output

Projects can be created and maintained entirely from the frontend admin UI.

## Phase 7: Blog Management

### Objective

Support full blog CRUD and public post delivery.

### Tasks

1. Add an admin blog posts list page
2. Add blog create form
3. Add blog edit form
4. Add delete action with confirmation
5. Support fields such as:
   - title
   - slug
   - excerpt
   - markdown content
   - cover image URL
   - featured
   - status
   - published date if needed
6. Ensure the public blog list and detail pages stay aligned with backend rules

### Output

The blog becomes manageable from the admin interface and visible on the public site.

## Phase 8: Shared UI Cleanup

### Objective

Reduce duplication after the first real pages exist.

### Tasks

1. Extract reusable form inputs
2. Extract reusable page headers and section shells
3. Extract shared status UI:
   - loading blocks
   - empty states
   - error notices
4. Standardize button and form styling
5. Keep extraction practical and avoid over-abstraction

### Output

The codebase becomes easier to extend without turning into a component graveyard.

## Phase 9: UX and Responsiveness

### Objective

Polish the experience after core flows work.

### Tasks

1. Review mobile navigation behavior
2. Improve spacing and hierarchy on smaller screens
3. Add success and error feedback for forms
4. Improve not-found and failure experiences
5. Add subtle motion only where it improves clarity
6. Review long markdown rendering for readability

### Output

The product feels intentional and usable, not just technically complete.

## Phase 10: Testing and Hardening

### Objective

Reduce regressions in core frontend flows.

### Tasks

1. Add tests for route protection
2. Add tests for API helpers where useful
3. Add tests for critical page states
4. Test login, logout, and token expiry behavior manually
5. Verify all public and admin flows against the live backend
6. Run lint and fix drift before each major merge

### Output

The frontend has enough protection to support iteration without constant breakage.

## Delivery Checklist

Use this as the working implementation checklist.

### Slice 1: Foundation

- [ ] Create `src/api/client.js`
- [ ] Read `VITE_API_BASE_URL`
- [ ] Add shared GET/POST/PUT request helpers
- [ ] Add token storage helper
- [ ] Add shared loading, empty, and error components

### Slice 2: Public Projects

- [ ] Connect `ProjectsPage` to `GET /api/projects`
- [ ] Add project list loading state
- [ ] Add project list empty state
- [ ] Add project list error state
- [ ] Connect `ProjectDetailPage` to `GET /api/projects/slug/:slug`
- [ ] Add project detail not-found state

### Slice 3: Public Blog

- [ ] Connect `BlogListPage` to `GET /api/blog-posts`
- [ ] Render paged blog response correctly
- [ ] Connect `BlogDetailPage` to `GET /api/blog-posts/slug/:slug`
- [ ] Render markdown safely and clearly

### Slice 4: Public Home

- [ ] Connect `HomePage` to `GET /api/site-settings`
- [ ] Replace placeholder copy with editable content
- [ ] Pull in featured projects or latest posts if needed

### Slice 5: Admin Auth

- [ ] Create `/admin/login`
- [ ] Connect login form to `POST /api/auth/login`
- [ ] Save JWT
- [ ] Protect `/admin`
- [ ] Fetch current user from `GET /api/auth/me`
- [ ] Add logout

### Slice 6: Admin Shell

- [ ] Expand admin navigation
- [ ] Add site settings route
- [ ] Add projects list route
- [ ] Add blog posts list route
- [ ] Show current admin identity

### Slice 7: Site Settings

- [ ] Create site settings form
- [ ] Load current values
- [ ] Save updates with validation
- [ ] Reflect updates publicly

### Slice 8: Projects CRUD

- [ ] Add project list screen
- [ ] Add create screen
- [ ] Add edit screen
- [ ] Add delete action
- [ ] Add success and error feedback

### Slice 9: Blog CRUD

- [ ] Add blog list screen
- [ ] Add create screen
- [ ] Add edit screen
- [ ] Add delete action
- [ ] Add success and error feedback

### Slice 10: Hardening

- [ ] Review responsive behavior
- [ ] Add basic route guard tests
- [ ] Add API helper tests if justified
- [ ] Run lint cleanly
- [ ] Verify all key flows manually

## First Build Target

The first concrete build target should be limited to:

- shared API client
- `ProjectsPage`
- `ProjectDetailPage`

Avoid starting with auth and CRUD first. The public read flow is the fastest way to validate the integration and establish the frontend patterns.

## Recommended MVP Sequence

If speed matters most, do the following in order:

1. Phase 1 foundation
2. Phase 2 public projects
3. Phase 2 public blog
4. Phase 3 admin authentication
5. Phase 4 admin dashboard shell
6. Phase 5 site settings
7. Phase 6 project management
8. Phase 7 blog management

This sequence gets the public site real first, then makes admin useful.

## Immediate Next Step

The best next implementation slice is:

1. create the shared API client
2. wire `VITE_API_BASE_URL`
3. connect `ProjectsPage`
4. connect `ProjectDetailPage`

Reason:

- it is small enough to finish quickly
- it validates the frontend-backend integration path
- it establishes the patterns the rest of the app can follow

## Definition of Done for Frontend MVP

The frontend MVP is done when:

- public pages load real project and blog data from the backend
- admin login works
- admin routes are protected
- site settings can be edited
- projects can be created, edited, and deleted
- blog posts can be created, edited, and deleted
- the app works cleanly on desktop and mobile
- error and loading states are present on all important screens
