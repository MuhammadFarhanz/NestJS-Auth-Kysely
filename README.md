<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">🧪 NestJS Starter — Auth + Refresh Token + Kysely</h1>

<p align="center">
  A robust NestJS boilerplate implementing secure authentication using access & refresh tokens, Kysely query builder.
</p>

---

## 📝 Description

This starter provides a architecture for building secure APIs with:

- 🔐 **Short-lived access tokens** for API authentication
- 🔁 **Long-lived refresh tokens** for session continuity
- 🔄 **Token rotation** and revocation strategy
- 🚫 **Blacklist mechanism** to invalidate tokens on logout
- 🧱 **Kysely** — a type-safe SQL query builder for PostgreSQL

---

## 🗂️ Features

- ✅ JWT Auth (access & refresh tokens)
- ✅ Token revocation (with Redis + blacklist)
- ✅ Swagger UI 
- ✅ Input validation with `nestjs-zod` 
- ✅ Custom exception filter for structured error responses
- ✅ Kysely + Postgres support with typed schema
- ✅ migration + codegen


---

## 📦 Scripts

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# Run migrations (Kysely)
npm run migrate
npm run migrate:down

# Generate Kysely types
npm run codegen
