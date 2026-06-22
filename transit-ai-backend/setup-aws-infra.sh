#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════════
# SETUP AWS INFRASTRUCTURE
# Crea automáticamente toda la infraestructura en AWS
# ════════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║   TRANSIT AI - SETUP INFRAESTRUCTURA AWS                          ║"
echo "║   Este script creará:                                             ║"
echo "║   • ECR Repository                                                ║"
echo "║   • RDS PostgreSQL Database                                       ║"
echo "║   • Security Groups                                               ║"
echo "║   • ECS Cluster                                                   ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# VARIABLES
# ────────────────────────────────────────────────────────────────────────────────

AWS_REGION="us-east-1"
PROJECT_NAME="transit-ai"
DB_INSTANCE="$PROJECT_NAME-db"
ECR_REPO="$PROJECT_NAME-backend"
CLUSTER_NAME="$PROJECT_NAME-cluster"
RDS_ADMIN_USER="admin"
RDS_DB_NAME="transit_ai_prod"

# Generar contraseña segura
RDS_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-25)

echo -e "${YELLOW}Ingrese valores de configuración:${NC}\n"

read -p "AWS Region [$AWS_REGION]: " INPUT
AWS_REGION=${INPUT:-$AWS_REGION}

read -p "DB Master Password (dejar en blanco para generar): " INPUT
RDS_PASSWORD=${INPUT:-$RDS_PASSWORD}

read -p "RDS Instance Size [db.t3.micro]: " INPUT
RDS_INSTANCE=${INPUT:-"db.t3.micro"}

# Obtener AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo ""
echo -e "${BLUE}📋 CONFIGURACIÓN FINAL:${NC}"
echo "   • AWS Account: $AWS_ACCOUNT_ID"
echo "   • Región: $AWS_REGION"
echo "   • ECR Repository: $ECR_REPO"
echo "   • RDS Instance: $DB_INSTANCE"
echo "   • Database: $RDS_DB_NAME"
echo "   • RDS Admin User: $RDS_ADMIN_USER"
echo "   • RDS Instance Type: $RDS_INSTANCE"
echo ""

read -p "¿Continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Cancelado${NC}"
    exit 0
fi

# ────────────────────────────────────────────────────────────────────────────────
# PASO 1: CREAR ECR REPOSITORY
# ────────────────────────────────────────────────────────────────────────────────

echo -e "\n${YELLOW}[1/5] Creando ECR Repository...${NC}"

if aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION 2>/dev/null; then
    echo -e "${YELLOW}⚠️  ECR Repository ya existe${NC}"
else
    aws ecr create-repository \
        --repository-name $ECR_REPO \
        --region $AWS_REGION \
        --image-tag-mutability MUTABLE

    echo -e "${GREEN}✅ ECR Repository creado${NC}"
fi

# ────────────────────────────────────────────────────────────────────────────────
# PASO 2: CREAR SECURITY GROUP
# ────────────────────────────────────────────────────────────────────────────────

echo -e "\n${YELLOW}[2/5] Creando Security Group...${NC}"

# Obtener VPC ID
VPC_ID=$(aws ec2 describe-vpcs \
    --filters Name=isDefault,Values=true \
    --query 'Vpcs[0].VpcId' \
    --output text \
    --region $AWS_REGION)

if [ -z "$VPC_ID" ]; then
    echo -e "${RED}❌ No se encontró VPC por defecto${NC}"
    exit 1
fi

SG_ID=$(aws ec2 create-security-group \
    --group-name "$PROJECT_NAME-sg" \
    --description "Security group for $PROJECT_NAME" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || echo "existing")

if [ "$SG_ID" = "existing" ]; then
    SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$PROJECT_NAME-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)
    echo -e "${YELLOW}⚠️  Security Group ya existe${NC}"
else
    # Abrir puertos necesarios
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 5432 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    echo -e "${GREEN}✅ Security Group creado${NC}"
fi

# ────────────────────────────────────────────────────────────────────────────────
# PASO 3: CREAR RDS DATABASE
# ────────────────────────────────────────────────────────────────────────────────

echo -e "\n${YELLOW}[3/5] Creando RDS PostgreSQL Database...${NC}"
echo "    (esto puede tomar 5-10 minutos...)"

if aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --region $AWS_REGION 2>/dev/null; then
    echo -e "${YELLOW}⚠️  RDS Instance ya existe${NC}"
else
    aws rds create-db-instance \
        --db-instance-identifier $DB_INSTANCE \
        --db-instance-class $RDS_INSTANCE \
        --engine postgres \
        --engine-version 13.13 \
        --master-username $RDS_ADMIN_USER \
        --master-user-password "$RDS_PASSWORD" \
        --allocated-storage 20 \
        --publicly-accessible \
        --backup-retention-period 0 \
        --vpc-security-group-ids $SG_ID \
        --region $AWS_REGION

    echo -e "${YELLOW}Esperando a que la BD esté disponible...${NC}"
    sleep 30

    # Esperar a que esté disponible
    while true; do
        STATUS=$(aws rds describe-db-instances \
            --db-instance-identifier $DB_INSTANCE \
            --query 'DBInstances[0].DBInstanceStatus' \
            --output text \
            --region $AWS_REGION)

        if [ "$STATUS" = "available" ]; then
            echo -e "${GREEN}✅ RDS Database creada${NC}"
            break
        elif [ "$STATUS" = "creating" ]; then
            echo -n "."
            sleep 10
        else
            echo -e "${YELLOW}Estado actual: $STATUS${NC}"
            sleep 10
        fi
    done
