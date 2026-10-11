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
- **Skills:** edit the lists in `skills`. Each skill's logo comes from `public/skills/<name>.svg`, mapped in `LOGOS` in [`Workbench.tsx`](components/Chapters/Workbench.tsx). Add an entry there when you add a skill.
- **Site URL:** picked up automatically on Vercel. Set `NEXT_PUBLIC_SITE_URL` to override it, for example with a custom domain.

## Artwork

Background images live in **`public/images/`**, named after their slot. The site finds them at build time (`lib/images.ts`). If a slot has no file, nothing renders in production. In `npm run dev` the empty slot shows a dashed placeholder instead.

| File | Where it appears |
| --- | --- |
| `hero-abyss` | Prologue, behind the name and the plankton |
| `curiosity-pcb` | I · Curiosity ("Wired to wonder") |
| `project-sparksense` | III · SparkSense scene |
| `project-women-safety-band` | III · Women Safety Band scene |
| `project-green-atm` | III · Green ATM scene |
| `now-board` | V · Now (LiveWires panel) |
| `connect-globe` | ∞ · Epilogue ("Let's connect") |

- **Formats:** `.webp`, `.avif`, `.jpg`, `.jpeg` or `.png`, in that order of preference. Next.js resizes the images and serves them as AVIF or WebP.
- **How they blend:** images use `mix-blend-mode: screen` at low opacity and their edges fade out. Pure black disappears and only the glowing parts show. Use mostly-black images with the subject on the right, because the text sits on the left.
- **New images:** the prompts for every slot are in [`IMAGE-PROMPTS.md`](IMAGE-PROMPTS.md).
- **New slot:** add the name to `ART_SLOTS` in `lib/images.ts`, pass `art["<slot>"]` from `app/page.tsx`, and render `<Art>` (`components/ui/Art.tsx`) in the section.

## Where things live

| Path | What |
| --- | --- |
| `app/` | Layout, fonts, global CSS, OG image, icon, robots, sitemap, 404 page (`not-found.tsx`) |
| `styles/tokens.css` | Design tokens (colours, easing, type scale) as Tailwind `@theme` |
| `lib/gsap.ts` | Plugin registration + the motion language (`EASE`, `DUR`, `STAGGER`, `MQ`) |
| `lib/lenis.ts` | Lenis ↔ GSAP ticker sync, `scrollToTarget`, `lockScroll` |
| `lib/navigate.ts` | In-page navigation: short hops glide; long jumps go under the "signal reroute" curtain |
| `lib/schedule.ts` | Defers below-the-fold animation setup, one task per chapter, then refreshes once |
| `lib/signal.ts` | Tiny signals: `booted` (preloader done) and `activeChapter` |
| `lib/images.ts` | Artwork slots, resolved at build time |
| `components/` | Preloader, Hero, Spine, Nav, Cursor, ChapterTracker, Footer |
| `components/Seam.tsx` | The ECG hand-off line at the top of each chapter (`I ──∿── II`) |
| `components/Connective.tsx` | Drives the seams, the label "decode" effect and the artwork reveals (renders nothing) |
| `components/NavTransition.tsx` | The curtain used for long jumps from the nav |
| `components/ui/` | `Art` (artwork slot), `Magnetic` (magnetic hover) |
| `components/Chapters/` | I Curiosity · II Workbench · III Problems (horizontal) · IV Proof · V Now (+ `Board.tsx`) · Epilogue |
| `public/images/` | Artwork (see above) |
| `public/skills/` | Skill logos (SVG) |

## Motion rules

- Animate only `transform`, `opacity` and `clip-path`. Glow is static; fade a pre-glowed layer instead.
- Every ScrollTrigger is created inside `useGSAP` and `gsap.matchMedia()`, so everything is cleaned up and reversible.
- **Desktop** (≥768px): pins and horizontal scroll. **Mobile:** vertical stacks, no horizontal pin. **`prefers-reduced-motion`:** no Lenis, no pins or scrub, no particles or preloader, no nav curtain; simple fades only.
- Don't put `overflow: hidden` on a pinned element. Chrome reports a full-viewport layout shift when it switches to `position: fixed`. Clip on an ancestor instead (see Chapter III).
- Looping CSS animations that can't be composited (SVG `stroke-dashoffset`, for example) run only while their section is on screen. See `.is-live` in Chapter V.

## Deploy (Vercel)

Either push this folder to GitHub and import the repo at vercel.com/new, or run `npx vercel` from this folder. No configuration is needed.

The resume button and the artwork are detected at build time, so redeploy after adding or changing either.
