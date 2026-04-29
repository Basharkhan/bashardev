SHELL := /bin/bash

.PHONY: db-up db-down make-backend make-frontend backend-docker

db-up:
	@echo "Starting PostgreSQL..."
	@docker compose up -d postgres
	@echo "Waiting for PostgreSQL to become healthy..."
	@until [ "$$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' bashardev-postgres 2>/dev/null)" = "healthy" ]; do sleep 1; done
	@echo "PostgreSQL is ready on localhost:5432"

db-down:
	@docker compose stop postgres

make-backend: db-up
	@cd backend && ./mvnw spring-boot:run

make-frontend:
	@cd frontend && npm run dev

backend-docker:
	@docker compose up --build backend
