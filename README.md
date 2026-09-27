# Cave Solive

Vitrine d’une cave à vins française. On y parcourt une sélection de bouteilles (Bordeaux, Bourgogne, Loire, Rhône, Alsace, Champagne), on filtre par région, couleur et prix, et on prépare un panier en euros. **Commander** demande l’adresse, calcule les frais, écrit la commande, envoie un e-mail de confirmation, retire le stock, puis ouvre Stripe Checkout (carte) si les clés sont là.

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

`npm install` lance déjà `prisma generate`. Postgres écoute sur `localhost:5432` (utilisateur `cave`, base `cave`, mot de passe `cave`). Pour encaisser, ajoutez `STRIPE_SECRET_KEY` (mode test) dans `.env`. En local, le retour Stripe suffit à confirmer la commande ; le webhook `STRIPE_WEBHOOK_SECRET` sert surtout en production :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Pour ouvrir le serveur sur le réseau local, par exemple :

```bash
npm run dev -- -H 0.0.0.0 -p 4317
```

Si vous modifiez `prisma/schema.prisma` :

```bash
npx prisma migrate dev
```

## Tests et CI

Les règles de cave (livraison, filtres, adresse, session, panier) sont couvertes par Vitest, sans base ni Stripe.

```bash
npm test
```

`npm run lint` et `npm run typecheck` passent aussi. Sur GitHub, le workflow `.github/workflows/ci.yml` lance les trois à chaque push et pull request.

## Pages

- `/` — la cave, avec recherche et filtres
- `/contact` — écrire à la cave
- `/mentions-legales`, `/cgv`, `/confidentialite` — pages légales
- `/vin/[slug]` — une bouteille
- `/panier` — le panier (localStorage)
- `/commande` — adresse et frais, avant Stripe
- `/commande/succes` — confirmation après commande
- `/compte` — inscription, connexion, historique des commandes
- `/admin` — catalogue (création, prix, stock), réservé aux comptes admin

La confirmation 18+ et le panier restent dans le navigateur (`cave-solive.majorite`, `cave-solive.panier`) jusqu’à la commande. Le paiement exige un compte. Les commandes et le stock vivent en PostgreSQL. Ajoutez `AUTH_SECRET` dans `.env` (une chaîne aléatoire) pour les sessions. Le premier compte créé en local est admin ; ensuite, mettez `ADMIN_EMAIL` pour en désigner un autre.

Les photos de bouteilles sont dans `public/bottles/` ; l’admin peut en envoyer une autre (JPEG, PNG ou WebP).

Livraison France métropolitaine : 8 € jusqu’à 5 bouteilles, 12 € à partir de 6, offerte dès 80 € de vin. Un magnum compte pour deux. En local, Mailpit écoute sur `http://localhost:8025` (SMTP `127.0.0.1:1025`).

## Ce qui n’est pas dans cette version

Pas de livraison hors France métropolitaine. Le stock et les prix viennent de PostgreSQL, via Prisma.
