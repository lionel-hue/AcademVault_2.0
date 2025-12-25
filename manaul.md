## 📄 MANUAL.MD MIS À JOUR

```markdown
# 🚀 ACADEMVAULT - PLATEFORME DE RECHERCHE INTELLIGENTE

## 📋 ÉTAT ACTUEL (DÉCEMBRE 2024)

### ✅ FRONTEND (Next.js 16) - FONCTIONNEL
- **Architecture** : App Router avec structure moderne
- **Pages implémentées** :
  - `/` - Page d'accueil publique avec options Signup/Login
  - `/signup` - Inscription multi-étapes (5 étapes)
  - `/login` - Connexion avec validation
  - `/dashboard` - Tableau de bord protégé
- **Authentification** : Système complet avec localStorage
- **Design** : Interface identique au design fourni (HTML/CSS/JS)
- **Responsive** : Mobile et desktop optimisés

### ✅ BACKEND (Laravel 11) - CONFIGURÉ
- **Base de données** : MySQL avec utilisateur dédié
- **Migrations** : 12 tables personnalisées sans conflits
- **Structure** : API REST prête pour développement
- **Configuration** : Environnement .env configuré

### 🚧 PROCHAINES ÉTAPES
1. Connecter le frontend à l'API Laravel
2. Implémenter les appels API réels
3. Développer les fonctionnalités CRUD
4. Ajouter le système de fichiers

## 🛠️ DÉPANNAGE & SOLUTIONS COMMUNES

### Problème : 404 sur la page d'accueil
**Solution** :
- Vérifier que `src/app/page.jsx` existe
- S'assurer qu'aucun fichier `pages/` n'existe (conflit App Router vs Pages Router)
- Nettoyer le cache Next.js : `rm -rf .next && npm run dev`

### Problème : Erreurs Tailwind CSS
**Solution** :
- L'erreur "@tailwind unknown rule" dans VS Code est un faux positif
- Installer l'extension "Tailwind CSS IntelliSense"
- Ajouter dans `.vscode/settings.json` :
```json
{
  "css.lint.unknownAtRules": "ignore"
}
```

### Problème : Authentification ne persiste pas
**Solution** :
- Vérifier que `localStorage` est accessible (client-side seulement)
- Les services d'authentification sont dans `src/lib/auth.js`
- Pour production, migrer vers des cookies sécurisés

### Problème : Images non chargées
**Solution** :
- Vérifier `next.config.js` pour les domaines autorisés
- Les avatars utilisent `ui-avatars.com`
- Pour les uploads, configurer un service de stockage

## 📁 STRUCTURE DU PROJET

```
AcademVault/
├── client/                    # Next.js 16 (PORT 3000)
│   ├── src/
│   │   ├── app/              # App Router
│   │   │   ├── layout.jsx    # Layout racine
│   │   │   ├── page.jsx      # Page d'accueil
│   │   │   ├── signup/       # Inscription
│   │   │   ├── login/        # Connexion
│   │   │   └── dashboard/    # Tableau de bord
│   │   ├── components/       # Composants React
│   │   ├── lib/              # Services
│   │   └── data/             # Données mockées
│   ├── jsconfig.json         # Alias @/
│   ├── tailwind.config.js    # Configuration Tailwind
│   └── postcss.config.mjs    # PostCSS ES modules
│
└── server/                   # Laravel 11 (PORT 8000)
    ├── database/migrations/  # 12 tables personnalisées
    ├── app/Models/           # Modèles Eloquent
    └── routes/api.php        # Routes API
```

## 🔗 CONNEXION FRONTEND/BACKEND

### Configuration actuelle (Mock)
```javascript
// src/lib/auth.js - Service mocké
// À remplacer par des appels API réels vers :
// POST http://localhost:8000/api/auth/register
// POST http://localhost:8000/api/auth/login
```

### Configuration API réelle (À implémenter)
```javascript
// Dans .env.local du client
NEXT_PUBLIC_API_URL=http://localhost:8000/api

// Dans les services, remplacer par :
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## 🎨 DESIGN SYSTEM

