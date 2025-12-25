# AcademVault - Plateforme de Recherche Intelligente

Une plateforme académique moderne pour organiser, rechercher et partager des ressources de recherche. Système d'authentification complet avec vérification par email et JWT.

## 🚀 Installation Locale Rapide

### ⚡ Prérequis
- **Node.js** 18+ et npm
- **PHP** 8.2+ et Composer 2.5+
- **MySQL** 8.0+
- **Git**

### 📥 1. Cloner le Projet
```bash
git clone <repository-url>
cd AcademVault
```

### 🖥️ 2. Configuration du Backend (Laravel 12)
```bash
# Accéder au dossier backend
cd server

# Installer les dépendances PHP
composer install

# Configurer l'environnement
cp .env.example .env

# Configurer la base de données MySQL
mysql -u root -p <<EOF
CREATE DATABASE IF NOT EXISTS AcademVault 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'academ_vault_user'@'localhost' 
IDENTIFIED BY 'Secret123!';

GRANT ALL PRIVILEGES ON AcademVault.* 
TO 'academ_vault_user'@'localhost';

FLUSH PRIVILEGES;
EOF

# Générer la clé d'application
php artisan key:generate

# Configurer JWT
php artisan jwt:secret --force

# Exécuter les migrations
php artisan migrate

# Démarrer le serveur (Port 8000)
php artisan serve --port=8000
```

### 🎨 3. Configuration du Frontend (Next.js 14)
```bash
# Accéder au dossier frontend
cd client

# Installer les dépendances Node.js
npm install

# Configurer l'environnement
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
echo "NEXT_PUBLIC_APP_NAME=AcademVault" >> .env.local

# Démarrer le serveur de développement (Port 3000)
npm run dev
```

### 📧 4. Configuration de l'Email (Optionnel - pour emails réels)
```bash
# Modifier server/.env et ajouter:
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_application
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=votre_email@gmail.com
MAIL_FROM_NAME="AcademVault"
```

## 🌐 Accès à l'Application
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000/api
- **Base de données** : MySQL sur localhost:3306

## 🎯 Fonctionnalités Principales

### ✅ Système d'Authentification Complet
- **Inscription en 5 étapes** avec progression visuelle
- **Vérification par email** avec codes à 6 chiffres
- **Authentification JWT** avec tokens sécurisés
- **Routes protégées** avec middleware
- **Gestion de session** avec localStorage

### 🎨 Interface Utilisateur
- **Thème sombre moderne** avec effets glassmorphism
- **Design responsive** pour mobile, tablette et desktop
- **Animations fluides** et micro-interactions
- **Validation en temps réel** des formulaires
- **Indicateur de force de mot de passe**

### 📧 Système d'Email
- **Envoi d'emails réel** via Gmail SMTP
- **Template professionnel** avec thème sombre
- **Codes de vérification** à 6 chiffres
- **Mode développement** avec logging dans la console

## 🔧 Commandes Utiles

### Backend (Laravel)
```bash
cd server

# Migration de base de données
php artisan migrate:fresh

# Générer des données de test
php artisan db:seed

# Vider les caches
php artisan optimize:clear

# Lister les routes API
php artisan route:list | grep api
```

### Frontend (Next.js)
```bash
cd client

# Démarrer en mode développement
npm run dev

# Construire pour production
npm run build

# Lancer en production
npm start

# Analyser le bundle
npm run analyze
```

## 🐛 Dépannage

### Problèmes Courants

#### 1. **Erreurs de migration**
```bash
# Réinitialiser la base de données
php artisan db:wipe
php artisan migrate

# Regénérer la clé JWT
php artisan jwt:secret --force
```

#### 2. **Erreurs CORS**
```bash
# Vérifier le middleware CORS dans bootstrap/app.php
# S'assurer que le frontend URL est correct
```

#### 3. **Emails non envoyés**
```bash
# Vérifier les logs Laravel
tail -f storage/logs/laravel.log

# Tester l'envoi d'email
php artisan tinker
>>> Mail::raw('Test', fn($m) => $m->to('test@example.com')->subject('Test'))
```

#### 4. **Erreurs de port**
```bash
# Vérifier les ports utilisés
sudo lsof -i :8000
sudo lsof -i :3000

# Tuer les processus
sudo kill -9 <PID>
```

## 📁 Structure du Projet
```
AcademVault/
├── client/                 # Application Next.js 14
│   ├── src/app/           # Pages et routes
│   ├── src/lib/           # Utilitaires (auth, modals)
│   └── public/            # Assets statiques
│
└── server/                # API Laravel 12
    ├── app/               # Logique métier
    ├── database/          # Migrations et seeders
    ├── routes/            # Routes API
    └── resources/         # Vues et templates email
```

## 🔒 Sécurité

### Configuration Sécurisée
- **JWT tokens** avec expiration automatique
- **Hashage bcrypt** pour les mots de passe
- **Validation d'entrée** côté serveur
- **Protection CORS** configurée
- **Rate limiting** sur les endpoints API

### Variables d'Environnement
```env
# Toujours garder confidentielles
APP_KEY=...
JWT_SECRET=...
DB_PASSWORD=...
MAIL_PASSWORD=...
```

## 🤝 Contribution

### Processus de Contribution
1. **Fork** le dépôt
2. **Créer une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Commiter les changements** : `git commit -m "feat: description"`
4. **Pousser la branche** : `git push origin feature/nouvelle-fonctionnalite`
5. **Ouvrir une Pull Request**

### Standards de Code
- Suivre les règles ESLint/Prettier
- Écrire des tests pour les nouvelles fonctionnalités
- Documenter les changements majeurs
- Maintenir la cohérence du code

## 📞 Support

### Ressources
- **Documentation détaillée** : Voir `manual.md`
- **API Endpoints** : http://localhost:8000/api
- **Logs Backend** : `server/storage/logs/laravel.log`
- **Logs Frontend** : Console du navigateur

### Tests
```bash
# Tester l'API
curl -X POST http://localhost:8000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Tester la santé de l'API
curl http://localhost:8000/api/health
```

## 🚀 Déploiement

### Préparation Production
```bash
# Frontend
cd client
npm run build

# Backend
cd server
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Variables Production
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

# Configurer la base de données production
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

# Configurer l'email production
MAIL_MAILER=...
MAIL_HOST=...
```

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

**✨ Système complet d'authentification opérationnel !**  
**📧 Emails de vérification fonctionnels !**  
**🎨 Interface utilisateur moderne et responsive !**

Pour toute question, consultez le fichier `manual.md` pour la documentation complète du système.