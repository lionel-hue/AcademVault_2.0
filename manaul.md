# 🚀 ACADEMVAULT - PLATEFORME DE RECHERCHE INTELLIGENTE

## 📋 CONSIDÉRATIONS CRITIQUES & ARCHITECTURE DU PROJET

### 1. ARCHITECTURE DU PROJET
- **Frontend**: Next.js 14 avec JavaScript et Tailwind CSS (dossier `/client`)
- **Backend**: Laravel 11 API (dossier `/server`)
- **Base de données**: MySQL avec schéma en anglais
- **Authentification**: Tokens JWT via Laravel Sanctum
- **Architecture**: SÉPARÉE (frontend et backend indépendants)

### 2. STRUCTURE DU PROJET
```
AcademVault/
├── client/                    # Application Next.js (PORT 3000)
│   ├── src/
│   │   ├── app/              # Pages Next.js (App Router)
│   │   ├── components/       # Composants React
│   │   ├── lib/              # Bibliothèques et utilitaires
│   │   ├── styles/           # Styles CSS/Tailwind
│   │   └── utils/            # Fonctions utilitaires
│   ├── public/               # Assets statiques
│   └── package.json          # Dépendances Next.js
├── server/                   # API Laravel (PORT 8000)
│   ├── app/                  # Application Laravel
│   ├── database/             # Migrations, modèles, seeders
│   ├── routes/               # Routes API
│   └── composer.json         # Dépendances PHP
└── manual.md                 # Documentation du projet
```

### 3. CONVENTIONS DE NOMENCLATURE
- **Tables de base de données**: Noms en anglais pluriel (`users`, `documents`, `categories`)
- **Colonnes**: Noms en snake_case (`created_at`, `updated_at`)
- **Modèles Laravel**: Noms singuliers avec première lettre majuscule (`User`, `Document`)
- **Composants React**: PascalCase avec dossiers organisés par fonctionnalité

### 4. SYSTÈME DE TAGS
- **Tags multidimensionnels**: Organisation des ressources par thèmes
- **Recherche intelligente**: Tags comme critères de recherche avancée
- **Filtrage dynamique**: Combinaison de tags pour des résultats précis
- **Interface visuelle**: Système de tags colorés avec compteurs

---

## 🔧 ÉTAT ACTUEL DE L'IMPLÉMENTATION

### ✅ FRONTEND (Next.js) - COMPLÉTÉ
- **Architecture SPA**: Navigation fluide sans rechargement
- **Sections dynamiques**: Chargement asynchrone des contenus
- **Système de tags**: Interface complète de gestion des tags
- **Design responsive**: Mobile-first avec Tailwind CSS
- **Mock Data**: Données de démonstration complètes

### 🚧 BACKEND (Laravel) - EN COURS
- ✅ **Base de données**: Configuration MySQL terminée
- ✅ **Migrations personnalisées**: Tables créées sans migrations par défaut Laravel
- 🚧 **Modèles Eloquent**: À implémenter
- 🚧 **API RESTful**: Endpoints à développer
- 🚧 **Authentification**: Laravel Sanctum à configurer
- 🚧 **Gestion des fichiers**: Upload et stockage à implémenter

---

## 🛠️ INSTALLATION ET CONFIGURATION

### 1. PRÉREQUIS
- Node.js 18+ et npm
- PHP 8.2+ et Composer
- MySQL 8.0+
- Git

### 2. INSTALLATION DU FRONTEND (Next.js)
```bash
# Naviguer dans le dossier client
cd client

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Accéder à l'application
# http://localhost:3000
```

### 3. INSTALLATION DU BACKEND (Laravel)
```bash
# Naviguer dans le dossier server
cd server

# Installer les dépendances PHP
composer install

# Configurer l'environnement
cp .env.example .env
```

#### Configuration de la base de données MySQL
```bash
# Créer la base de données et l'utilisateur
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
```

#### Configurer le fichier `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=AcademVault
DB_USERNAME=academ_vault_user
DB_PASSWORD=Secret123!
```

#### Exécuter les migrations
```bash
# Générer la clé d'application
php artisan key:generate

# Supprimer les migrations par défaut de Laravel (garder seulement les nôtres)
rm -f database/migrations/0001_*.php

