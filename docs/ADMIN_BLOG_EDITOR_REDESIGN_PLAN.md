# Admin Blog Editor Redesign Plan

## Goal

Redesign the admin blog experience from a constrained modal workflow into a full-page editor optimized for desktop authoring, while remaining mobile-friendly for management and light edits.

This plan covers the admin experience only. Public blog changes are intentionally out of scope for now.

## Product Direction

### Decisions

- Replace the create/edit modal with a dedicated full-page editor.
- Keep the current blog page as a posts index and management screen.
- Support `featured posts` as a first-class post attribute in the index and editor.
- Support `related posts` with `manual selection only` for the first implementation.
- Optimize for desktop writing flow first, with responsive behavior for tablet and mobile.

### Working Model

- `Posts index` is for discovery, filtering, and entry into editing.
- `Post editor` is for writing, publishing, and metadata management.
- Heavy secondary workflows such as media browsing should not permanently compete with the writing canvas.

## Proposed Information Architecture

### Admin Routes

- `/admin/blog-posts`
  - Posts index
- `/admin/blog-posts/new`
  - Create post editor
- `/admin/blog-posts/:id/edit`
  - Edit post editor

### Editor Layout

- Sticky top action bar
  - back
  - save draft
  - publish or update
  - save state
- Main content column
  - title
  - excerpt
  - editor
  - optional preview tab or toggle
- Secondary sidebar on desktop
  - status
  - publish date
  - featured toggle
  - cover image
  - tags
  - related posts
  - SEO
- Stacked sections on small screens

## Better Idea Than a Direct Modal-to-Page Swap

Yes: do not just move the existing modal form into a page unchanged.

Instead:

- Split the experience into `index` and `editor` responsibilities.
- Convert always-visible secondary panels into grouped, collapsible editor sections.
- Treat media picking as a focused sub-workflow, likely drawer- or section-based, instead of leaving the full media grid open all the time.
- Replace the always-on preview block with a `Write / Preview` switch.

This keeps the full-page editor from becoming a bigger version of the same congestion problem.

## Phase Plan

### Phase 1: Route and Layout Foundation

#### Scope

Create the new editor routes and page-level structure without changing every workflow at once.

#### Checklist

- [x] Add `/admin/blog-posts/new` route.
- [x] Add `/admin/blog-posts/:id/edit` route.
- [x] Create a dedicated `AdminBlogPostEditorPage`.
- [x] Move create and edit entry points from modal actions to route navigation.
- [x] Keep `/admin/blog-posts` focused on listing and management.
- [x] Remove modal usage from the blog posts page.
- [x] Ensure browser back/forward works naturally between list and editor.

#### Test Criteria

- [x] Clicking `New post` opens the full-page editor route.
- [x] Clicking `Edit` on an existing post opens the edit route for that post.
- [x] Reloading the editor route preserves access to the editor page.
- [x] Navigating back returns to the posts index without broken state.
- [x] No modal is used for create or edit.

### Phase 2: Editor Layout and Writing Flow

#### Scope

Build a writing-first page layout with clearer hierarchy and less visual density.

#### Checklist

- [x] Add a sticky top action bar with primary actions.
- [x] Create a wide main column for title, excerpt, and content editing.
- [x] Move settings into a right sidebar for desktop layouts.
- [x] Stack sidebar sections under content on smaller screens.
- [x] Add grouped sections for `Publishing`, `Media`, `Tags`, `Related posts`, and `SEO`.
- [x] Replace the always-visible preview block with a `Write / Preview` control.
- [x] Reduce decorative borders and competing visual boxes where possible.

#### Test Criteria

- [x] On desktop, the writing area is visually dominant.
- [x] On tablet/mobile, the layout stacks cleanly without clipped controls.
- [x] The action bar remains reachable while scrolling long content.
- [x] Preview can be opened without losing editor content.
- [x] The page feels usable without horizontal scrolling at standard breakpoints.

### Phase 3: Posts Index Simplification

#### Scope

Make the blog index better for scanning and management.

#### Checklist

- [x] Reduce visible columns to essential management fields.
- [x] Keep `featured` visible in the index.
- [x] Add quick filters for `All`, `Draft`, `Published`, and `Featured`.
- [x] Add search support for title or slug.
- [x] Make rows easier to scan with improved spacing and hierarchy.
- [x] Keep destructive actions clear but visually secondary.

#### Test Criteria

- [x] Posts can be found quickly by status and search.
- [x] Table content remains readable on laptop widths.
- [x] The list does not require scanning across excessive columns.
- [x] Editing a post from the list is one clear action.

### Phase 4: Related Posts Support

#### Scope

Implement manual related-post selection in the admin experience and backend model.

#### Checklist

