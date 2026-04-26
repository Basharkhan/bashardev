# BasharDev

Dynamic portfolio and developer blog built with Spring Boot, React, Vite, Tailwind, JWT, and PostgreSQL.

## Planned Repository Layout

```text
bashardev/
├── backend/
├── frontend/
└── docs/
```

## Current Status

- Backend scaffolded with Spring Boot, JPA, Security, Flyway, PostgreSQL config, JWT service, and core entities
- Frontend scaffolded with React, Vite, Tailwind, React Router, and public/admin route shells
- Planning docs written and updated as decisions are made

## Stack

- Backend: Spring Boot, Spring Security, Spring Data JPA, JWT
- Frontend: React, Vite, Tailwind CSS
- Database: PostgreSQL
- Content format: Markdown

## Product Direction

- Single React app with public and admin routes
- Admin-only authentication
- Dynamic portfolio content
- Dynamic blog publishing

## Documentation

- Project plan: `docs/PROJECT_PLAN.md`
- Backend testing: `docs/BACKEND_TESTING.md`
- Docker setup: `docs/DOCKER.md`
- Postman collection: `docs/BasharDev.postman_collection.json`

## MVP

- Admin login
- Site settings management
- Project CRUD
- Blog post CRUD
- Public home page
- Public blog list and detail pages

## Local Setup

### Backend

1. Copy `backend/.env.example` into your preferred env source
2. Create a PostgreSQL database named `bashardev`
3. Run `./mvnw spring-boot:run` from `backend/`

### Frontend

1. Run `npm install` from `frontend/`
2. Run `npm run dev`
