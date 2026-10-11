"use client";

import { useEffect, useRef, useState } from "react";
import { chapters, site } from "@/data/content";
import { DUR, EASE, gsap, useGSAP } from "@/lib/gsap";
import { navigate } from "@/lib/navigate";
import { activeChapter, whenBooted } from "@/lib/signal";

const LAST = chapters.length - 1;

export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => activeChapter.subscribe(setActive), []);

  // Entrance once the curtain opens.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Resolve now: the boot callback runs inside the preloader's GSAP context,
        // where a selector string would be scoped to the preloader.
        const items = gsap.utils.toArray<HTMLElement>(".nav-item", root.current);
        gsap.set(items, { yPercent: -140, opacity: 0 });
        return whenBooted(() => {
          gsap.to(items, { yPercent: 0, opacity: 1, duration: DUR.slow, ease: EASE.enter, stagger: 0.08, delay: 0.7 });
        });
      });
    },
    { scope: root },
  );

  // Odometer: numeral + label columns roll to the active chapter.
  useGSAP(
    () => {
      gsap.to(".nav-roll", {
        yPercent: (-100 * active) / chapters.length,
        duration: DUR.base,
        ease: EASE.move,
        overwrite: true,
      });
    },
    { scope: root, dependencies: [active] },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    root.current?.querySelector<HTMLElement>("[data-menu-item]")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    navigate(`#${id}`);
  };

  return (
    <header
      ref={root}
      className="pointer-events-none fixed inset-x-0 top-0"
      style={{ zIndex: "var(--z-nav)", paddingInline: "var(--gutter)" }}
    >
      <div className="mx-auto flex max-w-(--max-w) items-center justify-between pt-5 md:pt-7">
        <a
          href="#prologue"
          onClick={(e) => go(e, "prologue")}
          className="nav-item pointer-events-auto flex items-center gap-3 text-mist"
          aria-label={`${site.name} — back to top`}
        >
          <span className="grid size-10 place-items-center rounded-full border border-fog/25 bg-abyss/60 font-display text-sm font-extrabold backdrop-blur-md">
            KK
          </span>
          <span className="label hidden text-fog lg:inline">{site.name}</span>
        </a>

        <nav aria-label="Chapters" className="nav-item pointer-events-auto relative">
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="chapter-menu"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-4 rounded-full border border-fog/25 bg-abyss/60 py-2.5 pl-5 pr-3 backdrop-blur-md transition-colors duration-500 hover:border-cyan/60"
          >
            <span className="sr-only">
              Chapter menu. Current: {chapters[active].label}
            </span>
            <span aria-hidden="true" className="label flex items-center gap-3">
              <span className="block h-[1em] min-w-[2.25ch] overflow-hidden text-cyan">
                <span className="nav-roll block">
                  {chapters.map((c) => (
                    <span key={c.id} className="block h-[1em]">
                      {c.numeral}
                    </span>
                  ))}
                </span>
              </span>
              <span className="h-3 w-px bg-fog/30" />
              <span className="block h-[1em] overflow-hidden text-mist">
                <span className="nav-roll block">
                  {chapters.map((c) => (
                    <span key={c.id} className="block h-[1em]">
                      {c.label}
                    </span>
                  ))}
                </span>
              </span>
              <span className="hidden text-fog/60 tabular-nums sm:inline">
                {String(active).padStart(2, "0")}/{String(LAST).padStart(2, "0")}
              </span>
            </span>
            <span aria-hidden="true" className="grid size-7 place-items-center">
              <span
                className={`block h-px w-3.5 bg-mist transition-transform duration-500 ease-move ${open ? "translate-y-0 rotate-45" : "-translate-y-[3px]"}`}
              />
              <span
                className={`-mt-px block h-px w-3.5 bg-mist transition-transform duration-500 ease-move ${open ? "translate-y-0 -rotate-45" : "translate-y-[3px]"}`}
              />
            </span>
          </button>

          <ol
            id="chapter-menu"
            className={`absolute right-0 top-full mt-3 w-64 origin-top-right rounded-2xl border border-fog/20 bg-navy/90 p-2 backdrop-blur-xl transition-[opacity,transform,visibility] duration-500 ease-enter ${
              open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"
            }`}
          >
            {chapters.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  data-menu-item
                  aria-current={i === active ? "location" : undefined}
                  onClick={(e) => go(e, c.id)}
                  className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-trench focus-visible:bg-trench ${
                    i === active ? "text-mist" : "text-fog"
                  }`}
                >
                  <span className={`label w-6 ${i === active ? "text-cyan" : "text-fog/60"}`}>{c.numeral}</span>
                  <span className="font-sans text-sm font-semibold">{c.title}</span>
                  {i === active && <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-cyan shadow-[var(--glow-cyan)]" />}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
