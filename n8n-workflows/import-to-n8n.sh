#!/bin/bash
# Script d'import des workflows SafeApp dans n8n
# Usage: ./import-to-n8n.sh <n8n_session_cookie>

N8N_URL="https://n8n.superprojetx.com"
COOKIE="n8n-auth=$1"

WORKFLOWS=(
  "01-get-tasks.json:SafeApp - Get Tasks"
  "02-get-calendar.json:SafeApp - Get Calendar Events"
  "03-get-stock.json:SafeApp - Get Stock"
  "04-create-task.json:SafeApp - Create Task"
  "05-update-task.json:SafeApp - Update Task"
  "06-delete-task.json:SafeApp - Delete Task"
)

echo "Import des workflows SafeApp dans n8n..."
echo ""

for wf in "${WORKFLOWS[@]}"; do
  FILE="${wf%%:*}"
  NAME="${wf##*:}"
  echo -n "Import de $NAME... "
  
  RESULT=$(curl -s -X POST "$N8N_URL/rest/workflows" \
    -H "Content-Type: application/json" \
    -H "Cookie: $COOKIE" \
    -d "@$FILE")
  
  if echo "$RESULT" | grep -q '"id"'; then
    ID=$(echo "$RESULT" | grep -o '"id":[0-9]*' | cut -d: -f2)
    echo "✅ Créé (ID: $ID)"
  else
    echo "❌ Échec"
    echo "$RESULT" | head -1
  fi
done

echo ""
echo "Import terminé !"
echo "N'oublie pas d'activer les workflows dans l'interface n8n."
