#!/bin/sh

echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "⚠️  Las migraciones fallaron, pero continuando..."
fi

echo "🌱 Ejecutando seed..."
npx prisma db seed 2>/dev/null || echo "⚠️  Seed falló, ignorando..."

echo "🚀 Iniciando aplicación..."
exec node dist/main
