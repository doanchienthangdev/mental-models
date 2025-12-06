# UI SPECS — Mental Models Hub (Sprint 1)
Mode: **[LIBRARY-STANDARD]** (no reference images). Use shadcn/ui + Tailwind in dark, elegant style.

---

# UI SPECS — Homepage (Sprint 3)
Mode: **[LIBRARY-STANDARD]**. Keep dark/elegant visual language consistent with library/detail/create screens.

---

# UI SPECS — Admin Console (Sprint 5)
Mode: **[LIBRARY-STANDARD]** using shadcn/ui + Tailwind (dark theme).

## Navigation & Layout
- Top bar: logo + “Admin Console”; menu items: Dashboard, Models, Categories, Tags linking to respective pages. User role indicator and sign-out placeholder. No left sidebar; single-row nav on top (responsive: collapsible menu/drawer).
- Content: max width fluid with cards/tables; padding 24–32px; panels have border #1e3442, background #0f202d.

## Access States
- If user not admin/manager: show forbidden page with CTA to go back home/login.
- Loading state: skeleton for table rows/cards.
- Error/toast for API failures.

## Pages
### Dashboard (optional placeholder)
- Quick stats: #Models, #Categories, #Tags.
- Shortcuts: buttons to “New Model”, “New Category”, “New Tag”.

### Categories
- Table: Name, Slug, Description, Actions (Edit/Delete).
- Actions: inline edit opens drawer/modal with inputs (name, slug, description). Confirm delete.
- Add Category button: opens form modal/drawer.

### Tags
- Table: Name, Slug, Actions. Similar patterns as categories.

### Models
- Top controls: search input + filters (category/tag/status) aligned left; on the same row a “Create” button with “+” icon.
- Display as cards: title, cover image, status, audio status, brief summary (optional), tags/categories. Each card has edit (pencil) icon and view (eye) icon.
- Edit can open drawer/modal or navigate to edit page; view links to public detail page.

### Create Model (Admin)
- Layout: single column form on dark panel; breadcrumbs “Models / Create”.
- Fields: title (required), slug (auto from title, editable), summary, category select (from categories), tags multi-select, read time (optional), status select (draft/published), cover upload, audio upload (optional) with progress bar + preview, body editor (Markdown/Notion-like), preview button (opens new tab).
- Actions: Save/Publish button, autosave indicator (showing last saved time), optional delete not shown on create.
- Validation: required title/slug, status, category optional, tags optional.
- Media: cover upload shows thumbnail preview; audio upload shows progress + play/pause control after selection.
- Editor: Markdown textarea with live preview; accept pasted Markdown.

### Edit Model (Admin)
- Same layout as Create, prefilled with existing data.
- Actions: Save/Update, status toggle, Delete button at bottom with confirm dialog.
- Preview button opens preview page for current model.

### Preview Model (Admin)
- Mirrors public detail page: title, tags/categories, status badge, audio player (if exists), cover, rendered body (Markdown).
- Toolbar with back to Models and Edit.

