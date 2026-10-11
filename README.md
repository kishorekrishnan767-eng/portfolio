# SIGNAL — Kishore Krishnan

> Every system starts with a signal.

A cinematic, single-page portfolio: one continuous descent through a dark, bioluminescent world, with a glowing ECG "spine" that draws as you scroll.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, DrawSVG, MotionPath, MorphSVG) · Lenis

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm run start      # serve the production build
```

## Editing content

**All copy lives in [`data/content.ts`](data/content.ts).** Search it for `TODO` and `DRAFT`.

- **Resume:** put the PDF at `public/resume.pdf`. The "Download Resume" button only appears when the file exists; the check runs at build time.
- **LinkedIn:** paste the profile URL into `connect.links`. Links with an empty `href` are not rendered.
- **Site URL:** picked up automatically on Vercel. Set `NEXT_PUBLIC_SITE_URL` to override it, for example with a custom domain.

## Where things live

| Path | What |
| --- | --- |
| `app/` | Layout, fonts, global CSS, OG image, icon, robots, sitemap |
| `styles/tokens.css` | Design tokens (colours, easing, type scale) as Tailwind `@theme` |
| `lib/gsap.ts` | Plugin registration + the motion language (`EASE`, `DUR`, `STAGGER`, `MQ`) |
| `lib/lenis.ts` | Lenis ↔ GSAP ticker sync, `scrollToTarget`, `lockScroll` |
| `lib/schedule.ts` | Defers below-the-fold animation setup, one task per chapter, then refreshes once |
| `lib/signal.ts` | Tiny signals: `booted` (preloader done) and `activeChapter` |
| `components/` | Preloader, Hero, Spine, Nav, Cursor, ChapterTracker, Footer |
| `components/Chapters/` | I Curiosity · II Workbench · III Problems (horizontal) · IV Proof · V Now · Epilogue |

## Motion rules

- Animate only `transform`, `opacity` and `clip-path`. Glow is static; fade a pre-glowed layer instead.
- Every ScrollTrigger is created inside `useGSAP` and `gsap.matchMedia()`, so everything is cleaned up and reversible.
- **Desktop** (≥768px): pins and horizontal scroll. **Mobile:** vertical stacks, no horizontal pin. **`prefers-reduced-motion`:** no Lenis, no pins or scrub, no particles or preloader; simple fades only.
- Don't put `overflow: hidden` on a pinned element. Chrome reports a full-viewport layout shift when it switches to `position: fixed`. Clip on an ancestor instead (see Chapter III).

## Deploy (Vercel)

Either push this folder to GitHub and import the repo at vercel.com/new, or run `npx vercel` from this folder. No configuration is needed.
