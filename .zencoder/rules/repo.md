---
description: Repository Information Overview
alwaysApply: true
---

# Artopus E-commerce Information

## Summary
A MERN (MongoDB, Express, React, Node.js) full-stack e-commerce application for selling Indian art. It features a modern React frontend built with Vite, TypeScript, and Tailwind CSS, and a robust Express backend with JWT authentication and Stripe integration.

## Structure
- **client/**: React frontend using Vite, TypeScript, and Tailwind CSS.
- **server/**: Express backend with Node.js, MongoDB (Mongoose), and various middlewares.
- **server/tests/**: Comprehensive test suite using Jest and Supertest.

## Projects

### Frontend (Client)
**Configuration File**: `client/package.json`

#### Language & Runtime
**Language**: TypeScript  
**Version**: Node.js (v18+ recommended)  
**Build System**: Vite  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react (v19.2.0)
- react-router-dom (v7.11.0)
- axios (v1.13.2)
- tailwindcss (v4.1.18)
- @stripe/stripe-js
- react-toastify

#### Build & Installation
```bash
cd client
npm install
npm run dev
````

#### Testing
**Framework**: ESLint (for linting)
**Run Command**:
```bash
npm run lint
```

### Backend (Server)
**Configuration File**: `server/package.json`

#### Language & Runtime
**Language**: JavaScript (ES Modules)  
**Version**: Node.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express (v5.2.1)
- mongoose (v9.0.2)
- jsonwebtoken (v9.0.3)
- stripe (v20.1.0)
- cloudinary
- multer

#### Build & Installation
```bash
cd server
npm install
npm run dev
```

#### Docker
**Dockerfile**: `server/Dockerfile`
**Configuration**: Production-ready multi-stage build using `node:18-alpine`.

#### Testing
**Framework**: Jest, Supertest
**Test Location**: `server/tests/`
**Naming Convention**: `*.test.js`
**Configuration**: `server/jest.config.cjs`
**Run Command**:
```bash
npm test
```

## Key Resources
- **Entry Points**: `client/src/main.tsx` (Frontend), `server/index.js` (Backend)
- **Environment**: `.env` file required in `server/` (see `README.md` for details)
- **Database**: MongoDB (Atlas or local)
- **Styling**: Tailwind CSS with custom branding in `client/tailwind.config.js`
