#!/bin/bash
# Déploiement complet

set -e

echo "🚀 Déploiement SafeApp"
echo "====================="

# 1. Déploiement Docker
echo "📦 Build et démarrage..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# 2. Attendre que ça démarre
echo "⏳ Attente du démarrage..."
sleep 5

# 3. Vérification
echo "🧪 Vérification..."
if curl -s http://localhost:3001 | grep -q "Safe"; then
  echo "✅ Frontend accessible sur http://localhost:3001"
else
  echo "❌ Frontend non accessible"
  docker-compose logs
  exit 1
fi

echo ""
echo "===================================="
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "===================================="
echo ""
echo "🌐 Accès: http://localhost:3001"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurer Nginx: ./setup-nginx.sh"
echo "2. Importer workflows n8n: ./import-workflows.sh <API_KEY>"
echo ""
