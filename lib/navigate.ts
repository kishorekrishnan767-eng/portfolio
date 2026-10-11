import { chapters } from "@/data/content";
import { focusTarget, jumpTo, lockScroll, scrollToTarget } from "./lenis";

/*
 * In-page navigation. Short hops glide (Lenis). Long jumps would fast-forward through every
 * pinned/scrubbed chapter, so they go under a "signal reroute" curtain instead: cover → jump →
 * reveal. Reduced motion always jumps instantly.
 */

export interface RouteLabel {
  numeral: string;
  title: string;
}

/** Plays the curtain, calls `jump` while the screen is covered, resolves when it's gone. */
type Transition = (label: RouteLabel, jump: () => void) => Promise<void>;

let transition: Transition | null = null;
let busy = false;

export function registerTransition(fn: Transition | null) {
  transition = fn;
}

/** Jumps further than this many viewports use the curtain. */
const LONG_JUMP = 1.5;

export async function navigate(target: string, { focus = true }: { focus?: boolean } = {}) {
  const el = document.querySelector<HTMLElement>(target);
  if (!el || busy) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const distance = Math.abs(el.getBoundingClientRect().top);

  if (reduced || !transition || distance < window.innerHeight * LONG_JUMP) {
    scrollToTarget(el, { focus, duration: 1.4 });
    return;
  }

  const chapter = chapters.find((c) => `#${c.id}` === target);
  busy = true;
  lockScroll(true);
  try {
    await transition(
      { numeral: chapter?.numeral ?? "→", title: chapter?.title ?? "" },
      () => jumpTo(el),
    );
  } finally {
    lockScroll(false);
    busy = false;
  }
  if (focus) focusTarget(el);
}
