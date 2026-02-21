#!/bin/bash
# ============================================================
# deploy.sh — Lokal mashinadan ishga tushiring
# Ishlatish: bash deploy.sh
# ============================================================
set -e

SERVER="ubuntu@3.71.116.9"
PEM="/c/Users/Kamronbek/Desktop/projects/intizom.pem"
REMOTE_DIR="/home/ubuntu/intizom"

echo "=== Intizom Deploy ==="
echo "Server: $SERVER"
echo ""

# PEM fayl ruxsatlarini to'g'rilash
chmod 400 "$PEM" 2>/dev/null || true

echo "=== [1/3] Fayllarni serverga yuklash (rsync) ==="
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'logs' \
  --exclude '*.log' \
  --exclude 'backend/uploads' \
  --exclude 'backend/.env' \
  --exclude '.env' \
  -e "ssh -i $PEM -o StrictHostKeyChecking=no" \
  ./ "$SERVER:$REMOTE_DIR/"

echo ""
echo "=== [2/3] Backend .env faylini tekshirish ==="
# Agar server da .env yo'q bo'lsa, production template'dan yaratish
ssh -i "$PEM" -o StrictHostKeyChecking=no "$SERVER" "
  if [ ! -f $REMOTE_DIR/backend/.env ]; then
    echo 'DIQQAT: backend/.env topilmadi!'
    echo 'deploy/backend.env.production ni $REMOTE_DIR/backend/.env ga ko'chiring:'
    echo '  cp $REMOTE_DIR/deploy/backend.env.production $REMOTE_DIR/backend/.env'
    echo '  nano $REMOTE_DIR/backend/.env  # parollarni to'ldiring'
    exit 1
  else
    echo 'backend/.env mavjud — OK'
  fi
"

echo ""
echo "=== [3/3] Serverda build va restart ==="
ssh -i "$PEM" -o StrictHostKeyChecking=no "$SERVER" "bash $REMOTE_DIR/deploy/2-start-app.sh"

echo ""
echo "========================================="
echo "DEPLOY TUGADI!"
echo "  http://3.71.116.9"
echo "========================================="
