/*
 * Line drawing of a small microcontroller board for Chapter V. Every `.bd-line` is drawn in
 * by DrawSVG when the panel opens; `.bd-flow` carries data pulses from USB → MCU → LED (CSS);
 * the LED blinks (CSS) and races when the board is hovered.
 */

const LEFT_PINS = [82, 94, 106, 118, 130, 142];
const TOP_PINS = [152, 164, 176, 188, 200, 212];
const HEADERS = Array.from({ length: 14 }, (_, i) => 66 + i * 16);

const TRACES = [
  "M34 110 H80 L96 94 H128", // USB D+ → MCU
  "M34 130 H90 L106 146 H128", // USB D- → MCU
  "M242 94 H262 L280 76 V66 H286", // MCU → LED
  "M242 128 H252", // MCU → crystal
  "M242 142 H270 L290 162 H300", // MCU → button
  "M164 172 V186 H130 V196",
  "M176 172 V188 H146 V196",
  "M188 172 V190 H194 V196",
  "M200 172 V186 H226 V196",
  "M212 172 V182 L226 168 H300 V36 H200 V58", // long return over the top
];

export default function Board() {
  return (
    <svg
      viewBox="0 0 360 240"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="nw-board size-full overflow-visible"
    >
      {/* PCB + mounting holes */}
      <rect className="bd-line stroke-fog/50" x={10} y={10} width={340} height={220} rx={16} strokeWidth={1.5} />
      {[
        [30, 30],
        [330, 30],
        [30, 210],
        [330, 210],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} className="bd-line stroke-fog/40" cx={x} cy={y} r={6} />
      ))}

      {/* USB-C */}
      <rect className="bd-line stroke-mist/70" x={2} y={96} width={34} height={48} rx={7} strokeWidth={1.5} />
      <rect className="bd-line stroke-fog/50" x={10} y={108} width={14} height={24} rx={4} />

      {/* MCU + pins */}
      <rect className="bd-line stroke-mist/80" x={140} y={70} width={90} height={90} rx={6} strokeWidth={1.5} />
      <circle className="bd-line stroke-fog/60" cx={152} cy={82} r={3} />
      {LEFT_PINS.map((y) => (
        <g key={y}>
          <line className="bd-line stroke-fog/50" x1={128} y1={y} x2={140} y2={y} />
          <line className="bd-line stroke-fog/50" x1={230} y1={y} x2={242} y2={y} />
        </g>
      ))}
      {TOP_PINS.map((x) => (
        <g key={x}>
          <line className="bd-line stroke-fog/50" x1={x} y1={58} x2={x} y2={70} />
          <line className="bd-line stroke-fog/50" x1={x} y1={160} x2={x} y2={172} />
        </g>
      ))}

      {/* Crystal, button */}
      <rect className="bd-line stroke-fog/60" x={252} y={120} width={34} height={16} rx={8} />
      <rect className="bd-line stroke-fog/60" x={300} y={150} width={26} height={26} rx={4} />
      <circle className="bd-line stroke-fog/60" cx={313} cy={163} r={7} />

      {/* Header row */}
      {HEADERS.map((x) => (
        <rect key={x} className="bd-line stroke-fog/50" x={x - 4} y={196} width={8} height={8} rx={1.5} />
      ))}

      {/* Copper traces + data pulses */}
      {TRACES.map((d) => (
        <path key={d} className="bd-line stroke-cyan/35" d={d} strokeWidth={1.25} />
      ))}
      {[TRACES[0], TRACES[2]].map((d, i) => (
        <path key={d} className="bd-flow stroke-cyan" d={d} strokeWidth={1.75} style={{ animationDelay: `${i * -0.8}s` }} />
      ))}

      {/* LED D1 */}
      <rect className="bd-line stroke-mist/70" x={286} y={58} width={18} height={14} rx={3} />
      <g className="bd-led-group">
        <circle className="bd-led fill-cyan/25" cx={295} cy={65} r={12} />
        <circle className="bd-led fill-cyan" cx={295} cy={65} r={4} style={{ filter: "drop-shadow(0 0 4px rgb(61 245 214 / 0.9))" }} />
      </g>

      {/* Silkscreen */}
      <g className="bd-text fill-fog/60 font-mono text-[9px] tracking-[0.18em]">
        <text x={150} y={120}>MCU</text>
        <text x={288} y={50}>D1</text>
        <text x={36} y={66}>LW-01</text>
        <text x={66} y={224}>GPIO</text>
      </g>
    </svg>
  );
}
