import type { Accent, Project } from "@/data/content";
import { projects } from "@/data/content";
import Art from "@/components/ui/Art";
import { VISUALS } from "./visuals";

const ACCENT: Record<Accent, string> = {
  cyan: "var(--color-cyan)",
  violet: "var(--color-violet)",
  amber: "var(--color-amber)",
  leaf: "var(--color-leaf)",
};

/** One full-screen project scene: problem → what I built → role → stack, beside its micro-story. */
/** Sensor → microcontroller → backend → app. The pulse is scrubbed with the story (Problems.tsx). */
function Flow({ stages }: { stages: Project["flow"] }) {
  return (
    <div className="pr-flow relative mt-6 w-full max-w-[min(20rem,80vw)] md:max-w-[min(54svh,32rem)]">
      <span aria-hidden="true" className="absolute inset-x-[12.5%] top-[7px] h-px bg-fog/20" />
      <span aria-hidden="true" className="pr-flow-lit absolute left-[12.5%] top-[7px] h-px w-[75%] origin-left" style={{ background: "var(--accent)" }} />
      <span aria-hidden="true" className="pr-flow-run absolute left-[12.5%] top-[3px] h-[9px] w-[75%]">
        <span className="absolute right-0 top-0 size-[9px] translate-x-1/2 rounded-full bg-mist" style={{ boxShadow: "0 0 10px var(--accent)" }} />
      </span>
      <ol aria-label="How the signal flows" className="relative grid grid-cols-4">
        {stages.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-2 text-center">
            <span aria-hidden="true" className="relative size-[15px] rounded-full border border-fog/40 bg-abyss">
              <span className="pr-flow-node absolute inset-[3px] rounded-full" style={{ background: "var(--accent)" }} />
            </span>
            <span className="label text-[0.625rem] leading-tight text-fog">
              <span className="sr-only">Step {i + 1}: </span>
              {s}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Scene({ project, total, art }: { project: Project; total: number; art: string | null }) {
  const { Visual } = VISUALS[project.id];
  const accent = ACCENT[project.accent];
  const accent2 = ACCENT[project.accent2 ?? project.accent];
  const titleId = `project-${project.id}`;
  const { labels } = projects;

  return (
    <article
      aria-labelledby={titleId}
      data-project={project.id}
      className="pr-scene"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* Depth layers (parallax on desktop) */}
      <div data-depth="-0.15" className="pointer-events-none absolute inset-0">
        <Art src={art} slot={`project-${project.id}`} sizes="(min-width: 768px) 100vw, 100vw" className="art-screen art-fade absolute inset-0 opacity-30" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(55% 60% at 72% 50%, color-mix(in oklab, ${accent} 11%, transparent), transparent 70%), radial-gradient(40% 45% at 85% 85%, color-mix(in oklab, ${accent2} 7%, transparent), transparent 70%)`,
        }}
      />
      <span
        aria-hidden="true"
        data-depth="-0.35"
        className="text-outline-faint pointer-events-none absolute -right-[2vw] top-1/2 -translate-y-1/2 font-display text-[48vw] font-extrabold leading-none md:text-[30vw]"
      >
        {project.index}
      </span>

      <div className="shell relative grid w-full items-center gap-10 md:grid-cols-12 md:gap-8">
        <div className="order-2 md:order-1 md:col-span-5">
          <p className="pr-reveal label text-fog">
            <span style={{ color: accent }}>{project.index}</span> / {String(total).padStart(2, "0")}
          </p>
          <h3 id={titleId} className="pr-reveal mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold md:text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.035em] text-mist">
            {project.name}
          </h3>
          <p className="pr-reveal mt-4 max-w-md text-lead text-mist/90">{project.tagline}</p>

          <dl className="mt-8 grid max-w-md gap-5 text-[0.95rem] leading-relaxed md:mt-10">
            <div className="pr-reveal">
              <dt className="label text-fog/70">{labels.problem}</dt>
              <dd className="mt-2 text-fog">{project.problem}</dd>
            </div>
            <div className="pr-reveal">
              <dt className="label text-fog/70">{labels.built}</dt>
              <dd className="mt-2 text-fog">{project.built}</dd>
            </div>
            <div className="pr-reveal flex items-baseline gap-4">
              <dt className="label text-fog/70">{labels.role}</dt>
              <dd className="label" style={{ color: accent }}>
                {project.role}
              </dd>
            </div>
          </dl>

          <ul aria-label={labels.stack} className="pr-reveal mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li
                key={s}
                className="label rounded-full border px-3 py-2 text-mist/90"
                style={{ borderColor: `color-mix(in oklab, ${accent} 45%, transparent)` }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div data-depth="0.08" className="order-1 flex flex-col items-center md:order-2 md:col-span-7">
          <div className="aspect-square w-full max-w-[min(20rem,80vw)] md:max-w-[min(54svh,32rem)]">
            <Visual project={project} />
          </div>
          <Flow stages={project.flow} />
        </div>
      </div>
    </article>
  );
}
