# SafeApp Dashboard - Documentation Technique

## 🎯 Vue d'ensemble
Dashboard de gestion pour Safe HDF (Rémy Baert) - Serrurier coffretier spécialisé dans les coffres-forts.

**Production :** https://safe.superprojetx.com

---

## 🏗️ Architecture

### Stack technique
- **Frontend :** React 18, CSS personnalisé (dark theme)
- **Backend/API :** n8n (webhooks)
- **Données :** Google APIs (Tasks, Calendar, Sheets)
- **Déploiement :** Docker + Docker Compose sur VPS Hostinger

### Flux de données
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  n8n Webhooks    │────▶│  Google APIs    │
│  (safe.super..) │◄────│  (superprojetx)  │◄────│  (Tasks/Cal/She)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

**Avantage :** Pas de backend Node.js à maintenir - tout passe par n8n qui gère déjà l'authentification OAuth2 avec Google.

---

## 📁 Structure du projet

```
safeapp-prod/
├── public/
│   └── index.html          # Configuration n8n URL
├── src/
│   ├── components/
│   │   ├── Overview.js     # Vue d'ensemble (KPIs)
│   │   ├── Tasks.js        # Gestion des tâches
│   │   ├── Calendar.js     # Rendez-vous
│   │   └── Stock.js        # Gestion du stock
│   ├── services/
│   │   └── api.js          # Appels API n8n
│   ├── App.js              # Router principal
│   └── App.css             # Styles
├── n8n-workflows/          # Workflows JSON exportés
│   ├── 01-get-tasks.json
│   ├── 02-get-calendar-v4.json
│   ├── 03-get-stock-final.json
│   └── ...
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

---

## 🔌 Workflows n8n

### 1. Get Tasks (`/webhook/safeapp-tasks`)
**Méthode :** GET

Récupère toutes les listes de tâches Google Tasks avec leurs items.

### 2. Create Task (`/webhook/safeapp-task-create`)
**Méthode :** POST

Crée une nouvelle tâche dans une liste spécifique.

### 3. Update Task (`/webhook/safeapp-task-update`)
**Méthode :** PUT

Modifie une tâche existante (statut, titre, notes).

### 4. Delete Task (`/webhook/safeapp-task-delete`)
**Méthode :** DELETE

Supprime une tâche.

### 5. Get Calendar Events (`/webhook/safeapp-calendar`)
**Méthode :** GET

Récupère les rendez-vous des 7 prochains jours.

**Options essentielles :**
```javascript
{
  "maxResults": 2500,
  "singleEvents": true,
  "orderBy": "startTime",
  "timeMin": "={{ new Date().toISOString() }}",
  "timeMax": "={{ new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }}"
}
```

### 6. Get Stock (`/webhook/safeapp-stock`)
**Méthode :** GET

Récupère tous les articles du Google Sheet.

### 7. Update Stock (`/webhook/safeapp-stock-update`)
**Méthode :** POST

Modifie la quantité d'un article.

---

## 🐛 Problèmes résolus & Solutions

### Problème 1 : Un seul élément retourné
**Symptôme :** Le webhook retournait 1 seul article au lieu de 33.

**Cause :** `responseMode: "lastNode"` ne retourne que le premier item.

**Solution :**
```json
{
  "responseMode": "responseNode",
  "nodes": [
    "Webhook",
    "Google API",
    {
      "type": "code",
      "code": "const arr = items.map(i => i.json); return [{ json: { data: arr } }];"
    },
    {
      "type": "respondToWebhook",
      "responseBody": "={{ JSON.stringify($json.data) }}"
    }
  ]
}
```

### Problème 2 : Vieux rendez-vous affichés
**Symptôme :** Calendar affichait des RDV de 2013.

**Cause :** Sans `timeMin`, Google Calendar retourne les 50 plus anciens événements.

**Solution :** Ajouter les options `timeMin`, `timeMax`, `singleEvents`, `orderBy`.

### Problème 3 : Format des données
**Symptôme :** n8n retourne `{json: {...}, pairedItem: {...}}` au lieu d'objets simples.

**Solution :** Utiliser `items.map(item => item.json)` pour extraire les données pures.

---

## 🚀 Déploiement

### Prérequis VPS
- Docker installé
- Docker Compose installé
- Git configuré

### Commandes de déploiement
```bash
# Connexion SSH
ssh root@31.97.155.126

# Aller dans le dossier
cd /opt/safeapp

# Récupérer les dernières modifications
git pull origin main

# Rebuild complet (important pour le cache)
docker compose down
docker compose build --no-cache
docker compose up -d

# Vérifier les logs
docker logs -f safeapp-dashboard
```

### En une ligne
```bash
cd /opt/safeapp && git pull && docker compose down && docker compose build --no-cache && docker compose up -d
```

---

## 📊 Sources de données

### Google Tasks
- Compte : remybaert@gmail.com
- Listes : "Safe HDF" (principale)

### Google Calendar
- Compte : remybaert@gmail.com
- Calendrier : primary

### Google Sheets - Stock
- **Spreadsheet ID :** `1qmSveh_54AGMoLNqLEbhvc53t8ul6ctR1L7jauD0qUo`
- **Feuille :** Feuille 1
- **Colonnes :**
  - A: Type
  - B: Marque
  - C: Modèle
  - D: Quantité restante
  - E: Quantité minimale
  - F: tarif unitaire HT
  - G: Valeur stock HT
  - H: Fournisseur
  - I: Lieu de stockage

---

## 🔧 Maintenance

### Mettre à jour les workflows n8n
1. Modifier le fichier JSON dans `n8n-workflows/`
2. Commit + push sur GitHub
3. Supprimer l'ancien workflow dans n8n (via API ou interface)
4. Importer le nouveau workflow
5. Activer le workflow

### Script d'import automatique
```bash
cd /data/.openclaw/workspace/safeapp-prod/n8n-workflows
API_KEY="..."
N8N_URL="https://n8n.superprojetx.com"

# Import
curl -s -X POST "$N8N_URL/api/v1/workflows" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -d @02-get-calendar-v4.json | jq -r '.id'

# Activation
curl -s -X POST "$N8N_URL/api/v1/workflows/ID/activate" \
  -H "X-N8N-API-KEY: $API_KEY" | jq -r '.active'
```

---

## 🎨 Personnalisation

### Modifier les couleurs
Éditer `src/App.css` :
```css
:root {
  --bg-primary: #0f0f1a;
  --bg-secondary: #1a1a2e;
  --bg-card: #252542;
  --accent-blue: #4facfe;
  --accent-green: #22c55e;
  --accent-orange: #f97316;
  --accent-red: #ef4444;
}
```

### Ajouter un onglet
1. Créer le composant dans `src/components/NouvelOnglet.js`
2. Ajouter dans `src/App.js` :
```javascript
import NouvelOnglet from './components/NouvelOnglet';
// ...
case 'nouveau':
  return <NouvelOnglet />;
```
3. Ajouter dans la navigation

---

## 📈 Prochaines améliorations

- [ ] Logo officiel Safe HDF dans le header
- [ ] Intégration Google Search Console (SEO)
- [ ] Flux RSS pour les actualités
- [ ] Notifications de stock faible (email/Telegram)
- [ ] Export PDF des rapports
- [ ] Mode hors-ligne (PWA)
- [ ] Authentification utilisateur

---

*Document créé le 15 février 2026 - SafeApp Dashboard v2.4*
