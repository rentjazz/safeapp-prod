# SafeApp Dashboard - Guide de déploiement

## 🚀 Déploiement rapide (5 minutes)

### 1. Cloner et déployer

```bash
ssh root@31.97.155.126

cd /opt
git clone https://github.com/rentjazz/safeapp-prod.git safeapp
cd safeapp

# Lancer
docker-compose up -d --build
```

### 2. Configurer Nginx

```bash
# Copier la config
cp nginx.conf /etc/nginx/sites-available/safeapp
ln -sf /etc/nginx/sites-available/safeapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester et recharger
nginx -t
systemctl reload nginx
```

### 3. Vérifier

- Dashboard : https://safe.superprojetx.com

## 🔧 Workflows n8n à importer

1. Allez sur https://n8n.superprojetx.com
2. **Workflows** → **Import from File**
3. Importez les 6 fichiers dans `n8n-workflows/`
4. Activez chaque workflow

### Workflows requis :

| Fichier | Webhook | Description |
|---------|---------|-------------|
| 01-get-tasks.json | /webhook/safeapp-tasks | Récupérer les tâches |
| 02-get-calendar.json | /webhook/safeapp-calendar | Récupérer les RDV (3j) |
| 03-get-stock.json | /webhook/safeapp-stock | Récupérer le stock |
| 04-create-task.json | /webhook/safeapp-task-create | Créer une tâche |
| 05-update-task.json | /webhook/safeapp-task-update | Modifier une tâche |
| 06-delete-task.json | /webhook/safeapp-task-delete | Supprimer une tâche |

## 📊 Fonctionnalités

- ✅ **Tâches** : Liste, création, modification, suppression
- ✅ **Rendez-vous** : Affichage des 3 prochains jours
- ✅ **Stock** : Lecture du Google Sheets, alertes stock faible
- ✅ **Vue d'ensemble** : Dashboard avec stats

## 🔗 Google Sheets Stock

Le stock est lu depuis :
https://docs.google.com/spreadsheets/d/1qmSveh_54AGMoLNqLEbhvc53t8ul6ctR1L7jauD0qUo/edit?usp=sharing

Colonnes attendues : Référence, Nom, Qté, Min, Emplacement, Fournisseur

## 🐛 Dépannage

### Les données ne s'affichent pas
1. Vérifier les workflows n8n sont actifs
2. Vérifier les credentials Google sont assignés
3. Console navigateur (F12) → onglet Network

### Erreur CORS
Le frontend et n8n sont sur des domaines différents. Les workflows n8n doivent avoir CORS activé ou utiliser un proxy.

### Workflow n8n ne fonctionne pas
1. Ouvrir le workflow dans n8n
2. Cliquer "Execute Workflow" pour tester
3. Vérifier l'erreur dans l'onglet Executions
