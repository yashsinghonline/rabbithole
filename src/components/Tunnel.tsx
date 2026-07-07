import type { Theory } from "../data/theories";
import type { WikiTheory } from "../services/wikipedia";

type AnyTheory = Theory | WikiTheory;

const VIEW = 420;
const RING_SPACING = 30;
const RING_COUNT = 14;

function project(dz: number) {
  return 34 / (dz + 11);
}

function hashId(id: number | string): number {
  if (typeof id === "number") return id;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function openTheory(t: AnyTheory) {
  // Always open Wikipedia in a new tab — there is no local file anymore.
  window.open(t.url, "_blank", "noopener,noreferrer");
}

export default function Tunnel({
  depth,
  theories,
}: {
  depth: number;
  theories: AnyTheory[];
}) {
  const darkness = Math.min(1, (depth / 3000));

  // rings
  const firstRing = Math.floor(depth / RING_SPACING) * RING_SPACING;
  const rings = [];
  for (let k = 1; k <= RING_COUNT; k++) {
    const ringDepth = firstRing + k * RING_SPACING;
    const dz = ringDepth - depth;
    if (dz <= 0) continue;
    const s = project(dz);
    const opacity = Math.max(0, (1 - dz / VIEW) * (0.45 - darkness * 0.2));
    const red = Math.floor(60 + darkness * 140);
    rings.push(
      <div
        key={ringDepth}
        className="absolute left-1/2 top-1/2 border"
        style={{
          width: 480,
          height: 480,
          borderColor: `rgba(${red}, ${Math.floor(60 - darkness * 30)}, ${Math.floor(60 - darkness * 30)}, ${opacity})`,
          borderRadius: ringDepth % 90 === 0 ? "50%" : "6%",
          transform: `translate(-50%, -50%) scale(${s}) rotate(${ringDepth * 0.4}deg)`,
        }}
      />
    );
  }

  // theory nodes
  const nodes = theories.filter((t) => {
    const dz = t.depth - depth;
    return dz > -28 && dz < VIEW;
  }).map((t, i) => {
    const dz = t.depth - depth;
    const s = Math.max(0.05, 46 / (dz + 15));
    const passing = dz < 0;
    const opacity = passing ? Math.max(0, 1 + dz / 28) : Math.min(1, Math.max(0.08, 1.15 - dz / VIEW));
    const readable = dz < 150 && dz > -10;
    const hid = hashId(t.id);
    const side = hid % 2 === 0 ? 1 : -1;
    const xOff = side * 40 * s;
    const yOff = (hid % 3 === 0 ? -1 : 1) * 16 * s;
    const blur = passing ? Math.min(8, -dz * 0.4) : dz > 300 ? 1.5 : 0;
    const isWiki = (t as { procedural?: boolean }).procedural === true;
    return (
      <div
        key={t.slug + "-" + i}
        className="absolute left-1/2 top-1/2 whitespace-nowrap text-center"
        style={{
          transform: `translate(calc(-50% + ${xOff}px), calc(-50% + ${yOff}px)) scale(${s})`,
          opacity,
          filter: blur ? `blur(${blur}px)` : undefined,
          zIndex: Math.floor(1000 - dz),
          pointerEvents: readable ? "auto" : "none",
        }}
      >
        <button
          onClick={() => readable && openTheory(t)}
          className={`block ${readable ? "cursor-pointer group" : "cursor-default"}`}
        >
          <span
            className={`text-2xl tracking-[0.25em] ${
              isWiki ? "text-red-400/90" : "text-neutral-200"
            } ${readable ? "glitch-text group-hover:text-red-500" : "chromatic"}`}
          >
            [ {t.title} ]
          </span>
          {readable && (
            <span className="block text-[9px] tracking-[0.3em] text-neutral-500 mt-2 group-hover:text-red-400/70">
              {t.category.toUpperCase()} · DANGER {"▮".repeat(t.dangerLevel)}{"▯".repeat(5 - t.dangerLevel)} · CLICK TO OPEN SOURCE ↗
            </span>
          )}
        </button>
      </div>
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: 600 }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, #000 ${8 - darkness * 4}%, rgba(8,8,10,0.9) 30%, #050506 70%)`,
        }}
      />
      {rings}
      {nodes}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 20%, rgba(0,0,0,${0.25 + darkness * 0.55}) 90%)`,
        }}
      />
      {darkness > 0.45 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(120, 0, 0, ${(darkness - 0.45) * 0.14})` }}
        />
      )}
    </div>
  );
}