# Exécuter nos migrations personnalisées
php artisan migrate
```

#### Démarrer le serveur API
```bash
php artisan serve --port=8000
# Accéder à l'API: http://localhost:8000
```

---

## 🏗️ ARCHITECTURE TECHNIQUE

### 1. ARCHITECTURE FRONTEND (Next.js 14)
- **App Router**: Routeur moderne de Next.js 14
- **JavaScript Pur**: Pas de TypeScript pour un développement plus rapide
- **Tailwind CSS v3**: Framework CSS utilitaire stable
- **Axios**: Client HTTP pour les appels API
- **Context API**: Gestion d'état global

### 2. ARCHITECTURE BACKEND (Laravel 11)
- **API RESTful**: Architecture API-first
- **Migrations personnalisées**: Sans tables par défaut Laravel (pas de cache, jobs, etc.)
- **Eloquent ORM**: Relations avancées entre modèles
- **Laravel Sanctum**: Authentification par tokens légers
- **Validation robuste**: Validation des données côté serveur

### 3. STRUCTURE DE LA BASE DE DONNÉES
#### Tables principales :
1. **users** - Utilisateurs avec rôles (enseignant/étudiant) et permissions
2. **categories** - Catégories de recherche organisées
3. **documents** - Ressources académiques avec métadonnées complètes
4. **tags** - Système d'étiquettes pour classification
5. **collections** - Collections organisées avec priorités
6. **friendships** - Relations sociales entre chercheurs
7. **discussions** - Forums et groupes de discussion
8. **bookmarks** - Signets personnels avec dossiers
9. **history** - Historique des actions utilisateur
10. **notifications** - Système de notifications

---

## 📊 SCHÉMA DE BASE DE DONNÉES

### TABLES CRITIQUES

#### 1. USERS
```sql
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('teacher','student') NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `registration_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `role` enum('admin','moderator','user') NOT NULL DEFAULT 'user',
  `profile_image` varchar(255) DEFAULT NULL,
  `bio` text,
  `institution` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
);
```

#### 2. DOCUMENTS
```sql
CREATE TABLE `documents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('pdf','video','article_link','website','image','presentation') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `author` varchar(255) DEFAULT NULL,
  `publication_year` year DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `isbn` varchar(255) DEFAULT NULL,
  `doi` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `page_count` int DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `download_count` int NOT NULL DEFAULT '0',
  `rating` float NOT NULL DEFAULT '0',
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `license` enum('cc-by','cc-by-sa','cc-by-nc','cc-by-nc-sa','copyright','public_domain') NOT NULL DEFAULT 'copyright',
  `metadata` json DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

---

## 🔌 API ENDPOINTS PRIORITAIRES

### 1. AUTHENTIFICATION (Phase 1)
```
POST   /api/auth/register     # Inscription utilisateur
POST   /api/auth/login        # Connexion
POST   /api/auth/logout       # Déconnexion
GET    /api/auth/user         # Profil utilisateur
```

### 2. DOCUMENTS (Phase 2)
```
GET    /api/documents         # Liste des documents
POST   /api/documents         # Upload d'un document
GET    /api/documents/{id}    # Détail d'un document
PUT    /api/documents/{id}    # Modification
DELETE /api/documents/{id}    # Suppression
GET    /api/documents/search  # Recherche avancée
```

### 3. CATÉGORIES & TAGS (Phase 3)
```
GET    /api/categories        # Liste des catégories
POST   /api/categories        # Création catégorie
GET    /api/tags              # Tags populaires
POST   /api/documents/{id}/tags # Ajout tags à document
```

### 4. RÉSEAU SOCIAL (Phase 4)
```
GET    /api/friends           # Liste d'amis
POST   /api/friends/request   # Demande d'amitié
POST   /api/friends/{id}/accept # Accepter demande
GET    /api/friends/suggestions # Suggestions
```

---

## 🚀 DÉPLOIEMENT LOCAL

### Configuration multi-port
```bash
# Frontend (Next.js) - Port 3000
cd client
npm run dev

# Backend (Laravel) - Port 8000
cd server
php artisan serve --port=8000

# Base de données (MySQL) - Port 3306
# Vérifier que MySQL tourne
sudo service mysql status
```

### Variables d'environnement critiques
**Frontend (.env.local)** :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env)** :
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

---

## 🐛 DÉPANNAGE RAPIDE

