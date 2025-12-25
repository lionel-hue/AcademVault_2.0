# AcademVault - Plateforme de Recherche Intelligente

Une plateforme académique moderne pour organiser, rechercher et partager des ressources de recherche.

## 🚀 Installation Locale

### Prérequis
- Node.js 18+ et npm
- PHP 8.2+ et Composer
- MySQL 8.0+
- Git

### 1. Cloner le projet
```bash
git clone <repository-url>
cd AcademVault
```

### 2. Configuration du Backend (Laravel)
```bash
cd server

# Installer les dépendances PHP
composer install

# Configurer l'environnement
cp .env.example .env

# Créer la base de données MySQL
mysql -u root -p <<EOF
CREATE DATABASE IF NOT EXISTS AcademVault 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'academ_vault_user'@'localhost' 
IDENTIFIED BY 'Secret123!';

GRANT ALL PRIVILEGES ON AcademVault.* 
TO 'academ_vault_user'@'localhost';

GRANT PROCESS ON *.* 
TO 'academ_vault_user'@'localhost';

FLUSH PRIVILEGES;
EOF

# Mettre à jour le fichier .env avec les informations de la base de données
# Modifier les lignes suivantes dans server/.env :
DB_DATABASE=AcademVault
DB_USERNAME=academ_vault_user
DB_PASSWORD=Secret123!

# Générer la clé d'application
php artisan key:generate

# Supprimer les migrations par défaut de Laravel
rm -f database/migrations/0001_*.php

# Exécuter les migrations personnalisées
php artisan migrate

# Démarrer le serveur Laravel (Port 8000)
php artisan serve --port=8000
```

### 3. Configuration du Frontend (Next.js)
```bash
cd client

# Installer les dépendances Node.js
npm install

# Créer le fichier d'environnement
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env.local

# Démarrer le serveur de développement (Port 3000)
npm run dev
```

### 4. Accès à l'application
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Base de données** : MySQL sur localhost:3306

## 📁 Structure du Projet
```
AcademVault/
├── client/          # Application Next.js (Port 3000)
├── server/          # API Laravel (Port 8000)
└── README.md        # Ce fichier
```

## 🔧 Dépannage Rapide

### Problèmes de migration
```bash
# Dans le dossier server
php artisan db:wipe
php artisan migrate
```

### Problèmes CORS
```bash
# Dans le dossier server
composer require fruitcake/laravel-cors
```

### Images non affichées (erreur VS Code @tailwind)
- Installez l'extension "Tailwind CSS IntelliSense" dans VS Code
- L'erreur "@tailwind unknown rule" est un faux positif de VS Code

## 📞 Support

Pour toute question ou problème, consultez le fichier `manual.md` pour la documentation complète.

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.