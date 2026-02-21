#!/bin/bash
# ============================================================
# 1-setup-server.sh — Serverda BIR MARTA ishga tushiring
# SSH orqali: bash 1-setup-server.sh
# ============================================================
set -e

echo "=== [1/6] Tizimni yangilash ==="
sudo apt-get update -y && sudo apt-get upgrade -y

echo "=== [2/6] Node.js 20 o'rnatish ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version && npm --version

echo "=== [3/6] PM2 o'rnatish ==="
sudo npm install -g pm2
pm2 --version

echo "=== [4/6] PostgreSQL o'rnatish ==="
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo ""
echo "========================================="
echo "PostgreSQL parolini o'rnating:"
echo "  sudo -u postgres psql"
echo "  ALTER USER postgres WITH PASSWORD 'YOUR_DB_PASSWORD';"
echo "  CREATE DATABASE intizom;"
echo "  \\q"
echo "========================================="
echo ""

echo "=== [5/6] Nginx o'rnatish ==="
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "=== [6/6] Papkalar va ruxsatlar ==="
sudo mkdir -p /var/www/intizom
sudo chown -R ubuntu:ubuntu /var/www/intizom
mkdir -p /home/ubuntu/intizom

echo ""
echo "========================================="
echo "Setup TUGADI!"
echo ""
echo "Keyingi qadam:"
echo "  1. PostgreSQL parolini o'rnating (yuqoridagi buyruqlar)"
echo "  2. deploy/backend.env.production faylini to'ldiring"
echo "  3. Lokal mashinadan deploy.sh ni ishga tushiring"
echo "========================================="
