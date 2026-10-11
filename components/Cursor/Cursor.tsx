"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type CursorState = "default" | "link" | "drag" | "project";

const STATES: Record<CursorState, { ring: number; dot: number; fill: number; label: string }> = {
  default: { ring: 1, dot: 1, fill: 0, label: "" },
  link: { ring: 1.7, dot: 0.35, fill: 0, label: "" },
  drag: { ring: 2.4, dot: 0, fill: 0.12, label: "Drag" },
  project: { ring: 3, dot: 0, fill: 0.16, label: "View" },
};

const INTERACTIVE = "[data-cursor], a, button, [role='button'], summary, label";

/**
 * Cyan dot + lagging ring. Elements opt into states with data-cursor="link|drag|project"
 * (links/buttons default to "link"); data-cursor-label overrides the label text.
 * Fine pointers with motion allowed only — everyone else keeps the native cursor.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const [dot] = q(".cursor-dot");
        const [ringPos] = q(".cursor-ring-pos");
        const [ring] = q(".cursor-ring");
        const [fill] = q(".cursor-fill");
        const [label] = q(".cursor-label");

        document.documentElement.classList.add("has-cursor");
        gsap.set([dot, ringPos], { xPercent: -50, yPercent: -50 });

        const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
        const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
        const ringX = gsap.quickTo(ringPos, "x", { duration: 0.5, ease: "power3.out" });
        const ringY = gsap.quickTo(ringPos, "y", { duration: 0.5, ease: "power3.out" });

        let state: CursorState = "default";
        let pressed = false;
        let shown = false;

        const apply = (next: CursorState, text?: string | null) => {
          state = next;
          const s = STATES[next];
          const press = pressed ? 0.82 : 1;
          gsap.to(ring, { scale: s.ring * press, duration: 0.5, ease: "power3.out", overwrite: "auto" });
          gsap.to(dot, { scale: s.dot, duration: 0.35, ease: "power3.out", overwrite: "auto" });
          gsap.to(fill, { opacity: s.fill, duration: 0.35, overwrite: "auto" });
          const txt = text ?? s.label;
          if (txt) label.textContent = txt;
          gsap.to(label, { opacity: txt ? 1 : 0, scale: txt ? 1 : 0.6, duration: 0.35, overwrite: "auto" });
        };

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          dotX(e.clientX);
          dotY(e.clientY);
          ringX(e.clientX);
          ringY(e.clientY);
          if (!shown) {
            shown = true;
            // First move: jump into place instead of flying in from the corner.
            gsap.set([dot, ringPos], { x: e.clientX, y: e.clientY });
            gsap.to(root.current, { autoAlpha: 1, duration: 0.4 });
          }
        };

        const onOver = (e: PointerEvent) => {
          const el = (e.target as Element).closest<HTMLElement>(INTERACTIVE);
          const next = (el ? ((el.dataset.cursor as CursorState) ?? "link") : "default") as CursorState;
          const text = el?.dataset.cursorLabel;
          if (next !== state || text) apply(STATES[next] ? next : "link", text);
        };

        const onDown = () => {
          pressed = true;
          apply(state);
        };
        const onUp = () => {
          pressed = false;
          apply(state);
        };
        const onLeaveWindow = () => {
          shown = false;
          gsap.to(root.current, { autoAlpha: 0, duration: 0.3 });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onOver, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        window.addEventListener("pointerup", onUp, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeaveWindow);

        return () => {
          document.documentElement.classList.remove("has-cursor");
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerover", onOver);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
        };
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 opacity-0"
      style={{ zIndex: "var(--z-cursor)" }}
    >
      <div className="cursor-ring-pos absolute left-0 top-0 grid place-items-center">
        <div className="cursor-ring col-start-1 row-start-1 grid size-9 place-items-center rounded-full border border-cyan/70">
          <div className="cursor-fill size-full rounded-full bg-cyan opacity-0" />
        </div>
        <span className="cursor-label label col-start-1 row-start-1 text-[0.625rem] text-mist opacity-0" />
      </div>
      <div className="cursor-dot absolute left-0 top-0 size-1.5 rounded-full bg-cyan" />
    </div>
  );
}
