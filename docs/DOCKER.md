# Docker Setup

## Recommendation

Yes, use Docker for:

- PostgreSQL locally
- backend app parity across machines

Do not prioritize containerizing the frontend yet unless you specifically want production-like local orchestration. Vite is simpler to run natively during active development.

## Start Services

From the project root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- Spring Boot backend on `localhost:8080`

## Stop Services

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

## Notes

- Flyway migrations run automatically when the backend starts
- the first admin user is bootstrapped automatically if the `users` table is empty
- frontend can continue running locally with `npm run dev`
