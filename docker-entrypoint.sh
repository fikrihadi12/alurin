#!/bin/sh
set -e

echo "==> Sinkronisasi skema database PostgreSQL ALURIN..."
until npx prisma db push --schema=./prisma/schema.prod.prisma --skip-generate; do
  echo "Database PostgreSQL belum siap, mencoba kembali dalam 3 detik..."
  sleep 3
done

echo "==> Skema database PostgreSQL berhasil disinkronkan!"
echo "==> Memulai server ALURIN pada port 3000..."
exec node server.js
