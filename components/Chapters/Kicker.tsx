import type { Chapter } from "@/data/content";

/**
 * Chapter eyebrow: "I ── The Curiosity" in mono HUD style. The visible title decodes from
 * noise on enter (components/Connective.tsx); screen readers get the plain text.
 */
export default function Kicker({ chapter, className = "" }: { chapter: Chapter; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 text-fog ${className}`}>
      <span className="text-cyan">{chapter.numeral}</span>
      <span aria-hidden="true" className="h-px w-8 bg-fog/40" />
      <span className="sr-only">{chapter.title}</span>
      <span aria-hidden="true" data-decode="" className="whitespace-pre">
        {chapter.title}
      </span>
    </p>
  );
}
