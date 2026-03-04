# cofit-backend

API backend NestJS pour Cofit (auth, users, competitions, tickets, paiements, news, etc.).

## Stack technique
- Node.js 20+
- NestJS 11
- PostgreSQL 14+
- TypeORM

## Prerequis
- Node.js 20 ou plus recent
- npm 10+
- PostgreSQL en local ou distant

## Installation
```bash
npm install
```

## Configuration
1. Copier le fichier exemple:
```bash
cp .env.example .env
```
2. Renseigner les variables dans `.env`.

Variables principales:
- `PORT` (defaut `3000`)
- `CORS_ORIGINS` (origines separees par des virgules)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `TICKET_QR_SECRET`
- `JWT_EXPIRES_IN`, `ADMIN_JWT_EXPIRES_IN`
- `SUPER_ADMIN_*` (optionnel, bootstrap super admin)

## Lancement en local
```bash
npm run migration:run
npm run start:dev
```

Base URL locale:
```text
http://localhost:3000/api/v1
```

## Scripts utiles
- `npm run start:dev` : demarrage en mode developpement
- `npm run build` : build production
- `npm run start:prod` : lancement de `dist/main`
- `npm run lint` : lint ESLint
- `npm test` : tests unitaires
- `npm run test:e2e` : tests e2e
- `npm run migration:run` : applique les migrations
- `npm run migration:revert` : rollback migration
- `npm run migration:show` : liste etat migrations
- `npm run seed:run` : seed des donnees de demo

## Publication GitHub (checklist)
- Ne jamais commiter `.env` (deja ignore)
- Verifier que seuls les fichiers utiles sont suivis
- Ajouter une licence adaptee si depot public
- Configurer les secrets CI/CD cote GitHub (jamais en dur)

Commandes conseillees:
```bash
git add .
git status
git commit -m "chore: prepare backend repository for GitHub"
```

Puis creer le repo GitHub et pousser:
```bash
git branch -M main
git remote add origin <URL_GITHUB_DU_REPO>
git push -u origin main
```