### 1. Problèmes de migration
```bash
# Si conflit de tables existantes
php artisan db:wipe
php artisan migrate

# Vérifier les tables créées
mysql -u academ_vault_user -pSecret123! -e "USE AcademVault; SHOW TABLES;"
```

### 2. Problèmes CORS (Frontend ne peut pas appeler l'API)
```bash
# Installer le package CORS
cd server
composer require fruitcake/laravel-cors

# Configurer dans config/cors.php
'allowed_origins' => ['http://localhost:3000'],
```

### 3. Images non affichées (Frontend)
```bash
# Vérifier l'extension Tailwind CSS IntelliSense dans VS Code
# L'erreur "@tailwind unknown rule" est un faux positif VS Code
```

---

## 📈 ROADMAP DE DÉVELOPPEMENT

### PHASE 1: FONDATIONS (EN COURS)
- ✅ Frontend Next.js avec JavaScript
- ✅ Configuration base de données MySQL
- ✅ Migrations personnalisées Laravel
- 🚧 Modèles Eloquent et relations
- 🚧 Authentification Sanctum

### PHASE 2: CORE FONCTIONNALITÉS
- 🚧 CRUD Documents avec upload fichiers
- 🚧 Système de recherche basique
- 🚧 Gestion catégories et tags
- 🚧 Interface dashboard

### PHASE 3: RÉSEAU SOCIAL
- 🚧 Système d'amis et demandes
- 🚧 Discussions et messagerie
- 🚧 Partage de documents
- 🚧 Notifications

### PHASE 4: OPTIMISATIONS
- 🚧 Recherche avancée avec Elasticsearch
- 🚧 Analytics et statistiques
- 🚧 Export/Import de données
- 🚧 API publique

---

## 🔐 SÉCURITÉ

### Mesures implémentées
1. **Hash des mots de passe** : Bcrypt par défaut Laravel
2. **Protection CSRF** : Désactivée pour API, activée pour web
3. **Validation des données** : Rules Laravel strictes
4. **SQL Injection** : Prévenue par Eloquent ORM
5. **XSS Protection** : Blade templates échappement automatique

### À implémenter
1. **Rate Limiting** : Limitation des requêtes API
2. **HTTPS** : Obligatoire en production
3. **Audit Logs** : Journalisation des actions sensibles
4. **2FA** : Authentification à deux facteurs optionnelle

---

## 📝 CONVENTIONS DE CODE

### Frontend (JavaScript/React)
```javascript
// Composants : PascalCase
function UserProfile() {}

// Hooks : useCamelCase
const useAuth = () => {};

// Fichiers : kebab-case pour les dossiers, PascalCase pour composants
src/components/UserProfile/UserProfile.jsx
```

### Backend (PHP/Laravel)
```php
// Modèles : PascalCase singulier
class User extends Model {}

// Contrôleurs : PascalCase + Controller
class DocumentController extends Controller {}

// Migrations : snake_case descriptif
2025_12_25_create_academvault_users_table.php
```

### Git Commit Messages
```
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation
style:    Formatage (sans changement fonctionnel)
refactor: Refactoring de code
test:     Tests
chore:    Tâches de maintenance
```

---

## 🤝 CONTRIBUTION

### Workflow recommandé
1. **Fork** du repository principal
2. **Branche feature** : `feature/nom-fonctionnalite`
3. **Développement** avec tests
4. **Pull Request** avec description détaillée
5. **Code Review** par au moins un développeur
6. **Merge** après approbation

### Standards de qualité
- ✅ Tests unitaires pour nouvelles fonctionnalités
- ✅ Documentation mise à jour
- ✅ Code suivant les conventions établies
- ✅ Pas de régressions fonctionnelles
- ✅ Revue sécurité pour modifications sensibles

---

## 📄 LICENCE

### MIT License
Le code source d'AcademVault est distribué sous licence MIT, permettant une utilisation libre pour des projets personnels et commerciaux.

### Restrictions
- **Données académiques** : Respect des droits d'auteur et licences
- **Contenu utilisateur** : Responsabilité des contributeurs
- **Usage commercial** : Autorisé avec attribution

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0-alpha  
**Statut** : Développement actif  
**Prochaine milestone** : API d'authentification fonctionnelle  

---
*Document maintenu par l'équipe de développement AcademVault*