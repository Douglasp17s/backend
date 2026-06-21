.PHONY: help build up down logs migrate seed test lint clean

help:
	@echo "╔════════════════════════════════════════════╗"
	@echo "║       Transit AI - Docker Commands         ║"
	@echo "╚════════════════════════════════════════════╝"
	@echo ""
	@echo "📦 Build & Setup:"
	@echo "  make build              - Build all Docker images"
	@echo "  make build-backend      - Build backend image"
	@echo "  make build-frontend     - Build frontend image"
	@echo ""
	@echo "🚀 Start & Stop:"
	@echo "  make up                 - Start all services"
	@echo "  make down               - Stop all services"
	@echo "  make restart            - Restart all services"
	@echo ""
	@echo "📊 Database:"
	@echo "  make migrate            - Run Prisma migrations"
	@echo "  make seed               - Seed database"
	@echo "  make db-studio          - Open Prisma Studio GUI"
	@echo ""
	@echo "🧪 Testing & Quality:"
	@echo "  make test               - Run backend tests"
	@echo "  make test-e2e           - Run E2E tests"
	@echo "  make lint               - Run linting"
	@echo ""
	@echo "📝 Logs & Debug:"
	@echo "  make logs               - Show all logs"
	@echo "  make logs-backend       - Show backend logs"
	@echo "  make logs-frontend      - Show frontend logs"
	@echo "  make ps                 - Show container status"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean              - Stop and remove containers"
	@echo "  make clean-volumes      - Remove volumes (WARNING: deletes data)"
	@echo ""

# Build commands
build:
	@echo "🔨 Building all images..."
	docker-compose build

build-backend:
	@echo "🔨 Building backend image..."
	docker-compose build backend

build-frontend:
	@echo "🔨 Building frontend image..."
	docker-compose build frontend

# Start & Stop
up:
	@echo "🚀 Starting services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   Frontend:  http://localhost:3000"
	@echo "   Backend:   http://localhost:4000"
	@echo "   Database:  localhost:5432"

down:
	@echo "🛑 Stopping services..."
	docker-compose down

restart:
	@echo "♻️ Restarting services..."
	docker-compose restart

# Database
migrate:
	@echo "🗄️ Running migrations..."
	docker-compose exec backend npx prisma migrate dev

seed:
	@echo "🌱 Seeding database..."
	docker-compose exec backend npm run seed

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	docker-compose exec backend npx prisma studio

# Testing
test:
	@echo "🧪 Running tests..."
	docker-compose exec backend npm test

test-e2e:
	@echo "🧪 Running E2E tests..."
	docker-compose exec backend npm run test:e2e

lint:
	@echo "🔍 Running linter..."
	docker-compose exec backend npm run lint
	docker-compose exec frontend npm run lint

# Logs
logs:
	@echo "📋 Showing all logs..."
	docker-compose logs -f

logs-backend:
	@echo "📋 Showing backend logs..."
	docker-compose logs -f backend

logs-frontend:
	@echo "📋 Showing frontend logs..."
	docker-compose logs -f frontend

ps:
	@echo "📊 Container status:"
	docker-compose ps

# Cleanup
clean:
	@echo "🧹 Stopping and removing containers..."
	docker-compose down

clean-volumes:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "✅ Cleaned up!"; \
	fi

# Development
dev-backend:
	@echo "🔧 Starting backend in dev mode..."
	cd transit-ai-backend && npm run start:dev

dev-frontend:
	@echo "🔧 Starting frontend in dev mode..."
	cd frontend && npm run dev

# Shell access
shell-backend:
	docker-compose exec backend /bin/sh

shell-frontend:
	docker-compose exec frontend /bin/sh

shell-postgres:
	docker-compose exec postgres psql -U transit_user -d transit_ai
