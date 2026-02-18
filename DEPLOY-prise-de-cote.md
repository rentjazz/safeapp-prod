# 🚀 Déploiement - Branche Prise de Côte

## 📋 Résumé des changements

Cette branche ajoute un nouvel onglet **"Prise de Côte"** pour gérer les fiches techniques des coffres-forts avec :
- 📸 Upload de photos
- 🎤 Dictée vocale (transcription auto)
- 📝 Saisie des cotes
- 📧 Export par email

## 🔄 Pour publier cette branche sur GitHub

```bash
# 1. Aller dans le repo local
cd /chemin/vers/safeapp-prod

# 2. Récupérer cette branche
git fetch origin
git checkout feature/prise-de-cote

# 3. Pousser sur GitHub (si tu as les droits)
git push -u origin feature/prise-de-cote
```

Ou si tu veux copier les fichiers manuellement :

```bash
# Copier depuis /tmp/safeapp-prod
cp /tmp/safeapp-prod/src/components/PriseDeCote.jsx src/components/
cp /tmp/safeapp-prod/src/App.js src/
cp /tmp/safeapp-prod/package.json .
```

## 🏗️ Build et déploiement

### 1. Installer les nouvelles dépendances

```bash
npm install
```

(Nouvelles deps : @mui/material, @mui/icons-material, @emotion/react, @emotion/styled)

### 2. Build

```bash
npm run build
```

### 3. Déployer sur le serveur

```bash
# Copier le nouveau build
scp -r build/* root@31.97.155.126:/docker/safeapp/build/

# Ou si tu utilises le déploiement automatique GitHub Actions:
git push origin feature/prise-de-cote
# Puis créer une PR vers main
```

## ⚙️ Configuration requise

Les workflows n8n sont **déjà déployés** :
- `safeapp-cotes-save` (POST)
- `safeapp-cotes-list` (GET)
- `safeapp-cotes-delete` (DELETE)
- `safeapp-upload-photo` (POST)
- `safeapp-send-email` (POST)

### Vérifier qu'ils sont actifs :
https://n8n.superprojetx.com/workflows

### Credential Gmail (pour l'envoi d'email)
Vérifier que le credential "Gmail account" est bien connecté :
https://n8n.superprojetx.com/credentials

Si besoin, voir le guide : `CONFIG-GMAIL.md`

---

## ✅ Checklist déploiement

- [ ] `npm install` fait
- [ ] `npm run build` réussi
- [ ] Build copié sur le serveur
- [ ] Workflows n8n actifs vérifiés
- [ ] Test création d'une fiche
- [ ] Test envoi email
