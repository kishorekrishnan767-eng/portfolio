import { DUR, EASE, gsap, SplitText, STAGGER } from "./gsap";

type Unit = "lines" | "words";

/**
 * Masked SplitText reveal (yPercent 110 → 0), played on enter and reversed on scroll-up.
 * autoSplit re-measures on resize/font swap and re-syncs the animation.
 * Call inside useGSAP / matchMedia so it's reverted on cleanup.
 */
export function revealText(
  target: gsap.DOMTarget,
  {
    by = "lines",
    trigger,
    start = "top 85%",
    delay = 0,
  }: { by?: Unit; trigger?: gsap.DOMTarget; start?: string; delay?: number } = {},
) {
  return SplitText.create(target, {
    type: by === "lines" ? "lines" : "words,lines",
    mask: by,
    linesClass: "split-mask",
    wordsClass: "split-mask",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self[by], {
        yPercent: 110,
        duration: DUR.slow,
        ease: EASE.enter,
        stagger: STAGGER.text,
        delay,
        scrollTrigger: {
          trigger: (trigger ?? self.elements[0]) as Element,
          start,
          toggleActions: "play none none reverse",
        },
      }),
  });
}

/** Reduced-motion stand-in: a plain opacity fade, still reversible. */
export function fadeIn(target: gsap.DOMTarget, { trigger, start = "top 85%" }: { trigger?: gsap.DOMTarget; start?: string } = {}) {
  return gsap.from(target, {
    opacity: 0,
    duration: DUR.base,
    ease: EASE.enter,
    scrollTrigger: {
      trigger: (trigger ?? target) as Element,
      start,
      toggleActions: "play none none reverse",
    },
  });
}
