# 🚀 DEPLOYMENT TRANSIT AI A AWS

Guía completa para desplegar Transit AI Backend a AWS con PostgreSQL RDS, ECR y ECS.

---

## 📋 REQUISITOS PREVIOS

- [AWS Account](https://aws.amazon.com/)
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 18+](https://nodejs.org/)
- Credenciales AWS configuradas: `aws configure`

---

## 🏗️ ARQUITECTURA AWS

```
┌─────────────────────────────────────────────────────────┐
│                     AWS REGIÓN: us-east-1               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ECR (Elastic Container Registry)                │   │
│  │  • transit-ai-backend:latest                     │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ECS (Elastic Container Service)                 │   │
│  │  • Cluster: transit-ai-cluster                   │   │
│  │  • Service: transit-ai-backend                   │   │
│  │  • Task Definition: transit-ai-backend:1         │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ALB (Application Load Balancer)                 │   │
│  │  • Port 80/443 → ECS Service                     │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  RDS PostgreSQL Database                         │   │
│  │  • Instance: transit-ai-db                       │   │
│  │  • Engine: PostgreSQL 14+                        │   │
│  │  • Storage: 20GB-100GB (auto-scaling)            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ PASO 1: CREAR INFRAESTRUCTURA EN AWS

### 1.1 Crear ECR Repository

```bash
aws ecr create-repository \
  --repository-name transit-ai-backend \
  --region us-east-1 \
  --image-tag-mutability MUTABLE \
  --image-scan-configuration scanOnPush=true
```

**Salida esperada:** Guarda el URI del repositorio (ej: `123456789.dkr.ecr.us-east-1.amazonaws.com/transit-ai-backend`)

### 1.2 Crear RDS PostgreSQL Database

#### Opción A: AWS Console (Recomendado para principiantes)

1. Ve a **RDS → Databases → Create database**
2. Selecciona:
   - **Engine**: PostgreSQL 14.7+
   - **DB Instance Class**: `db.t3.micro` (gratis)
   - **Allocated Storage**: 20 GB
   - **DB Instance Identifier**: `transit-ai-db`
   - **Master Username**: `admin`
   - **Master Password**: `YourSecurePassword123!` (guarda esto)
   - **VPC**: Default VPC
   - **Publicly Accessible**: Yes (para testing)

3. Haz clic en **Create database**
4. Espera 5-10 minutos a que esté disponible

#### Opción B: CLI (Para expertos)

```bash
aws rds create-db-instance \
  --db-instance-identifier transit-ai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --publicly-accessible \
  --storage-encrypted \
  --backup-retention-period 7 \
  --multi-az false \
  --region us-east-1
```

### 1.3 Obtener el Endpoint de RDS

```bash
aws rds describe-db-instances \
  --db-instance-identifier transit-ai-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

**Resultado:** `transit-ai-db.abc123xyz.us-east-1.rds.amazonaws.com`

### 1.4 Crear Security Group (Firewall)

```bash
# Obtener VPC ID
VPC_ID=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)

# Crear Security Group
SG_ID=$(aws ec2 create-security-group \
  --group-name transit-ai-sg \
  --description "Security group for Transit AI RDS and ECS" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

# Abrir puerto PostgreSQL (5432)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0

# Abrir puertos HTTP/HTTPS (80/443)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

echo "Security Group creado: $SG_ID"
```

### 1.5 Actualizar RDS Security Group

```bash
aws rds modify-db-instance \
  --db-instance-identifier transit-ai-db \
  --vpc-security-group-ids $SG_ID \
  --apply-immediately
```

---

## ⚙️ PASO 2: PREPARAR ARCHIVOS LOCALES

### 2.1 Crear `.env.production`

```bash
cp .env.production.example .env.production
```

Edita `.env.production` con tus valores:

```bash
# Base de datos (obtén el endpoint de paso 1.3)
DATABASE_URL=postgresql://admin:YourSecurePassword123!@transit-ai-db.abc123xyz.us-east-1.rds.amazonaws.com:5432/transit_ai_prod

# JWT (genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_64_char_random_string_here_min_32

# Frontend URL
FRONTEND_URL=https://tu-dominio.com

# Los demás valores según lo indicado en .env.production.example
```

### 2.2 Verificar Dockerfile

El `Dockerfile` ya existe. Verifica que contenga:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 4000
CMD ["npm", "run", "start"]
```

### 2.3 Crear `.dockerignore`

```bash
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
.next
dist
build
coverage
.DS_Store
EOF
```

---

## 🚀 PASO 3: EJECUTAR DEPLOYMENT

### 3.1 Hacer el script ejecutable

```bash
chmod +x deploy-aws.sh
```

### 3.2 Definir variables de entorno

```bash
export AWS_ACCOUNT_ID=123456789  # Tu AWS Account ID (obtén con: aws sts get-caller-identity)
export AWS_REGION=us-east-1
export ECR_REPOSITORY=transit-ai-backend
export IMAGE_TAG=latest
```

### 3.3 Ejecutar deployment

```bash
./deploy-aws.sh
```

El script ejecutará automáticamente:
- ✅ Compilación de NestJS
- ✅ Construcción de imagen Docker
- ✅ Push a ECR
- ✅ Migraciones de base de datos
- ✅ Seed (datos iniciales)

---

## 📊 PASO 4: CREAR SERVICIO ECS

### 4.1 Crear ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name transit-ai-cluster \
  --region us-east-1
```

### 4.2 Crear Task Definition

```bash
cat > task-definition.json << 'EOF'
{
  "family": "transit-ai-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "transit-ai-backend",
      "image": "YOUR_ECR_URI:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/transit-ai-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "4000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:transit-ai-db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:jwt-secret"
        }
      ]
    }
  ],
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole"
}
EOF

# Actualizar imagen ECR
sed -i "s|YOUR_ECR_URI|YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/transit-ai-backend|g" task-definition.json

# Registrar Task Definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

### 4.3 Crear Servicio ECS

```bash
aws ecs create-service \
  --cluster transit-ai-cluster \
  --service-name transit-ai-backend \
  --task-definition transit-ai-backend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

---

## 🌐 PASO 5: CONFIGURAR DOMINIO (Opcional)

### 5.1 Obtener IP pública del ALB

```bash
aws elbv2 describe-load-balancers \
  --names transit-ai-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

### 5.2 Crear record DNS

En tu proveedor de dominios (GoDaddy, Route53, etc.):

```
Tipo: CNAME
Nombre: api
Valor: <ALB_DNS_NAME>
TTL: 300
```

---

## ✅ VERIFICACIÓN

### Verificar que todo está corriendo

```bash
# Ver servicios ECS
aws ecs describe-services \
  --cluster transit-ai-cluster \
  --services transit-ai-backend

# Ver logs
aws logs tail /ecs/transit-ai-backend --follow

# Probar API
curl -X GET http://ALB_IP_OR_DOMAIN/salud

# Verificar base de datos
psql -h transit-ai-db.abc123.us-east-1.rds.amazonaws.com \
     -U admin \
     -d transit_ai_prod \
     -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 💰 COSTOS ESTIMADOS (Mensual)

| Servicio | Costo |
|----------|-------|
| RDS t3.micro | $7-10 |
| ECR Storage | $0.10 per GB |
| ECS Fargate | ~$15-30 |
| Data Transfer | Variable |
| **TOTAL** | **~$25-50** |

---

## 🛠️ TROUBLESHOOTING

### Error: "Base de datos no accesible"
```bash
# Verificar conectividad
nc -zv transit-ai-db.abc123.us-east-1.rds.amazonaws.com 5432
```

### Error: "Task fails to start"
```bash
# Ver logs detallados
aws ecs describe-tasks \
  --cluster transit-ai-cluster \
  --tasks <TASK_ARN>
```

### Error: "Image not found in ECR"
```bash
# Verificar imagen
aws ecr describe-images --repository-name transit-ai-backend

# Re-push si es necesario
./deploy-aws.sh
```

---

## 📚 RECURSOS ÚTILES

- [AWS RDS Docs](https://docs.aws.amazon.com/rds/)
- [AWS ECS Docs](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Docs](https://docs.aws.amazon.com/ecr/)
- [Prisma Deploy Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate/deploy-migrations-to-production)

---

**¿Preguntas?** Revisa los logs o contacta al equipo DevOps.
