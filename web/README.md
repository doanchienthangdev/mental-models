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

## Environment Variables
Copy `.env.example` to `.env.local` and fill in your own values.

## CI/CD (Sprint 7)
- GitHub Actions (`.github/workflows/ci.yml`) runs on PRs and pushes to `main`.
- Steps: install deps, `npm run lint`, `npm run test`.
- Vercel project: **Mental Models** (auto deploy `main`, preview branches for PRs).
- Add all secrets via Vercel dashboard (do not commit).
