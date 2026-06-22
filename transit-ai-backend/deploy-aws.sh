#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════════
# SCRIPT DE DEPLOYMENT A AWS
# Transit AI Backend - PostgreSQL + Docker + ECR + ECS
# ════════════════════════════════════════════════════════════════════════════════

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ────────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     TRANSIT AI - DEPLOYMENT A AWS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}\n"

# Variables de configuración (CAMBIAR SEGÚN TU AMBIENTE)
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-"YOUR_AWS_ACCOUNT_ID"}
ECR_REPOSITORY=${ECR_REPOSITORY:-"transit-ai-backend"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
SERVICE_NAME=${SERVICE_NAME:-"transit-ai-backend"}
CLUSTER_NAME=${CLUSTER_NAME:-"transit-ai-cluster"}

# ────────────────────────────────────────────────────────────────────────────────
# 1. VALIDACIÓN DE REQUISITOS
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[1/5] Validando requisitos...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI no está instalado${NC}"
    echo "    Instala con: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "    Instala con: https://docs.docker.com/get-docker/"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Falta .env.production${NC}"
    echo "    Crea el archivo: cp .env.production.example .env.production"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Falta Dockerfile${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todos los requisitos están presentes${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# 2. COMPILAR Y CONSTRUIR IMAGEN DOCKER
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[2/5] Compilando NestJS y creando imagen Docker...${NC}"

npm run build
docker build -t $ECR_REPOSITORY:$IMAGE_TAG .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir la imagen Docker${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Imagen Docker creada exitosamente${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# 3. PUSH A ECR (Elastic Container Registry)
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[3/5] Autenticando con ECR y subiendo imagen...${NC}"

# Login a ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al autenticar con ECR${NC}"
    echo "    Verifica AWS_ACCOUNT_ID y credenciales AWS"
    exit 1
fi

# Tag de la imagen con ECR URI
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"
docker tag $ECR_REPOSITORY:$IMAGE_TAG $ECR_URI

# Push
docker push $ECR_URI

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al subir imagen a ECR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Imagen subida a ECR: $ECR_URI${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# 4. MIGRACIONES DE BASE DE DATOS
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[4/5] Ejecutando migraciones de base de datos...${NC}"

# Cargar variables de .env.production
export $(cat .env.production | grep -v '^#' | xargs)

# Ejecutar migraciones
npx prisma migrate deploy --skip-generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en las migraciones${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migraciones completadas${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# 5. EJECUTAR SEED (Datos iniciales)
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[5/5] Cargando datos iniciales (seed)...${NC}"

npx prisma db seed

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el seed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Seed completado${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# 6. ACTUALIZAR ECS (si existe servicio)
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}Intentando actualizar servicio ECS...${NC}"

# Verificar si el servicio existe
if aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].serviceName' \
    --output text 2>/dev/null | grep -q $SERVICE_NAME; then

    echo "  Actualizando servicio ECS..."

    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION

    echo -e "${GREEN}✅ Servicio ECS actualizado${NC}"
else
    echo -e "${YELLOW}⚠️  Servicio ECS no encontrado (crear manualmente en AWS)${NC}"
fi

# ────────────────────────────────────────────────────────────────────────────────
# RESUMEN
# ────────────────────────────────────────────────────────────────────────────────

echo -e "\n${GREEN}════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}     ✅ DEPLOYMENT COMPLETADO${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📊 RESUMEN:${NC}"
echo -e "   • Imagen Docker: ${BLUE}$ECR_URI${NC}"
echo -e "   • Región AWS: ${BLUE}$AWS_REGION${NC}"
echo -e "   • Base de datos: Migraciones ejecutadas ✓"
echo -e "   • Datos iniciales: Seed ejecutado ✓"
echo -e "\n${BLUE}📝 PRÓXIMOS PASOS:${NC}"
echo "   1. Verifica el servicio ECS en AWS Console"
echo "   2. Actualiza el DNS/ALB si es necesario"
echo "   3. Verifica logs: aws logs tail /ecs/transit-ai-backend --follow"
echo ""