- [x] Design the backend relationship for related posts.
- [x] Add migration support for related-post associations.
- [x] Extend admin blog post response payloads to include related post data.
- [x] Extend create and update request payloads to accept related post IDs.
- [x] Add related post picker UI in the editor.
- [x] Exclude the current post from selectable related posts.
- [x] Prevent duplicate related selections.
- [x] Decide and enforce whether relation is one-way or mirrored.

#### Test Criteria

- [x] An editor can manually attach related posts to a blog post.
- [x] The current post cannot be linked to itself.
- [x] Duplicate related entries are prevented.
- [x] Saved related-post selections persist after reload.
- [x] Edit flow works for both draft and published posts.

### Phase 5: Featured Post Workflow Refinement

#### Scope

Keep featured-post behavior clear and efficient in the editor and index.

#### Checklist

- [x] Keep the featured toggle visible and easy to use in the editor.
- [x] Surface featured status clearly in the posts index.
- [x] Add a filter for featured posts.
- [x] Confirm whether multiple featured posts are allowed.
- [ ] If needed, define ordering behavior for multiple featured posts later.

#### Test Criteria

- [x] An editor can mark and unmark a post as featured.
- [x] Featured status is visible in the index without opening the editor.
- [x] Filtering by featured returns the correct posts.

### Phase 6: Media Workflow Cleanup

#### Scope

Reduce noise from the current always-open media library section.

#### Checklist

- [x] Move media browsing into a more focused interaction model.
- [x] Keep cover-image selection fast.
- [x] Preserve embed-in-editor support for images.
- [x] Keep attached media visible without over-dominating the page.
- [x] Ensure upload feedback and error states remain clear.

#### Test Criteria

- [x] A user can upload and apply a cover image without confusion.
- [x] A user can embed media in content without leaving the editor workflow.
- [x] Media UI does not overwhelm the writing experience on desktop or mobile.

### Phase 7: Validation, Save States, and Error Handling

#### Scope

Harden the editing workflow so it feels dependable during real authoring.

#### Checklist

- [x] Preserve existing inline validation behavior.
- [x] Show save/publish progress in the sticky action bar.
- [x] Show page-level API errors clearly.
- [x] Add unsaved-change protection if practical.
- [x] Ensure field-specific errors map correctly in the new layout.

#### Test Criteria

- [x] Required-field errors appear in the correct editor sections.
- [x] Save and publish actions provide clear in-progress feedback.
- [x] API failures do not silently discard form state.
- [x] Navigating away with unsaved changes is handled intentionally if implemented.

### Phase 8: Responsive and Regression Pass

#### Scope

Verify the redesigned admin experience across breakpoints and existing blog operations.

#### Checklist

- [ ] Test desktop, tablet, and mobile layouts.
- [ ] Verify create, edit, delete, and publish flows still work.
- [ ] Verify tag assignment still works.
- [ ] Verify cover image and embedded content still render correctly after save.
- [ ] Clean up spacing, overflow, and sticky behavior issues.

#### Test Criteria

- [ ] No major layout breakage at mobile, tablet, or desktop widths.
- [ ] Existing CRUD behavior remains intact after the redesign.
- [ ] The editor remains usable for long-form content.

## Suggested Implementation Order

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7
8. Phase 8

This order keeps routing and layout stable before backend schema work for related posts.

## Phase 9: Medium-Like Editor Upgrade

### Goal

Evolve the current TipTap-based editor from an admin form with a rich text area into a calmer, document-first writing experience closer to Medium.

This is not a full Medium clone plan. It is a pragmatic editorial-writer plan built on the current stack.

### Reality Check

The current stack already supports a Medium-like direction because:

- content is stored as rich HTML
- TipTap is already in place
- image embedding, formatting, headings, code blocks, and links already exist

What is missing is the authoring experience:

- simpler formatting behavior
- document-first layout
- stronger typography while editing
- fewer visible controls
- better image block handling
- more keyboard-first insertion patterns

### Product Principle

The content area should feel like a document, not a form field.

Metadata stays in the admin shell.
Writing interactions become quieter, faster, and more contextual.

### Phase 9A: Validation Behavior Fix

#### Problem

Right now, fields can become red as soon as the user lightly touches them and leaves focus. That is technically valid behavior, but it feels harsh and interruptive.

The current implementation validates immediately on blur after the field is marked touched.

#### Recommendation

Shift validation to a softer model:

- Do not show an error on first blur for untouched empty optional-progress fields unless submit is attempted.
- Show errors after submit attempt, or after the user has meaningfully edited the field and then left it invalid.
- Keep instant revalidation only for fields that already have an error visible.
- Keep stronger real-time validation for structural fields like slug only when the user is actively editing them.

