#!/bin/bash

echo "🚀 Transit AI ML Service Setup"
echo "================================"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Virtual env
echo -e "${BLUE}1. Creando virtual environment...${NC}"
python -m venv venv
source venv/bin/activate

# 2. Dependencias
echo -e "${BLUE}2. Instalando dependencias...${NC}"
pip install -r requirements.txt

# 3. Env file
echo -e "${BLUE}3. Configurando variables de entorno...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Edita .env con tus configuraciones"
fi

# 4. Crear directorio de modelos
echo -e "${BLUE}4. Creando directorio de modelos...${NC}"
mkdir -p ml_models

# 5. Migraciones
echo -e "${BLUE}5. Ejecutando migraciones...${NC}"
python manage.py migrate

# 6. Crear superuser (opcional)
echo -e "${BLUE}6. Crear superuser? (s/n)${NC}"
read -r -n 1 response
if [[ "$response" == "s" ]]; then
    python manage.py createsuperuser
fi

echo -e "${GREEN}"
echo "✅ Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. Terminal 1: python manage.py runserver"
echo "2. Terminal 2: celery -A config worker -l info"
echo "3. Terminal 3: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler"
echo ""
echo "Acceder a:"
echo "- API: http://localhost:8000/api/"
echo "- Admin: http://localhost:8000/admin/"
echo -e "${NC}"
