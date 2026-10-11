import { ImageResponse } from "next/og";
import { hero, site } from "@/data/content";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the SIGNAL world in one frame — name, line, heartbeat. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(70% 60% at 50% 110%, #0f2a2a 0%, #04070d 70%)",
          color: "#e8f1f5",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#8a9bb0", textTransform: "uppercase" }}>
          {site.concept}
        </div>
        <svg width="1056" height="120" viewBox="0 0 1056 120">
          <path
            d="M0 80 H430 L446 80 L456 92 L474 12 L492 112 L502 80 H540 Q556 64 572 80 H1056"
            fill="none"
            stroke="#3df5d6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>{site.name}</div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 20, color: "#e8f1f5" }}>
            {hero.line.before}
            <span style={{ color: "#3df5d6", marginLeft: 12, fontStyle: "italic" }}>{hero.line.accent}</span>
            {hero.line.after}
          </div>
          <div style={{ fontSize: 22, marginTop: 24, letterSpacing: 4, color: "#8a9bb0", textTransform: "uppercase" }}>
            {hero.disciplines.join("  ·  ")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
