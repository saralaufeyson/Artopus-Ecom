# Artopus Backend (MVP)

![CI](https://github.com/<OWNER>/<REPO>/actions/workflows/ci.yml/badge.svg) ![Coverage](https://codecov.io/gh/<OWNER>/<REPO>/branch/main/graph/badge.svg)

Quick start:

1. Copy `.env` to set your real environment values (Mongo URI, JWT secret, Stripe keys, admin creds). Edit the existing `.env` file in the `server` folder and replace placeholders with your values.
2. npm install (in `server` folder).
3. npm run dev

Development & Quality

- Run the test suite: `npm test`
- Run linting: `npm run lint` (requires `npm ci` to install dev deps)
- Pre-commit hooks are enabled with Husky and lint-staged; run `npm run prepare` after `npm install` to enable them.
- CI runs on push/PR and includes lint, audit, tests, and coverage upload. Add `CODECOV_TOKEN` secret to enable Codecov uploads.

Notes about MongoDB:
- If you want to use MongoDB Atlas (mongodb+srv), create a new database (or database user) in Atlas and replace `MONGO_URI` in `.env`.
- If you provide a valid `MONGO_URI` the first connection will create the needed collections automatically.

Main endpoints:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/products
- GET /api/products/:id
- POST /api/products (admin)
- PUT /api/products/:id (admin)
- DELETE /api/products/:id (admin)
- POST /api/payments/create-intent (authenticated)
- POST /api/payments/webhook (Stripe webhook)
- GET /api/orders/my-orders (authenticated)
- GET /api/orders/admin/orders (admin)
- PATCH /api/orders/admin/:id/status (admin)

Run seed admin:

node scripts/seedAdmin.js

Notes:
- Cloudinary image upload: There are two supported flows:
  1) Server-side upload using `multipart/form-data` and `image` file field (already implemented).
  2) Direct client upload to Cloudinary using a signed upload — server exposes `GET /api/uploads/signature` (admin only) which returns `signature`, `timestamp`, `apiKey`, and `cloudName`. Use that to perform a signed upload from the client to Cloudinary, then send the resulting `secure_url` as `imageUrl` when creating the product.
- Webhook endpoint uses Stripe signature verification and requires RAW body parsing (already configured in `payments.js`).

Client example (direct upload, fetch signature first):

1) GET /api/uploads/signature with admin Bearer token -> { signature, timestamp, apiKey, cloudName }
2) Use Cloudinary upload endpoint:
   POST https://api.cloudinary.com/v1_1/:cloudName/image/upload
   FormData fields: file (binary), api_key, timestamp, signature
3) Cloudinary returns `secure_url` for uploaded image. Use this `secure_url` as `imageUrl` in POST /api/products (or call server POST with image attached).
