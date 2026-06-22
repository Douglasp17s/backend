#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════════
# QUICK DEPLOY - One Command Deployment
# Transit AI Backend a AWS
# ════════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║        TRANSIT AI - QUICK DEPLOY A AWS                            ║"
echo "║        (Este script requiere configuración previa)                 ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# VALIDAR VARIABLES DE ENTORNO
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}Verificando configuración...${NC}\n"

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Falta AWS_ACCOUNT_ID${NC}"
    echo "   Ejecuta: export AWS_ACCOUNT_ID=123456789"
    exit 1
fi

if [ -z "$AWS_REGION" ]; then
    echo -e "${YELLOW}⚠️  AWS_REGION no definido, usando us-east-1${NC}"
    export AWS_REGION="us-east-1"
fi

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Falta .env.production${NC}"
    echo "   Ejecuta: cp .env.production.example .env.production"
    exit 1
fi

echo -e "${GREEN}✅ Configuración OK${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# VARIABLES
# ────────────────────────────────────────────────────────────────────────────────

export ECR_REPOSITORY="transit-ai-backend"
export IMAGE_TAG="latest"
export SERVICE_NAME="transit-ai-backend"
export CLUSTER_NAME="transit-ai-cluster"
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"

echo -e "${BLUE}📋 CONFIGURACIÓN:${NC}"
echo "   • AWS Account: $AWS_ACCOUNT_ID"
echo "   • Región: $AWS_REGION"
echo "   • ECR URI: $ECR_URI"
echo "   • Cluster: $CLUSTER_NAME"
echo ""

# ────────────────────────────────────────────────────────────────────────────────
# PASO 1: VALIDAR REQUISITOS
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[1/4] Validando requisitos...${NC}"

for cmd in aws docker npm npx; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}❌ $cmd no está instalado${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Requisitos OK${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# PASO 2: BUILD Y PUSH
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[2/4] Compilando y subiendo imagen a ECR...${NC}"

# Build
npm run build
docker build -t $ECR_REPOSITORY:$IMAGE_TAG .

# Login ECR
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_URI

# Tag y Push
docker tag $ECR_REPOSITORY:$IMAGE_TAG $ECR_URI:$IMAGE_TAG
docker push $ECR_URI:$IMAGE_TAG

echo -e "${GREEN}✅ Imagen subida a ECR${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# PASO 3: MIGRACIONES Y SEED
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[3/4] Base de datos (migraciones + seed)...${NC}"

export $(cat .env.production | grep -v '^#' | xargs)

npx prisma migrate deploy --skip-generate
npx prisma db seed

echo -e "${GREEN}✅ Base de datos actualizada${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# PASO 4: ACTUALIZAR ECS
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}[4/4] Actualizando servicio ECS...${NC}"

if aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].serviceName' \
    --output text 2>/dev/null | grep -q $SERVICE_NAME; then

    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION

    echo -e "${GREEN}✅ Servicio ECS actualizado${NC}\n"
else
    echo -e "${YELLOW}⚠️  Servicio ECS no encontrado${NC}"
    echo "    Debes crear el servicio manualmente (ver README-AWS-DEPLOYMENT.md)"
    echo ""
fi

# ────────────────────────────────────────────────────────────────────────────────
# RESUMEN
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ DEPLOYMENT COMPLETADO CON ÉXITO                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📊 RESUMEN:${NC}"
echo "   • Imagen Docker: $ECR_URI:$IMAGE_TAG"
echo "   • Base de datos: ✓ Migraciones + Seed"
echo "   • Servicio ECS: ✓ Actualizado (si existe)"
echo ""

echo -e "${BLUE}📝 PRÓXIMOS PASOS:${NC}"
echo "   1. Verifica el estado del servicio:"
echo "      aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME"
echo ""
echo "   2. Revisa los logs:"
echo "      aws logs tail /ecs/transit-ai-backend --follow"
echo ""
echo "   3. Prueba la API:"
echo "      curl http://tu-alb-dns.amazonaws.com/salud"
echo ""
