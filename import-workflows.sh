#!/bin/bash
# Créer les workflows n8n automatiquement

N8N_URL="https://n8n.superprojetx.com"
API_KEY="${1:-}"

if [ -z "$API_KEY" ]; then
  echo "Usage: $0 <N8N_API_KEY>"
  echo "Obtenez votre API key dans n8n: Settings > API"
  exit 1
fi

echo "🚀 Création des workflows n8n..."

for file in n8n-workflows/*.json; do
  echo "Import: $file"
  curl -s -X POST "$N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d @$file | jq -r '.id // .message'
done

echo ""
echo "✅ Workflows créés !"
echo "Allez sur $N8N_URL/workflows pour les activer"