## Forms & Components
- Inputs, textareas, selects/combobox for categories/tags.
- Buttons: primary (accent), outline (border #1e3442).
- Toasts for success/error.

## Responsive
- Side nav collapses to top menu + sheet on mobile.
- Tables scroll horizontally on small screens.

## States
- Empty states with “Add …” CTA for each section.
- Loading skeleton rows for tables.

## Content Structure
- **Hero:** Value prop (“Curate the mental models that make you think better”), subheadline about browsing, listening, and creating models. Primary CTA: “Browse Library”; Secondary CTA: “Create a Model”. Badge/pill for “Audio-ready models” and “Supabase-powered”.
- **Featured Models:** 3 cards pulled from Supabase (recent or tagged “featured”) showing cover, title, summary, tags, audio status, read time. Link to full model.
- **How It Works:** 3 steps (Browse models, Listen with AI voice, Create & publish). Each with icon (lucide) and 1–2 lines description.
- **Benefits/Value:** Grid of 3–4 value props (e.g., “Decision clarity”, “Audio-first consumption”, “Rich TOC & Markdown”, “Secure data via Supabase”). Short punchy copy.
- **Call to Action Banner:** Highlight creating a new model and generating audio. Button: “Create a Model”; secondary link: “View Library”.
- **Footer:** Links to Library, Create, Favorites (placeholder), and social/email; tagline about Mental Models Hub.

## Layout & Styling
- Hero uses split layout: left text, right a stylized highlight card stack or featured model preview; background gradient subtly different from library page.
- Maintain 1200–1280px max width, generous spacing (48–64px between sections), full bleed background in dark navy.
- Buttons use existing styles; CTA banner slightly brighter accent background.

## Responsive
- Hero stacks on mobile; CTA buttons full width on small screens.
- Featured models collapse to single column on mobile, two columns on tablet.
- Steps/Benefits collapse into vertical list with clear spacing.

## Interactions
- Hover lift on cards; CTA buttons with accent hover.
- Links to Library and Create use existing routes `/` and `/create`.

## Theme & Visual Language
- Palette: bg `#0c0f14`, surface `#111827`, cards `#161f2d`, strokes `#1f2937`, accent `#38bdf8` (or `#22d3ee`), success `#22c55e`, warning `#f97316`, danger `#ef4444`.
- Typography: Headings `Space Grotesk` (or `Sora`), body `Inter`; high contrast in dark mode; generous letter spacing for headings.
- Elevation: subtle shadows on cards; 8–12px radius; thin borders `rgba(255,255,255,0.06)`.
- Motion: quick 150–200ms transitions on hover/focus; table of contents slide/expand on mobile.

## App Shell
- Top bar: left logo/wordmark, center search (shortcut `/`), right actions (New Model, Profile/Sign-in). Mobile: search collapses to icon that opens command palette/sheet.
- Navigation: minimal—Home (Models), maybe “My Models” if authenticated; route to “Create”.
- Page max width ~1200–1280px; 16–20px side padding on mobile, 32–48px on desktop.

## Screen 1: Model Listing (Library)
- Header: title “Mental Models”, subtitle line about curated decision frameworks; CTA “New Model”.
- Controls row: search input (with icon), tag multi-select (popover), category select, sort select (Newest / Popular / A→Z). On mobile, collapse filters into a sheet triggered by a filter button.
- Cards grid: 1 column mobile, 2 columns tablet, 3 desktop. Card: cover image (optional), title, short summary (2–3 lines clamp), tags as badges, category, estimated read time, status pill (e.g., Audio Ready / Generating).
- Interactions: hover lift, clickable entire card. Skeleton placeholders for loading. Empty state with CTA to create first model.

## Screen 2: Model Detail
- Page header: title, tags, category, read time, updated time; short summary.
- Audio player bar near top: play/pause, seek, time, download link, status chip. States: idle (no audio), generating (spinner + progress copy), ready (controls active), failed (error message + retry).
- Actions: “Regenerate audio” (if allowed), “Edit”, “Share/Copy link”.
- Layout: content area left; Table of Contents right (sticky within viewport, starts after hero). TOC entries anchor to headings (h2/h3); highlight active section; allow collapse/expand.
- Content: render Markdown/MDX with styled prose (shadcn typography); support headings, paragraphs, lists, blockquotes, code blocks, callouts. Include References section at bottom (links list).
- Related tags/”More like this” strip (optional for later).
- Mobile: TOC collapses into accordion at top of content; audio bar stays above content with full-width controls.

## Screen 3: Create/Edit Model
- Layout: two-column on desktop (form left, preview right), stacked on mobile with preview toggle.
- Sections:
  - Basics: Title (required), slug (auto from title, editable), category select, tags multi-select/creatable, status (Draft/Published).
  - Summary: textarea with char counter.
  - Body: rich text/Markdown editor (toolbar for headings, bold/italic, lists, links, quotes, code). Show live preview in the right column or via tab switch.
  - Media: cover image upload (optional) with dropzone; show thumbnail and replace/remove actions.
  - Read time: auto-estimated; editable override if needed (optional).
  - Audio: select voice (dropdown of ElevenLabs voices), choose source text (Summary/Body), button “Generate audio”; show current asset status if exists.
- Validation: show inline errors under fields; disable submit while submitting. Primary actions: “Save & Publish” (or “Save Draft”), secondary “Cancel”.
- Feedback: toast on save success/fail; progress indicator during audio generation trigger.

## Components (shadcn/ui picks)
- Buttons (primary/secondary/ghost), Input, Textarea, Select/Combobox, Badge, Card, Tabs (Edit/Preview), Accordion (TOC mobile), Sheet/Drawer (filters), Tooltip, Toast, Progress (for audio generating), Slider/Seekbar for audio.
- Prose typography class for Markdown rendering; code block styling.

## Responsive & Layout Rules
- Breakpoints: mobile <640px, tablet 640–1024px, desktop >1024px. Sticky TOC only on >=1024px.
- Ensure touch targets >=44px; spacing 16–24px vertically for readability.

## States, Empty, Loading
- Loading skeletons for cards, content, and audio bar; shimmer on player timeline.
- Empty states: Library empty -> illustration/icon + “Create your first model”. Detail audio missing -> “Audio not generated yet” with CTA. Form preview empty -> placeholder text.
- Error states: banners/toasts for save/generate failures; inline field errors.

## Accessibility
- High-contrast dark theme; focus outlines visible on all interactive elements.
- Keyboard: search focus via `/`, filter sheet accessible, TOC navigation via Tab; player controls operable via keyboard.
- ARIA: TOC uses nav landmark; audio controls labeled; accordions/selections have proper roles.

## Content Structure Notes
- Heading levels must be consistent (h2/h3) to build TOC; avoid skipping levels.
- References list uses ordered list with link + source text.
