# Repo-level entry points. `make help` lists everything.

SHELL := /usr/bin/env bash
AREA ?= dev
export AREA

.PHONY: help install check lint typecheck test build data data-summary up down logs clean

help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install workspace dependencies
	pnpm install

check: lint typecheck test build ## Run the full definition-of-done gate (SPEC §9)

lint: ## ESLint over the workspace
	pnpm lint

typecheck: ## tsc --noEmit in every package
	pnpm typecheck

test: ## Vitest in every package
	pnpm test

build: ## Build every package
	pnpm build

data: ## Build map data for AREA (dev|italy) — SPEC §3
	$(MAKE) -C pipeline all AREA=$(AREA)

data-summary: ## Print sizes and durations of the last data build
	$(MAKE) -C pipeline summary AREA=$(AREA)

up: ## Start the local stack (SPEC §2.2)
	docker compose -f infra/docker-compose.yml --env-file infra/.env up --build -d

down: ## Stop the local stack
	docker compose -f infra/docker-compose.yml down

logs: ## Tail stack logs
	docker compose -f infra/docker-compose.yml logs -f

clean: ## Remove build output (keeps node_modules and data/)
	pnpm -r run clean || true
