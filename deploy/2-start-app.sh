#!/bin/bash
# ============================================================
# 2-start-app.sh — Serverda ilovani build va ishga tushirish
# SSH orqali yoki deploy.sh tomonidan chaqiriladi
# ============================================================
set -e

APP_DIR="/home/ubuntu/intizom"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
WEB_DIR="/var/www/intizom"

echo "=== [1/6] Backend dependencies o'rnatish ==="
cd "$BACKEND_DIR"
npm install --production=false

echo "=== [2/6] Backend build ==="
npm run build

echo "=== [3/6] Database migrate ==="
npx prisma db push

echo "=== [4/6] PM2 bilan backend ishga tushirish ==="
# Agar avval ishlab turgan bo'lsa, restart; bo'lmasa start
pm2 describe intizom-api > /dev/null 2>&1 && \
  pm2 restart ecosystem.config.js || \
  pm2 start ecosystem.config.js
pm2 save

echo "=== [5/6] Frontend build ==="
cd "$FRONTEND_DIR"
npm install
npm run build

echo "=== [6/6] Frontend fayllarini Nginx ga ko'chirish ==="
sudo cp -r "$FRONTEND_DIR/dist/." "$WEB_DIR/"

echo "=== Nginx konfiguratsiyasini yangilash ==="
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/intizom
sudo ln -sf /etc/nginx/sites-available/intizom /etc/nginx/sites-enabled/intizom
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "========================================="
echo "DEPLOY MUVAFFAQIYATLI!"
echo ""
echo "Frontend: http://3.71.116.9"
echo "Backend API: http://3.71.116.9/api"
echo "Swagger: http://3.71.116.9/api/docs"
echo ""
echo "PM2 holati: pm2 status"
echo "Backend logs: pm2 logs intizom-api"
echo "========================================="
