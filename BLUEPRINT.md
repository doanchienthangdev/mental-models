# BLUEPRINT: MENTAL MODELS HUB

## 1. Product Vision
- Build a premium dark-themed web experience for exploring and creating mental models.
- Users can author new mental models, read rich articles with table of contents (Notion-like), and listen to auto-generated audio via ElevenLabs.
- Supabase provides auth, database, and storage for content and audio assets.

## 2. Target Users
- Knowledge workers, creators, and students who collect and revisit decision-making frameworks.
- Content authors who want a polished publishing flow with audio enrichment.

## 3. Core Use Cases
- Browse and search mental models by category/tags.
- View a model detail page with rich text, sections, embedded media, and an auto-generated table of contents.
- Generate audio narration for a model/article via ElevenLabs API; stream or download playback.
- Create/edit mental models with a structured form and rich text editor; save to Supabase.
- Save favorites/collections and track listening/reading progress (future sprint).

## 4. Feature Requirements (Scope Now)
- Auth (Supabase): email/password (magic link optional later).
- Model data: title, slug, summary, body (rich content/Markdown), tags, category, references, estimated read time, cover image.
- Table of contents: derived from headings in body; sticky on desktop, collapsible on mobile.
- Audio: generate via ElevenLabs text-to-speech from body or summary; store audio metadata (url, duration, voice id, status).
- Model creation: form with validation; preview; submit to Supabase.
- Model listing: cards/grid with search + filters (tag/category).
- Playback: inline player (play/pause, seek, download link), fallback messaging when audio not ready.
- Admin-ish controls (minimal): re-trigger audio generation per model.
- Dark, elegant UI; typography and spacing feel “pro / Notion-like”.

## 5. Non-Functional Requirements
- Mobile-first responsive layout.
- Accessible forms and navigation; keyboard friendly.
- Secure handling of ElevenLabs API key (server-side only).
- Observability: basic logging for API errors.

## 6. System Architecture (Proposed)
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS with chosen UI library (see PROJECT_PLAN decision).
- Backend: Next.js API routes; Supabase client (server + client) for data and auth.
- Supabase: Postgres schema for models, tags, audio metadata; storage bucket for audio files (if we upload) or store external URLs from ElevenLabs.
- ElevenLabs: server-side API calls to synthesize audio; webhook or polling to check status.

## 7. Data Model (initial)
- tables:
  - models: id (uuid), title, slug, summary, body, tags (text[]), category, cover_url, read_time, status, created_at, updated_at.
  - audio_assets: id (uuid), model_id (fk), voice_id, source_text ("summary"|"body"), status, audio_url, duration, created_at, updated_at.
  - favorites (future): user_id, model_id, created_at.
  - profiles (future): user_id, display_name, avatar_url.
  - users (CMS): id (uuid), email, role ("admin"|"manager"|"viewer"), display_name, avatar_url, created_at, updated_at.
  - categories: id (uuid), name, slug, description, created_at, updated_at.
  - tags: id (uuid), name, slug, created_at, updated_at.
  - model_categories: model_id, category_id (many-to-many if we support multi-category).
  - model_tags: model_id, tag_id (many-to-many).

## 8. Integrations
- Supabase: auth + database + storage.
- ElevenLabs: text-to-speech, initiated via server action/API; consider webhook endpoint for completion.

## 9. Risks & Mitigations
- Audio generation latency: use background polling + user notification; cache status in Supabase.
- API key exposure: restrict to server-side and env vars; never ship to client.
- Rich text handling: use MDX/portable editor; sanitize output to avoid XSS.
- TOC accuracy: ensure heading parsing stable; validate content structure.

## 10. Out-of-Scope (Later Sprints)
- Collaborative editing, comments.
- Offline playback, playlists.
- Advanced analytics and recommendations.
- Multi-language localization.

## 11. Success Metrics (initial)
- Time-to-first-audio generation success rate.
- Completion rate of model creation flow.
- Playback start rate on model detail pages.
