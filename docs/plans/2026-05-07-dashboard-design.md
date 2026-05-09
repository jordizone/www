# Dashboard layout design

**Date:** 2026-05-07
**Status:** Approved, ready for implementation plan

## Goal

Turn the personal site into a dashboard for showcasing work. A persistent left sidebar lists sections (Writing, Projects, Lab, Photos); the main area shows the active section. Home stays a minimal intro.

## Decisions

- **Layout:** App-shell with a persistent left sidebar; sections route to their own pages (Astro static, shareable URLs).
- **Sections:** Writing, Projects, Lab, Photos. Home button at sidebar top, social links pinned at sidebar bottom.
- **Home view:** Keep the existing short intro paragraph. No overview/digest — sidebar is the way to explore.
- **Mobile:** Sidebar hidden behind a hamburger menu button at narrow widths.
- **Components:** Plain Astro/Tailwind for static markup. Base UI (headless React) only where a real interactive primitive is needed — currently just the mobile menu.
- **Content model:** Writing keeps its existing MDX collection. Projects, Lab, Photos ship as placeholder pages — content models decided per section when there's a first item to add.
- **Routing change:** `/blog` is renamed to `/writing` for naming consistency.

## File structure

```
src/
  layouts/
    BaseLayout.astro        # restructured: head + two-column shell with sidebar slot
  components/
    Sidebar.astro           # desktop sidebar (static markup)
    SidebarNav.astro        # shared link list (used by Sidebar + MobileMenu)
    MobileMenu.tsx          # Base UI Dialog, the only React island
    SocialLinks.astro       # pinned bottom of sidebar
  data/
    nav.ts                  # single source of truth for sidebar entries
  pages/
    index.astro             # minimal intro (existing copy)
    writing/index.astro     # renamed from blog/index.astro
    writing/[...slug].astro # renamed from blog/[...slug].astro
    projects/index.astro    # placeholder
    lab/index.astro         # placeholder
    photos/index.astro      # placeholder
```

## Sidebar anatomy

```
┌──────────────────┐
│  Jordi           │  name → links to /
│                  │
│  Writing         │
│  Projects        │  section nav (text-only, no icons)
│  Lab             │
│  Photos          │
│                  │
│  (spacer)        │
│                  │
│  ╴ ╴ ╴ ╴ ╴      │
│  GH  X  Email    │  socials (small icons via @lucide/astro)
└──────────────────┘
```

- Width ~220px, sticky, full viewport height.
- Background slightly off the page background or a hairline border-right — stays calm.
- Active route gets a subtle indicator (final treatment chosen during build).
- All entries driven from `data/nav.ts`.

## Mobile behavior

- At `< md` the desktop sidebar is hidden; a hamburger button is visible.
- Tapping it opens `MobileMenu.tsx`, a Base UI `<Dialog>` rendering the same nav list.
- `@astrojs/react` is added as an integration to support this single island.
- `client:load` so the menu works on first paint. JS shipped is small (Base UI Dialog + a few KB of glue).

## Placeholder pages

Each of `/projects`, `/lab`, `/photos` is a minimal Astro page: section title + one-paragraph "what's coming here" line. No fake data or skeleton grids. The content model for each section is decided when the first real item is added.

## Visual treatment

- Sidebar restrained to keep focus on content (especially long-form blog posts which now sit beside the sidebar).
- Typography unchanged from the existing site (EB Garamond body, system mono for small text/socials).
- Icons reserved for social links only; section nav is text-only.

## Out of scope (for now)

- Active-section highlighting beyond a basic indicator.
- Search across sections.
- Per-section content models for Projects/Lab/Photos.
- Theme toggle, animations, view-transition between routes.
- Redirects from old `/blog` URLs (clean rename; site has no external footprint yet to preserve).

## Risks / open questions

- **Layout shift between section pages and post pages.** Post pages keep the sidebar in approach A; reading column will shrink. We'll judge in browser whether the sidebar needs to be quieter/narrower than current spec.
- **First React island.** Adding `@astrojs/react` for a single dialog is justified but worth confirming bundle size is acceptable once built.
