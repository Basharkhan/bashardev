# BasharDev Project Plan

## Vision

Build a dynamic personal portfolio and developer blog using:

- Spring Boot
- React with Vite
- Tailwind CSS
- JWT authentication
- PostgreSQL

The site should behave like a small headless CMS for one admin user. Content will be managed from an internal admin area within the same React application.

## Locked Decisions

- Admin UI will live inside the same React app under protected routes
- Blog content will be stored as Markdown
- No comments in v1
- No multi-language support in v1
- Backend will expose REST APIs
- Authentication will be admin-only JWT auth

## Recommendation Kept For V1

Use image URLs first instead of file uploads.

Reason:

- Faster to implement
- Keeps the backend simpler while core content features are being built
- Makes it easier to finish the first usable version

Uploads can be added later through Cloudinary or S3-compatible storage without changing the main content model much.

## Product Scope

### Public Pages

- Home
- About
- Projects
- Project details
- Blog list
- Blog details
- Contact

### Admin Pages

- Login
- Dashboard
- Manage site settings
- Manage skills
- Manage experience
- Manage projects
- Manage blog posts
- Manage tags
- View contact messages

## Core Domain Model

### User

- id
- username
- email
- passwordHash
- firstName
- lastName
- role
- enabled
- createdAt
- updatedAt

Notes:

- `User` is for authentication and admin identity
- Public portfolio identity should primarily live in `SiteSettings`
- This keeps auth concerns separate from public-facing site content

### SiteSettings

- id
- siteTitle
- siteDescription
- ownerName
- headline
- shortBio
- fullBio
- location
- email
- githubUrl
- linkedinUrl
- twitterUrl
- resumeUrl
- profileImageUrl
- heroImageUrl
- createdAt
- updatedAt

### Skill

- id
- name
- category
- level
- iconName
- displayOrder
- featured
- createdAt
- updatedAt

### Experience

- id
- company
- role
- employmentType
- location
- startDate
- endDate
- current
- summary
- achievements
- displayOrder
- createdAt
- updatedAt

### Project

- id
- title
- slug
- summary
- contentMarkdown
- coverImageUrl
- galleryImageUrls
- liveUrl
- repositoryUrl
- techStack
- featured
- status
- publishedAt
- displayOrder
- seoTitle
- seoDescription
- createdAt
- updatedAt

### BlogPost

- id
- title
- slug
- excerpt
- contentMarkdown
- coverImageUrl
- status
- featured
- publishedAt
- readingTime
- seoTitle
- seoDescription
- createdAt
- updatedAt

### Tag

- id
- name
- slug
- createdAt
- updatedAt

### BlogPostTag

- blogPostId
- tagId

### ContactMessage

- id
- name
- email
- subject
- message
- status
- createdAt

## Initial API Modules

- `/api/auth`
- `/api/site-settings`
- `/api/skills`
- `/api/experiences`
- `/api/projects`
- `/api/blog-posts`
- `/api/tags`
- `/api/contact`

## API Design Direction

### Public Endpoints

- Read-only access for site settings, skills, experience, published projects, published blog posts, and contact form submission

### Admin Endpoints

- Protected CRUD access for all managed content

### Auth Endpoints

- Admin login
- Token refresh if needed later
- Current user profile

## Content Rules

### Blog Posts

- Support `DRAFT` and `PUBLISHED`
- Only published posts show on public pages
- Markdown is the source of truth
- Slugs must be unique

### Projects

- Support `DRAFT` and `PUBLISHED`
- Featured flag for homepage sections
- Markdown for detailed case-study style writeups

## Frontend Structure Direction

### Public Side

- Layout with shared navigation and footer
- Dynamic homepage sections from API
- Blog listing with tag filtering later
- Detail pages by slug

### Admin Side

- Protected `/admin` routes
- Reusable forms for CRUD
- Markdown editor component
- Table/list views for content management

## Backend Structure Direction

Package layout should stay feature-based where possible:

- `config`
- `security`
- `common`
- `auth`
- `site`
- `skill`
- `experience`
- `project`
- `blog`
- `tag`
- `contact`

Each feature should usually contain:

- controller
- service
- repository
- entity
- dto

## MVP Milestone

The first usable version should support:

- Admin login
- Edit site settings
- CRUD for projects
- CRUD for blog posts
- Public homepage reading site settings and featured projects
- Public blog list and blog detail pages

If this is working, the system is already a real portfolio CMS.

## Build Order

1. Scaffold Spring Boot backend
2. Scaffold React app with Vite and Tailwind
3. Configure PostgreSQL and environment handling
4. Implement JWT auth
5. Build base entities and migrations
6. Build admin CRUD for site settings, projects, and blog posts
7. Build public pages consuming API
8. Add skills, experience, tags, and contact
9. Add polish like SEO, search, pagination, and image upload

## Open Items

- Decide whether to use Flyway or Liquibase for migrations
- Decide whether JWT refresh tokens are needed in v1
- Decide whether Markdown is stored raw only or with cached rendered HTML
- Decide whether tech stacks and project galleries are normalized tables or JSON columns

## Current Recommendation

- Use Flyway for migrations
- Skip refresh tokens in v1 unless admin sessions need long-lived silent renewal
- Store raw Markdown and render on the frontend
- Keep `techStack` and `galleryImageUrls` simple at first, then normalize later if needed
