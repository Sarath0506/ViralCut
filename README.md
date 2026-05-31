# ViralCut

Creator mobile app, brand web dashboard, and API monorepo.

## Apps

- `apps/mobile-creator` — Flutter creator app
- `apps/web-brand` — Next.js brand dashboard
- `services/api` — NestJS API

## Local development

See `.env.example` for required environment variables. Do not commit `.env`.

```bash
pnpm install
pnpm db:up
pnpm db:push
pnpm dev:api    # http://localhost:3001
pnpm dev:web    # http://localhost:3000
```