fi

# Obtener endpoint de RDS
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --region $AWS_REGION)

# ────────────────────────────────────────────────────────────────────────────────
# PASO 4: CREAR BASE DE DATOS (Crear esquema)
# ────────────────────────────────────────────────────────────────────────────────

echo -e "\n${YELLOW}[4/5] Creando esquema de base de datos...${NC}"

PGPASSWORD="$RDS_PASSWORD" psql \
    -h $RDS_ENDPOINT \
    -U $RDS_ADMIN_USER \
    -p 5432 \
    -c "CREATE DATABASE $RDS_DB_NAME;" \
    2>/dev/null || echo -e "${YELLOW}⚠️  Base de datos ya existe${NC}"

echo -e "${GREEN}✅ Esquema preparado${NC}"

# ────────────────────────────────────────────────────────────────────────────────
# PASO 5: CREAR ECS CLUSTER
# ────────────────────────────────────────────────────────────────────────────────

echo -e "\n${YELLOW}[5/5] Creando ECS Cluster...${NC}"

if aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION 2>/dev/null | grep -q $CLUSTER_NAME; then
    echo -e "${YELLOW}⚠️  ECS Cluster ya existe${NC}"
else
    aws ecs create-cluster \
        --cluster-name $CLUSTER_NAME \
        --region $AWS_REGION

    echo -e "${GREEN}✅ ECS Cluster creado${NC}"
fi

# ────────────────────────────────────────────────────────────────────────────────
# RESUMEN Y CONFIGURACIÓN
# ────────────────────────────────────────────────────────────────────────────────

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ INFRAESTRUCTURA AWS CREADA EXITOSAMENTE                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📋 INFORMACIÓN DE CONEXIÓN:${NC}\n"
echo "   Database URL:"
echo "   ${YELLOW}postgresql://$RDS_ADMIN_USER:$RDS_PASSWORD@$RDS_ENDPOINT:5432/$RDS_DB_NAME${NC}"
echo ""
echo "   Credenciales RDS:"
echo "   • Usuario: $RDS_ADMIN_USER"
echo "   • Contraseña: ${RDS_PASSWORD:0:8}... (guardada en .env.production)"
echo ""
echo "   ECR Repository:"
echo "   ${YELLOW}$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO${NC}"
echo ""
echo "   ECS Cluster:"
echo "   ${YELLOW}$CLUSTER_NAME${NC}"
echo ""

# ────────────────────────────────────────────────────────────────────────────────
# CREAR/ACTUALIZAR .env.production
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}Actualizando .env.production...${NC}\n"

if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup
    echo -e "${YELLOW}⚠️  Backup creado: .env.production.backup${NC}"
fi

cat > .env.production << EOF
# ════════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE PRODUCCIÓN - Transit AI Backend
# Generado automáticamente por setup-aws-infra.sh
# ════════════════════════════════════════════════════════════════════════════════

NODE_ENV=production
PORT=4000

# BASE DE DATOS
DATABASE_URL=postgresql://$RDS_ADMIN_USER:$RDS_PASSWORD@$RDS_ENDPOINT:5432/$RDS_DB_NAME

# JWT (Genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# BLOCKCHAIN
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_OWNER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476caded64645dd5067ada1f80e
WALLET_ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY_FOR_WALLETS

# STRIPE
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY
STRIPE_CURRENCY=BOB
BILLETERA_QR_SECRET=YOUR_QR_SECRET_KEY

# FRONTEND
FRONTEND_URL=https://tu-dominio.com

# OPCIONALES
LOG_LEVEL=info
DEBUG_SQL=false
REQUEST_TIMEOUT=30000
RATE_LIMIT_MAX=100
ABONO_VIAJES=40
ABONO_DIAS=30
EOF

echo -e "${GREEN}✅ .env.production creado${NC}\n"

# ────────────────────────────────────────────────────────────────────────────────
# INSTRUCCIONES FINALES
# ────────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}📝 PRÓXIMOS PASOS:${NC}\n"

echo "1. Edita .env.production y actualiza valores importantes:"
echo "   • JWT_SECRET (genera con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
echo "   • STRIPE_SECRET_KEY y STRIPE_PUBLISHABLE_KEY"
echo "   • FRONTEND_URL"
echo ""

echo "2. Define variables de entorno:"
echo "   ${YELLOW}export AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID${NC}"
echo "   ${YELLOW}export AWS_REGION=$AWS_REGION${NC}"
echo ""

echo "3. Ejecuta el deployment:"
echo "   ${YELLOW}./quick-deploy.sh${NC}"
echo ""

echo "4. Verifica que todo esté funcionando:"
echo "   ${YELLOW}aws ecs describe-services --cluster $CLUSTER_NAME --services transit-ai-backend${NC}"
echo ""