#### Proposed Validation Rules

- `Required text fields`
  - show error after submit attempt
  - or after user changes the field and leaves it empty/invalid
- `Slug`
  - auto-generate until manually edited
  - validate live only after user takes ownership of the slug
- `Content`
  - do not show red state on first focus/blur
  - show error after submit attempt or after the user clears existing content
- `SEO fields`
  - validate character limits only after user actually enters content

#### Checklist

- [x] Separate first-focus behavior from meaningful field edits.
- [x] Prevent blur-only interactions from immediately showing red validation states.
- [x] Keep submit-time validation blocking intact.
- [x] Preserve live revalidation for fields that already have visible errors.
- [x] Keep content validation softer on first interaction.

#### Acceptance Criteria

- [x] A field does not turn red just because it was focused and blurred once.
- [x] Required fields still block submit correctly.
- [x] Existing visible errors continue updating live while the user fixes them.

### Phase 9B: Document-First Writing Surface

#### Goal

Make the editor page feel like the post itself is the product.

#### Checklist

- [x] Remove field-like framing around the main editor where possible.
- [x] Increase title and paragraph writing typography.
- [x] Make the body editor feel like a document canvas, not an input box.
- [x] Reduce always-visible helper text around the main writing area.
- [x] Keep metadata clearly secondary in the sidebar.

#### Success Criteria

- [x] The first visual impression is “article editor”, not “admin form”.
- [x] Writing space visually dominates metadata.

### Phase 9C: Contextual Formatting

#### Goal

Reduce toolbar noise and move toward contextual controls.

#### Checklist

- [x] Add a floating inline toolbar for selection-based formatting.
- [x] Reduce the permanent toolbar to the most important actions.
- [x] Keep block insertion and media actions available without crowding the page.
- [x] Ensure keyboard shortcuts are documented or discoverable.

#### Success Criteria

- [x] Formatting feels available without always demanding attention.
- [x] The editor surface looks calmer when the user is just writing.

### Phase 9D: Slash Commands and Block Insertion

#### Goal

Bring in a more Medium/Notion-like insertion flow for structural content.

#### Checklist

- [x] Add slash-command insertion for headings, image blocks, quote blocks, code blocks, and horizontal rules.
- [x] Add quick image insertion from the media browser.
- [x] Keep slash actions minimal and high-signal at first.

#### Success Criteria

- [x] A user can type `/` and insert common blocks without leaving the keyboard.
- [x] The insertion flow is faster than hunting through toolbar buttons.

### Phase 9E: Better Image Blocks

#### Goal

Make images feel like editorial blocks instead of pasted assets.

#### Checklist

- [x] Support image captions.
- [x] Improve image spacing and alignment in the editor.
- [x] Consider full-width vs contained image presentation rules.
- [x] Make replacing/removing an image straightforward.

#### Success Criteria

- [x] Embedded images feel intentionally placed in the article.
- [x] Images are easier to manage after insertion.

### Phase 9F: Editorial Preview Quality

#### Goal

Make preview mode feel closer to the eventual reading experience.

#### Checklist

- [x] Improve preview typography rhythm.
- [x] Ensure headings, quotes, code blocks, and images read cleanly.
- [x] Keep preview visually distinct from edit mode.

#### Success Criteria

- [x] Preview helps evaluate the article, not just confirm raw content exists.

### Recommended Order For Phase 9

1. Phase 9A: Validation behavior fix
2. Phase 9B: Document-first writing surface
3. Phase 9C: Contextual formatting
4. Phase 9D: Slash commands and block insertion
5. Phase 9E: Better image blocks
6. Phase 9F: Editorial preview quality

### Recommendation

Do not aim for “clone Medium”.

Aim for:

- a minimal editorial writer
- strong typography
- contextual formatting
- better media blocks
- soft validation behavior

That will give you most of the value with much lower complexity.

## Open Decisions

- Should multiple posts be allowed to be featured at the same time.
- Should related-post relationships be one-way or automatically mirrored.
- Should the editor support draft autosave later, or remain explicit save-only for now.
- Should the media picker become a drawer, inline collapsible section, or separate screen.

## Recommended Defaults

- Allow multiple featured posts for now.
- Keep related-post relationships one-way in the first version.
- Do not add autosave in the first pass.
- Use a collapsible media section or drawer, not a permanently expanded full grid.

## Definition of Done

The redesign is complete when:

- Admin blog create and edit workflows use dedicated full-page routes.
- The editor is clearly writing-first and no longer feels congested.
- The posts index is easier to scan and manage.
- Featured posts remain easy to manage.
- Manual related-post selection is implemented and persisted.
- The experience remains usable on mobile, even if desktop is the primary authoring target.
