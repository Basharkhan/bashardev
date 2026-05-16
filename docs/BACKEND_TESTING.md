# Backend Testing

## Prerequisites

1. Create a PostgreSQL database named `bashardev`
2. Set backend environment variables from `backend/.env.example`
3. Start the backend from `backend/`

```bash
./mvnw spring-boot:run
```

The app will:

- run Flyway migrations automatically
- create the first admin user automatically if the `users` table is empty

## Default Local Admin Credentials

These come from `backend/.env.example` unless you override them:

- username: `admin`
- password: `admin123456`

## Base URL

```text
http://localhost:8080/api
```

## 1. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123456"
  }'
```

Expected response:

- `accessToken`
- `expiresInSeconds`

Copy the token for the protected endpoints below.

## 2. Confirm Auth

Replace `<TOKEN>` with your JWT:

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## 3. Test Site Settings

### Upsert Site Settings

```bash
curl -X PUT http://localhost:8080/api/site-settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "siteTitle": "BasharDev",
    "siteDescription": "Dynamic portfolio and dev blog",
    "ownerName": "Bashar Khan",
    "headline": "Full-stack developer building thoughtful products",
    "shortBio": "I build backend systems and modern web apps.",
    "fullBio": "Longer markdown or plain text bio goes here.",
    "location": "Dhaka, Bangladesh",
    "email": "hello@example.com",
    "githubUrl": "https://github.com/example",
    "linkedinUrl": "https://linkedin.com/in/example",
    "twitterUrl": "https://x.com/example",
    "resumeUrl": "https://example.com/resume.pdf",
    "profileImageUrl": "https://example.com/profile.jpg",
    "heroImageUrl": "https://example.com/hero.jpg"
  }'
```

### Public Read

```bash
curl http://localhost:8080/api/site-settings
```

## 4. Test Project CRUD

### Create Project

```bash
curl -X POST http://localhost:8080/api/admin/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Portfolio Platform",
    "slug": "portfolio-platform",
    "summary": "A portfolio and CMS built with Spring Boot and React.",
    "contentMarkdown": "# Portfolio Platform\n\nProject details here.",
    "coverImageUrl": "https://example.com/project-cover.jpg",
    "gallery": [
      { "imageUrl": "https://example.com/1.jpg", "altText": "Homepage overview" },
      { "imageUrl": "https://example.com/2.jpg", "altText": "Admin dashboard" }
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
    "publishedAt": "2026-04-26T12:00:00Z",
    "displayOrder": 1,
    "seoTitle": "Portfolio Platform",
    "seoDescription": "Case study for the portfolio platform"
  }'
```

### List Admin Projects

```bash
curl http://localhost:8080/api/admin/projects \
  -H "Authorization: Bearer <TOKEN>"

curl "http://localhost:8080/api/admin/projects?page=0&size=10&search=portfolio&status=PUBLISHED&featured=true" \
  -H "Authorization: Bearer <TOKEN>"
```

### Get One Admin Project

```bash
curl http://localhost:8080/api/admin/projects/1 \
  -H "Authorization: Bearer <TOKEN>"
```

### Update Project

```bash
curl -X PUT http://localhost:8080/api/admin/projects/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Portfolio Platform Updated",
    "slug": "portfolio-platform",
    "summary": "Updated summary.",
    "contentMarkdown": "# Updated\n\nMore details here.",
    "coverImageUrl": "https://example.com/project-cover.jpg",
    "gallery": [
      { "imageUrl": "https://example.com/1.jpg", "altText": "Homepage overview" }
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
    "publishedAt": "2026-04-26T12:00:00Z",
    "displayOrder": 1,
    "seoTitle": "Portfolio Platform Updated",
    "seoDescription": "Updated case study"
  }'
```

### Public Project Reads

```bash
curl http://localhost:8080/api/projects
curl http://localhost:8080/api/projects/slug/portfolio-platform
```

### Delete Project

```bash
curl -X DELETE http://localhost:8080/api/admin/projects/1 \
  -H "Authorization: Bearer <TOKEN>"
```

## 5. Test Blog Post CRUD

### Create Blog Post

```bash
curl -X POST http://localhost:8080/api/admin/blog-posts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Building a Dynamic Portfolio",
    "slug": "building-a-dynamic-portfolio",
    "excerpt": "Notes from building a dynamic portfolio CMS.",
    "contentMarkdown": "# Building a Dynamic Portfolio\n\nPost content here.",
    "coverImageUrl": "https://example.com/post-cover.jpg",
    "status": "PUBLISHED",
    "featured": true,
    "publishedAt": "2026-04-26T12:00:00Z",
    "readingTime": 6,
    "seoTitle": "Building a Dynamic Portfolio",
    "seoDescription": "How the portfolio CMS is being built"
  }'
```

### List Admin Blog Posts

```bash
curl http://localhost:8080/api/admin/blog-posts \
  -H "Authorization: Bearer <TOKEN>"
```

### Get One Admin Blog Post

```bash
curl http://localhost:8080/api/admin/blog-posts/1 \
  -H "Authorization: Bearer <TOKEN>"
```

### Update Blog Post

```bash
curl -X PUT http://localhost:8080/api/admin/blog-posts/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Building a Dynamic Portfolio Updated",
    "slug": "building-a-dynamic-portfolio",
    "excerpt": "Updated excerpt.",
    "contentMarkdown": "# Updated Post\n\nUpdated content.",
    "coverImageUrl": "https://example.com/post-cover.jpg",
    "status": "PUBLISHED",
    "featured": true,
    "publishedAt": "2026-04-26T12:00:00Z",
    "readingTime": 7,
    "seoTitle": "Building a Dynamic Portfolio Updated",
    "seoDescription": "Updated build notes"
  }'
```

### Public Blog Reads

```bash
curl http://localhost:8080/api/blog-posts
curl http://localhost:8080/api/blog-posts/slug/building-a-dynamic-portfolio
```

### Delete Blog Post

```bash
curl -X DELETE http://localhost:8080/api/admin/blog-posts/1 \
  -H "Authorization: Bearer <TOKEN>"
```

## Notes

- Public endpoints only return `PUBLISHED` projects and blog posts
- Admin CRUD lives under `/api/admin/...`
- Project `gallery` and `techStack` now use structured arrays instead of raw JSON strings
