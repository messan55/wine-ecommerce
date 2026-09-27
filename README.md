# Cave Solive

Vitrine d’une cave à vins française. On y parcourt une sélection de bouteilles (Bordeaux, Bourgogne, Loire, Rhône, Alsace, Champagne), on filtre par région, couleur et prix, et on prépare un panier en euros. Le paiement en ligne n’est pas branché : le bouton **Commander** l’explique, sans simuler un débit.

## Lancer en local

Il faut Node.js 20.9 ou plus, et Docker.

```bash
cp .env.example .env
docker compose up -d
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run dev
```

`npm install` lance déjà `prisma generate`. Postgres écoute sur `localhost:5432` (utilisateur `cave`, base `cave`, mot de passe `cave`). Aucune clé Neon, Supabase ou Stripe n’est nécessaire.

Pour ouvrir le serveur sur le réseau local, par exemple :

```bash
npm run dev -- -H 0.0.0.0 -p 4317
```

Si vous modifiez `prisma/schema.prisma` :

```bash
npx prisma migrate dev
```

## Pages

- `/` — la cave, avec filtres
- `/vin/[slug]` — une bouteille
- `/panier` — le panier (localStorage)

La confirmation 18+ et le panier restent dans le navigateur (`cave-solive.majorite`, `cave-solive.panier`).

## Ce qui n’est pas dans cette version

Pas de paiement Stripe, pas de compte, pas d’administration. Le stock et les prix viennent de PostgreSQL, via Prisma.
