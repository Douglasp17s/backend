#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║       Transit AI - Setup Script            ║"
echo "║   Sistema de Transporte Inteligente        ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check prerequisites
echo -e "${YELLOW}📋 Verificando requisitos previos...${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 instalado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 NO instalado"
        return 1
    fi
}

check_command "git"
check_command "docker"
check_command "docker-compose"
check_command "node"

echo ""

# Clone or update repository
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 Actualizando repositorio...${NC}"
    git pull origin main
else
    echo -e "${YELLOW}📥 Clonando repositorio...${NC}"
    # El usuario debe clonar manualmente
    echo -e "${YELLOW}Por favor, clona el repositorio primero${NC}"
fi

echo ""

# Setup environment files
echo -e "${YELLOW}⚙️ Configurando archivos de entorno...${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env creado"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env y configura:${NC}"
    echo "   - JWT_SECRET"
    echo "   - STRIPE_SECRET_KEY (opcional)"
    echo "   - NEXT_PUBLIC_MAPS_API_KEY (opcional)"
else
    echo -e "${GREEN}✓${NC} .env ya existe"
fi

if [ ! -f "transit-ai-backend/.env" ]; then
    cp .env.example transit-ai-backend/.env
    echo -e "${GREEN}✓${NC} backend/.env creado"
else
    echo -e "${GREEN}✓${NC} backend/.env ya existe"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp .env.example frontend/.env.local
    echo -e "${GREEN}✓${NC} frontend/.env.local creado"
else
    echo -e "${GREEN}✓${NC} frontend/.env.local ya existe"
fi

echo ""

# Build Docker images
echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error al construir imágenes${NC}"
    exit 1
fi

echo ""

# Start services
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error al iniciar servicios${NC}"
    exit 1
fi

echo ""

# Wait for services to be ready
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}🏥 Verificando salud de servicios...${NC}"

check_service() {
    local url=$1
    local name=$2

    if curl -s "$url" > /dev/null; then
        echo -e "${GREEN}✓${NC} $name está listo"
        return 0
    else
        echo -e "${RED}✗${NC} $name NO está listo"
        return 1
    fi
}

check_service "http://localhost:4000/health" "Backend"
check_service "http://localhost:3000" "Frontend"

echo ""

# Run database migrations
echo -e "${YELLOW}🗄️ Ejecutando migraciones de BD...${NC}"
docker-compose exec -T backend npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Las migraciones podrían no estar disponibles aún${NC}"
else
    echo -e "${GREEN}✓${NC} Migraciones ejecutadas"
fi

echo ""

# Success message
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║        ✅ Setup completado!               ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}\n"

echo -e "${BLUE}🌐 Acceso a servicios:${NC}"
echo "   Frontend:  ${GREEN}http://localhost:3000${NC}"
echo "   Backend:   ${GREEN}http://localhost:4000${NC}"
echo "   Base de datos: localhost:5432"
echo ""

echo -e "${BLUE}📚 Próximos pasos:${NC}"
echo "   1. Edita .env si necesitas cambiar configuración"
echo "   2. Ver logs: ${YELLOW}make logs${NC}"
echo "   3. Ejecutar tests: ${YELLOW}make test${NC}"
echo "   4. Documentación: ${YELLOW}cat README.md${NC}"
echo ""

echo -e "${BLUE}💡 Comandos útiles:${NC}"
echo "   make up              - Iniciar servicios"
echo "   make down            - Detener servicios"
echo "   make logs            - Ver logs"
echo "   make test            - Ejecutar tests"
echo "   make help            - Ver todos los comandos"
echo ""

echo -e "${YELLOW}Para más información, revisa README.md${NC}"
