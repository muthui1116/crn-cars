# CRN Commerce

CRN Commerce is a Next.js storefront with authentication, cart flow, checkout, M-Pesa payment initiation, and PostgreSQL-backed product management.

## What this app includes

- Credentials and Google sign-in via NextAuth
- Protected cart and checkout routes
- PostgreSQL-backed user, product, order, and order-item storage
- Product CRUD and image processing with Sharp
- M-Pesa STK push payment flow and callback handling
- Cart persistence and checkout validation in the client and server layers

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables into a local `.env` file. Required values include:
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `DB_USER`
   - `DB_HOST`
   - `DB_NAME`
   - `DB_PASSWORD`
   - `DB_PORT`
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_SHORTCODE`
   - `MPESA_PASSKEY`
   - `MPESA_CALLBACK_URL`
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## Important production constraints

- `NEXTAUTH_SECRET` must be set in every environment.
- Google auth requires valid OAuth credentials and a matching redirect URI.
- M-Pesa payment requires a valid callback URL that is publicly reachable during testing.
- Checkout and order flows depend on PostgreSQL tables for `users`, `products`, `orders`, and `order_items`.
- Route protection assumes a valid session user id is available in auth callbacks.

## Common commands

```bash
npm run dev
npm run build
npm run lint
```

## Notes

This project is structured for a small commerce workflow rather than a generic starter app. The server-side actions and routes are designed to be explicit, validation-forward, and easier to debug during onboarding and maintenance.
