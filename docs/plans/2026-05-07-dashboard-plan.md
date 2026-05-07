# Dashboard layout — implementation plan

**Date:** 2026-05-07
**Companion to:** `2026-05-07-dashboard-design.md`

Ordered steps. Each step should be independently verifiable in the browser before moving on.

## Step 0 — Branch and dev server

- [ ] `git checkout -b feat/dashboard-layout`
- [ ] `npm run dev` running in a terminal; keep open through all steps

## Step 1 — Nav data source

Create `src/data/nav.ts` exporting two arrays: `sections` and `socials`.

```ts
// shape (final names/values to be set during implementation)
export const sections = [
  { label: 'Writing',  href: '/writing'  },
  { label: 'Projects', href: '/projects' },
  { label: 'Lab',      href: '/lab'      },
  { label: 'Photos',   href: '/photos'   },
];
export const socials = [
  { label: 'GitHub', href: 'https://github.com/...', icon: 'Github' },
  // ...
];
```

**Verify:** file compiles, no usage yet.

## Step 2 — Sidebar components (desktop, static)

Create:

- `src/components/SidebarNav.astro` — renders the list from `sections`. Highlights active route via `Astro.url.pathname`.
- `src/components/SocialLinks.astro` — renders `socials` with `@lucide/astro` icons.
- `src/components/Sidebar.astro` — composes name/home link + `SidebarNav` + spacer + `SocialLinks`. Width ~220px, sticky, hairline border-right.

**Verify:** import `Sidebar` directly into `index.astro` temporarily and check it renders. Revert the temp import after Step 3.

## Step 3 — Restructure `BaseLayout` to two-column shell

Edit `src/layouts/BaseLayout.astro`:

- Wrap children in a flex/grid two-column layout: `<Sidebar />` on the left, `<slot />` on the right with appropriate max-width / padding.
- Sidebar hidden at `< md` (will be replaced by mobile menu in Step 5).
- Keep all existing `<head>` / metadata logic intact.

**Verify:** every existing page (`/`, `/blog`, individual blog posts) renders with the sidebar on desktop and without it on mobile (mobile menu lands in Step 5).

## Step 4 — Rename `/blog` → `/writing`

- [ ] `git mv src/pages/blog src/pages/writing`
- [ ] Update any internal links: `src/pages/index.astro` post list (`/blog/${post.id}` → `/writing/${post.id}`)
- [ ] grep for `/blog` across `src/` to catch stragglers

**Verify:** `/writing` lists posts, `/writing/why-i3-for-work` renders the post. `/blog` 404s (acceptable — no external footprint).

## Step 5 — Add React + mobile menu

- [ ] `npm install @astrojs/react react react-dom @base-ui-components/react`
- [ ] Add React integration in `astro.config.mjs`
- [ ] Create `src/components/MobileMenu.tsx` using Base UI `<Dialog>`:
  - Trigger button (hamburger) visible only `< md`
  - Dialog renders the same `sections` + `socials` list from `nav.ts`
  - Close on link click
- [ ] Mount `<MobileMenu client:load />` inside `BaseLayout.astro` (visible only `< md` via Tailwind classes)

**Verify:** narrow the browser; hamburger opens the dialog; tapping a link navigates and closes the dialog. Inspect built bundle — Base UI Dialog island only ships on routes that need it.

## Step 6 — Placeholder pages

Create minimal pages, ~5 lines each:

- `src/pages/projects/index.astro`
- `src/pages/lab/index.astro`
- `src/pages/photos/index.astro`

Each: `BaseLayout` wrapper, `<h1>` with section name, one paragraph ("nothing here yet — coming soon").

**Verify:** all four sidebar links resolve to a real page.

## Step 7 — Active state polish

In `SidebarNav.astro`, refine the active-route indicator (subtle dot, weight bump, or left bar). Keep restrained.

**Verify:** clicking through each section visually confirms the active state on desktop and inside the mobile dialog.

## Step 8 — Cross-browser / responsive sweep

- [ ] Test layout at: 360px, 768px, 1024px, 1440px
- [ ] Confirm long-form blog post readability with the sidebar present (may need to narrow sidebar or widen reading column)
- [ ] `npm run build && npm run preview` — verify production build works

## Step 9 — Commit + open PR (optional)

Commit logical chunks (suggested: one commit for shell + sidebar, one for `/blog` → `/writing` rename, one for mobile menu, one for placeholders). Push and open a PR if you want a review before merging.

## Dependency additions

- `@astrojs/react` (Astro integration)
- `react`, `react-dom`
- `@base-ui-components/react` — Base UI primitives

Confirm exact package name + version range when running install.

## Files touched (summary)

| File | Action |
|---|---|
| `src/data/nav.ts` | create |
| `src/components/Sidebar.astro` | create |
| `src/components/SidebarNav.astro` | create |
| `src/components/SocialLinks.astro` | create |
| `src/components/MobileMenu.tsx` | create |
| `src/layouts/BaseLayout.astro` | edit (two-column shell + mobile menu mount) |
| `src/pages/index.astro` | edit (update internal `/blog` → `/writing` link) |
| `src/pages/blog/` | rename to `src/pages/writing/` |
| `src/pages/projects/index.astro` | create |
| `src/pages/lab/index.astro` | create |
| `src/pages/photos/index.astro` | create |
| `astro.config.mjs` | edit (add React integration) |
| `package.json` / lockfile | edit (deps) |

## Definition of done

- Sidebar visible on desktop across every page in the site.
- Mobile menu opens on narrow widths and navigates correctly.
- All four section routes resolve.
- `/writing` (and individual post pages) work; old `/blog` paths are gone.
- Production build succeeds; bundle includes the React island only where needed.
