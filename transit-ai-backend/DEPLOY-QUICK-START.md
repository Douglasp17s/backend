# 🚀 TRANSIT AI - DEPLOY A AWS (QUICK START)

## ⚡ TL;DR - Ejecuta esto para desplegar

```bash
# 1. Configurar AWS CLI

aws configure
# 2. Crear infraestructura en AWS (ECR, RDS, ECS Cluster)
chmod +x setup-aws-infra.sh
./setup-aws-infra.sh

# 3. Editar variables de entorno
# IMPORTANTE: Actualizar JWT_SECRET, STRIPE keys, etc.
nano .env.production

# 4. Definir variables de entorno
export AWS_ACCOUNT_ID=YOUR_AWS_ACCOUNT_ID  # Ver con: aws sts get-caller-identity
export AWS_REGION=us-east-1

# 5. Ejecutar deployment
chmod +x quick-deploy.sh
./quick-deploy.sh

# 6. Verificar que está corriendo
aws ecs describe-services --cluster transit-ai-cluster --services transit-ai-backend
```

---

## 📦 Archivos creados para ti

| Archivo | Propósito |
|---------|-----------|
| `.env.production.example` | Template de variables de entorno |
| `setup-aws-infra.sh` | Crea ECR, RDS, Security Groups, ECS Cluster |
| `quick-deploy.sh` | Compila, build Docker, push a ECR, actualiza BD |
| `deploy-aws.sh` | Script completo con más detalles |
| `README-AWS-DEPLOYMENT.md` | Documentación detallada |
| `DEPLOY-QUICK-START.md` | Este archivo |

---

## 📋 QUÉ HACE CADA SCRIPT

### `setup-aws-infra.sh`
✅ Crea automáticamente:
- ECR Repository
- RDS PostgreSQL Database
- Security Groups (Firewall)
- ECS Cluster
- Genera `.env.production` con credenciales

**Tiempo:** ~10-15 minutos (espera por RDS)

### `quick-deploy.sh`
✅ Deploya aplicación:
- Compila NestJS
- Crea imagen Docker
- Sube a ECR
- Ejecuta migraciones Prisma
- Ejecuta seed
- Actualiza servicio ECS

**Tiempo:** ~5-10 minutos

---

## ✅ CHECKLIST ANTES DE EJECUTAR

- [ ] AWS Account creada
- [ ] AWS CLI instalado y configurado (`aws configure`)
- [ ] Docker instalado y corriendo
- [ ] Node.js 18+ instalado
- [ ] Git clone del repositorio
- [ ] Terminal en carpeta `transit-ai-backend/`

---

## 🔑 OBTENER AWS_ACCOUNT_ID

```bash
aws sts get-caller-identity --query Account --output text
```

Salida será algo como: `123456789012`

---

## ⚠️ PUNTOS IMPORTANTES

### 1. `.env.production`
Después de correr `setup-aws-infra.sh`, DEBES editar:

```bash
nano .env.production
```

Cambiar estos valores:
- `JWT_SECRET` → Generar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `STRIPE_SECRET_KEY` → Tu key real
- `STRIPE_PUBLISHABLE_KEY` → Tu key real
- `FRONTEND_URL` → Tu dominio o IP

### 2. Seguridad
- 🔒 NUNCA commits `.env.production`
- 🔒 Usa AWS Secrets Manager para producción
- 🔒 RDS tiene contraseña generada aleatoriamente

### 3. Costos AWS
- ECR: ~$0.10/GB almacenado
- RDS (t3.micro): ~$7-10/mes
- ECS Fargate: ~$15-30/mes
- **Total: ~$25-50/mes** (gratis si tienes free tier)

---

## 🎯 FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. setup-aws-infra.sh                                       │
│    ├── Crea ECR, RDS, Security Groups, ECS Cluster         │
│    └── Genera .env.production                               │
├─────────────────────────────────────────────────────────────┤
│ 2. Editar .env.production                                   │
│    └── Cambiar JWT_SECRET, STRIPE keys, FRONTEND_URL       │
├─────────────────────────────────────────────────────────────┤
│ 3. quick-deploy.sh                                          │
│    ├── Build Docker image                                   │
│    ├── Push a ECR                                           │
│    ├── Migraciones Prisma                                   │
│    ├── Seed                                                 │
│    └── Actualiza ECS Service                                │
├─────────────────────────────────────────────────────────────┤
│ 4. ✅ BACKEND CORRIENDO EN AWS                              │
│    └── Accesible en: http://ALB-DNS/                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 VERIFICAR QUE ESTÁ CORRIENDO

```bash
# Ver estado del servicio
aws ecs describe-services \
  --cluster transit-ai-cluster \
  --services transit-ai-backend \
  --query 'services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount}'

# Ver logs en tiempo real
aws logs tail /ecs/transit-ai-backend --follow

# Probar API (después de tener el ALB configurado)
curl http://tu-alb-dns.amazonaws.com/salud

# Conectar a BD desde local
psql -h $(aws rds describe-db-instances \
  --db-instance-identifier transit-ai-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text) \
  -U admin \
  -d transit_ai_prod \
  -c "SELECT COUNT(*) FROM \"User\";"
```

---

## ❌ TROUBLESHOOTING

### Error: "ECR not found"
```bash
# Crear ECR manualmente
aws ecr create-repository --repository-name transit-ai-backend --region us-east-1
```

### Error: "RDS connection timeout"
```bash
# Verifica Security Group permite puerto 5432
aws ec2 describe-security-groups --filters "Name=group-name,Values=transit-ai-sg"
```

### Error: "Task fails to start"
```bash
# Ver logs detallados
aws ecs describe-tasks \
  --cluster transit-ai-cluster \
  --tasks <TASK_ARN> \
  --query 'tasks[0].{Status:lastStatus,Reason:stoppedReason}'
```

### Error: ".env.production not found"
```bash
# setup-aws-infra.sh lo genera automáticamente
# Si no está, crear manualmente
cp .env.production.example .env.production
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Para detalles técnicos avanzados: `README-AWS-DEPLOYMENT.md`

---

## 💬 RESUMEN DE COMANDOS

| Tarea | Comando |
|-------|---------|
| Crear infraestructura | `./setup-aws-infra.sh` |
| Desplegar app | `./quick-deploy.sh` |
| Ver logs | `aws logs tail /ecs/transit-ai-backend --follow` |
| Ver estado ECS | `aws ecs describe-services --cluster transit-ai-cluster --services transit-ai-backend` |
| Conectar a BD | `psql -h transit-ai-db.xxx.us-east-1.rds.amazonaws.com -U admin -d transit_ai_prod` |
| Listar imágenes ECR | `aws ecr describe-images --repository-name transit-ai-backend` |

---

## 🎓 APRENDER MÁS

- [AWS RDS Docs](https://docs.aws.amazon.com/rds/)
- [AWS ECS Docs](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Docs](https://docs.aws.amazon.com/ecr/)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [NestJS Deployment](https://docs.nestjs.com/deployment)

---

**¿Listo?** Ejecuta: `./setup-aws-infra.sh` 🚀
