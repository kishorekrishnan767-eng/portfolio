import Image from "next/image";

/**
 * Decorative artwork slot. With a file present it renders an optimised, lazy (or priority)
 * full-bleed image; without one it renders nothing in production and a labelled dashed
 * placeholder in development, so you can see where each image goes.
 * With `reveal`, components/Connective.tsx gives it a clip-path scroll reveal.
 */
export default function Art({
  src,
  slot,
  className = "",
  priority = false,
  reveal = false,
  sizes = "100vw",
}: {
  src: string | null;
  slot: string;
  className?: string;
  priority?: boolean;
  /** Clip-path reveal on scroll (vertical sections only; see components/Connective.tsx). */
  reveal?: boolean;
  sizes?: string;
}) {
  if (!src) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div aria-hidden="true" className={`pointer-events-none grid place-items-center border border-dashed border-fog/25 ${className}`}>
        <span className="label rounded-full bg-abyss/80 px-3 py-2 text-fog/70">public/images/{slot}.jpg</span>
      </div>
    );
  }
  return (
    <div aria-hidden="true" data-reveal={reveal ? "" : undefined} className={`art pointer-events-none overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} priority={priority} className="art-img object-cover" />
    </div>
  );
}