### Couleurs principales
```css
--primary-color: #3b82f6;      /* Bleu */
--success-color: #10b981;      /* Vert */
--warning-color: #f59e0b;      /* Orange */
--danger-color: #ef4444;       /* Rouge */
--purple-color: #a855f7;       /* Violet */

--bg-primary: #0a0a0a;         /* Fond principal */
--bg-secondary: #111111;       /* Fond secondaire */
--bg-card: #1e1e1e;           /* Cartes */
--border-color: #27272a;       /* Bordures */
```

### Typographie
- Police système : `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu`
- Taille de base : 16px
- Hauteur de ligne : 1.5

## 🔐 SÉCURITÉ

### Mesures implémentées
1. **Validation des formulaires** : Côté client avec messages d'erreur
2. **Stockage sécurisé** : localStorage pour le développement
3. **Protection des routes** : Redirection automatique pour les pages protégées
4. **Nettoyage des inputs** : Avant soumission

### À implémenter
1. **Validation côté serveur** : Laravel Validation
2. **Tokens JWT** : Laravel Sanctum/PHP JWT
3. **HTTPS** : Obligatoire en production
4. **Rate limiting** : Protection contre les attaques brute force

## 📱 RESPONSIVE DESIGN

### Breakpoints
```css
/* Mobile : < 640px (par défaut) */
/* Tablet : 640px - 1024px */
/* Desktop : > 1024px */
```

### Composants responsives
- **Header** : Transforme en menu hamburger sur mobile
- **Sidebar** : Cache sur mobile, accessible via menu
- **Formulaires** : Adaptés aux écrans tactiles
- **Grilles** : Flexbox/Grid avec media queries

## 🚀 DÉPLOIEMENT LOCAL

### 1. Démarrer le backend
```bash
cd server
php artisan serve --port=8000
```

### 2. Démarrer le frontend
```bash
cd client
npm run dev
```

### 3. Accès
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Base de données : MySQL sur localhost:3306

## 🐛 DEBUGGING

### Erreurs courantes
1. **Module non trouvé** : Vérifier les alias dans jsconfig.json
2. **Styles non appliqués** : Vérifier l'ordre des imports dans globals.css
3. **État non mis à jour** : S'assurer d'utiliser `useState` et `useEffect` correctement
4. **Problèmes de routage** : Vérifier la structure des dossiers app/

### Outils de développement
1. **React DevTools** : Inspection des composants
2. **Redux DevTools** : Pour le state management (si ajouté)
3. **Network tab** : Surveillance des appels API
4. **Console** : Logs et erreurs JavaScript

## 📈 ROADMAP

### Version 1.0 (Actuelle)
- [x] Interface d'inscription/connexion
- [x] Dashboard de base
- [x] Authentification mockée
- [x] Design responsive

### Version 1.1 (Prochaine)
- [ ] Connexion à l'API Laravel
- [ ] CRUD des documents
- [ ] Système de recherche
- [ ] Gestion des catégories

### Version 1.2
- [ ] Système d'amis
- [ ] Discussions en temps réel
- [ ] Upload de fichiers
- [ ] Notifications

## 🤝 CONTRIBUTION

### Workflow Git
```bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Développer
# Tester
# Commiter
git add .
git commit -m "feat: description claire"

# Pousser
git push origin feature/nouvelle-fonctionnalite

# Créer Pull Request
```

### Standards de code
- **JavaScript** : ES6+ avec conventions camelCase
- **React** : Fonctions composants avec hooks
- **CSS** : Classes BEM-like avec Tailwind
- **Nommage** : Descriptive en anglais

## 📞 SUPPORT

### Ressources
- **Documentation** : Ce fichier manual.md
- **Code source** : Commentaires dans les fichiers
- **Issues** : GitHub Issues pour le suivi
- **Communauté** : Forum de développement

### Contacts
- **Développeur principal** : [Ton nom]
- **Email** : [Ton email]
- **Repository** : [Lien GitHub]

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0  
**Statut** : Frontend fonctionnel, Backend prêt  
**Prochaine version** : Intégration API complète  

*Document maintenu par l'équipe de développement AcademVault*
```

## ✅ VÉRIFICATION

Exécute maintenant :
```bash
cd client
npm run dev
```

Accède à :
- http://localhost:3000 - Page d'accueil publique
- http://localhost:3000/signup - Formulaire d'inscription
- http://localhost:3000/dashboard - Tableau de bord (après connexion)

Le problème de 404 devrait être résolu ! 🎉