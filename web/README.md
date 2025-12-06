# Mental Models Hub (Web)

## Tech Stack
- Next.js 16 / React 19
- Tailwind CSS
- Supabase (data, auth)
- Three.js (hero globe)

## Development
```bash
cd web
npm install
npm run dev
```

## Testing & TDD (Sprint 8)
```bash
npm run lint
npm run test          # Vitest + React Testing Library (jsdom)
npm run test -- --runInBand --coverage
```
Guidelines:
- Every UI component with logic (CTA layout, cards, forms) must include a corresponding spec in `src/components/__tests__`.
- Data helpers (e.g., Supabase wrappers) need unit tests that mock the client and cover success/error flows.
- Coverage thresholds (set in `vitest.config.ts`) will fail CI if global lines/statements/functions drop below 60%.
- Cross-reference new features in PRs with test cases and mention snapshots/fixtures when necessary.

## Environment Variables
Copy `.env.example` to `.env.local` and fill in your own values.

## CI/CD (Sprint 7)
- GitHub Actions (`.github/workflows/ci.yml`) runs on PRs and pushes to `main`.
- Steps: install deps, `npm run lint`, `npm run test`.
- Vercel project: **Mental Models** (auto deploy `main`, preview branches for PRs).
- Add all secrets via Vercel dashboard (do not commit).
