import Lenis from "lenis";
import { EASE, gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;
/** Lock requested before Lenis existed (preloader mounts before SmoothScroll's effect runs). */
let locked = false;

/**
 * Creates the single Lenis instance and drives it from GSAP's ticker so
 * ScrollTrigger and smooth scroll share one clock (no double rAF, no drift).
 * Returns a cleanup that fully restores native scrolling.
 */
export function initLenis(): () => void {
  if (lenis) return destroyLenis;

  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
    // Touch keeps native momentum; smoothing it on phones feels laggy.
    syncTouch: false,
  });

  if (locked) lenis.stop();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return destroyLenis;
}

function tick(time: number) {
  lenis?.raf(time * 1000);
}

function destroyLenis() {
  gsap.ticker.remove(tick);
  gsap.ticker.lagSmoothing(500, 33);
  lenis?.destroy();
  lenis = null;
}

export function getLenis(): Lenis | null {
  return lenis;
}

const moveEase = gsap.parseEase(EASE.move);

type ScrollTarget = string | HTMLElement | number;

/**
 * Smooth-scroll to a section/element/offset. Falls back to native scrolling when
 * Lenis isn't running (reduced motion). Pass `focus` to move keyboard focus to the
 * target once it arrives, so skip-style nav is accessible.
 */
export function scrollToTarget(
  target: ScrollTarget,
  { offset = 0, duration = 1.4, focus = false }: { offset?: number; duration?: number; focus?: boolean } = {},
) {
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : typeof target === "number"
        ? null
        : target;

  const done = () => {
    if (focus && el) focusTarget(el);
  };

  if (lenis) {
    lenis.scrollTo(el ?? (target as number), { offset, duration, easing: moveEase, onComplete: done });
    return;
  }

  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "auto" });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior: "auto" });
  }
  done();
}

/** Move keyboard focus to a section without scrolling (programmatic targets get tabindex=-1). */
export function focusTarget(el: HTMLElement) {
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/** Instant jump (used under the navigation curtain). Works even while scroll is locked. */
export function jumpTo(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  ScrollTrigger.update();
}

/** Freeze/unfreeze page scroll (preloader, modal moments). */
export function lockScroll(lock: boolean) {
  locked = lock;
  if (lenis) {
    if (lock) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
