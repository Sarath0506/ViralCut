# ViralCut — Tech stack (locked)

**Last updated:** May 30, 2026  
**Status:** Approved — Flutter mobile, Next.js brand web, NestJS API on **Railway**

---

## 1. Product split

| Surface | Who | Device | Code |
|---------|-----|--------|------|
| **Creator app** | Clippers, influencers | iOS + Android (native) | `apps/mobile-creator` — **Flutter** |
| **Brand portal** | Brands, agencies | Desktop web | `apps/web-brand` — **Next.js** |
| **API** | Both | — | `services/api` — **NestJS** on **Railway** |

Design reference (not codegen): `design/stitch/`, `figma-screenshots/`, `docs/FIGMA_PRODUCT_ANALYSIS.md`

---

## 2. Monorepo layout (current)

```
Viralcut/
├── apps/
│   ├── mobile-creator/          # Flutter — creator app (Dart)
│   └── web-brand/               # Next.js — brand portal (TS) [scaffold pending]
├── packages/
│   ├── shared-types/            # TS enums/types → OpenAPI source
│   ├── api-client/              # Generated from OpenAPI
│   └── ui-tokens/               # tokens.json → Flutter theme + Tailwind
├── services/
│   └── api/                     # NestJS on Railway [scaffold pending]
├── design/
│   ├── stitch/                  # Stitch HTML + PNG (mobile + web)
│   ├── archive/figma-screenshots/
│   └── assets/
├── docs/
│   ├── TECH_STACK.md
│   └── FIGMA_PRODUCT_ANALYSIS.md
├── scripts/
│   └── export-stitch-project.ps1
├── .stitch/                     # Stitch site map for agents
├── package.json                 # pnpm workspace root
└── pnpm-workspace.yaml
```

**Tooling:** `pnpm` for TS workspaces; Flutter via `apps/mobile-creator/` (`flutter` CLI).

**Removed / archived:** `clipify-skills/`, empty `ViralCutMain/`, root `figma-screenshots/` → `design/archive/`.

---

## 3. Creator mobile — Flutter

| Layer | Choice |
|-------|--------|
| Framework | **Flutter 3.x** (Dart) |
| State | **Riverpod** |
| Navigation | **go_router** (onboarding stack + 4-tab shell) |
| HTTP | **dio** + OpenAPI-generated Dart client |
| Models | **freezed** + **json_serializable** |
| Theme | `lib/theme/` from `packages/ui-tokens` + Stitch PNGs |

**Why Flutter (not Expo / not web-in-shell):**

- True native iOS/Android app (store distribution, push, deep links).
- Strong UI for feeds, animations, wallet-style cards.
- Best fit for a consumer-first creator product at quality bar.
- Stitch HTML is **reference only** — screens are built in Flutter widgets from PNGs + product spec.

**Rejected for mobile:** Expo/RN (TS-only tradeoff), PWA, Capacitor/WebView wrappers.

**First-time setup:**

```bash
cd apps/mobile-creator
flutter create . --project-name viralcut_mobile
flutter pub get
flutter run
```

---

## 4. Brand web — Next.js

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 15** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** + **shadcn/ui** |
| State | **TanStack Query** |
| Auth | Email + password, `role=brand` |

**Hosting:** **Vercel** (Hobby/Pro) — not Railway (better Next.js DX, free tier).

Prompts: `design/stitch/BRAND_WEB_STITCH_PROMPTS.md`

---

## 5. Backend — NestJS on Railway

| Layer | Choice |
|-------|--------|
| Runtime | **Node.js** + **NestJS** |
| DB | **PostgreSQL** (Railway plugin) |
| Cache / queues | **Redis** — **Upstash** (free tier) or Railway Redis |
| Storage | **Cloudflare R2** (S3-compatible) |
| API | REST + **OpenAPI 3.1** |

**Why Railway:** Simple deploy for API + Postgres, env vars, low ops cost (~$5–15/mo starter).

**Contract bridge (Flutter + TS):**

1. OpenAPI spec is the single contract (`services/api` or `packages/openapi/`).
2. Generate **TypeScript** client → `packages/api-client` (web).
3. Generate **Dart** client → `apps/mobile-creator` (build_runner / openapi_generator).

---

## 6. Hosting map (minimal cost)

| Component | Host | Est. cost |
|-----------|------|-----------|
| API + Postgres | **Railway** | ~$5–15/mo |
| Brand web | **Vercel** | $0 (Hobby) |
| Redis | **Upstash** | $0 |
| Object storage | **Cloudflare R2** | ~$0–5 |
| Creator app | App Store / Play | dev accounts |
| DNS / CDN | **Cloudflare** | $0 |
| SMS OTP (India) | MSG91 etc. | usage-based |

**Domains (example):** `api.viralcut.in`, `brand.viralcut.in`

---

## 7. Auth boundaries

| | Creator (Flutter) | Brand (Next.js) |
|--|-------------------|-----------------|
| Sign up | Phone, name, email, password | Company email, brand profile |
| JWT | `role=creator` | `role=brand` |
| Campaign CRUD | Read | Write |
| Submit / withdraw | Yes | No |
| Review submissions | No | Yes |

---

## 8. Implementation order

1. `services/api` skeleton on Railway + Postgres  
2. OpenAPI spec + generated clients (TS + Dart)  
3. `apps/web-brand` — campaign create + submission review  
4. `apps/mobile-creator` — auth → dashboard → campaigns → submit → wallet  
5. Integrations: Instagram/YouTube metrics, KYC, payouts (India)

---

## 9. Not building (v1)

- Creator web app  
- Brand native app  
- Shared UI codebase across mobile and web (only shared API contract + tokens)

---

## 10. Related docs

- `docs/FIGMA_PRODUCT_ANALYSIS.md` — creator flows  
- `design/stitch/BRAND_WEB_STITCH_PROMPTS.md` — brand Stitch prompts  
- `design/stitch/README` — export steps  
- `.env.example` — Stitch / Railway env vars  
