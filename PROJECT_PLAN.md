# PROJECT ROADMAP & STATUS
**Status:** IN-PROGRESS  
**Current Sprint:** Sprint 7

## 📋 BACKLOG (Pending)
- [ ] Audio analytics (listen completion, drop-off)
- [ ] Favorites/collections for models
- [ ] Playlists and offline playback
- [ ] Localization (multi-language)
 - [ ] Audit logs for CMS
 - [ ] Granular permissions by resource

## 🏃 ACTIVE SPRINT (Sprint 7: CI/CD to Vercel)
**Goal:** Establish a secure, repeatable CI/CD pipeline that ships the Next.js app to Vercel with automated checks and no secret leakage.  
**Tasks:**
- [x] [PM] Define deployment requirements (branch: `main`, Vercel project: *Mental Models*, only non-secret env placeholders committed; auto deploy on merge to main with preview builds for PRs).
- [ ] [DEV] Prepare repository for deployment (lint/test scripts, `vercel.json` or build settings, `.env.example` updates without secrets).
- [ ] [DEVOPS] Configure CI workflow (GitHub Actions) to run lint/tests on PRs and gate deploys; connect repo to Vercel with protected env vars.
- [ ] [DOC] Document CI/CD usage (how to trigger deploys, add env vars, rollback) in README or `/docs`.

## ✅ COMPLETED
- [x] Sprint 6: CRUD Models & Media in Admin (2025-12-04)
- [x] Sprint 5: CMS UI & Admin Console (2025-12-02)
- [x] Sprint 2: Supabase Integration & CRUD (2025-12-01)
- [x] Sprint 1: Foundation & Core Flows (2025-12-01)
- [ ] Sprint 0: —  
