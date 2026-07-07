import { useEffect, useRef, useState } from "react";
import Tunnel from "../components/Tunnel";
import DepthMeter from "../components/DepthMeter";
import SearchBar from "../components/SearchBar";
import HiddenEvents from "../components/HiddenEvents";
import { audio } from "../audio/AudioEngine";
import { depthStore } from "../state/depthStore";
import { SUBHEADINGS, THEORIES } from "../data/theories";
import { ensureTheoriesUpTo, type WikiTheory } from "../services/wikipedia";

type AnyTheory = (typeof THEORIES)[number] | WikiTheory;

export default function Home() {
  const depthRef = useRef(depthStore.current);
  const velRef = useRef(0);
  const targetRef = useRef<number | null>(null);
  const [depth, setDepth] = useState(depthStore.current);
  const [subIdx, setSubIdx] = useState(0);
  const [muted, setMuted] = useState(audio.muted);
  const [panel, setPanel] = useState<"about" | "archive" | null>(null);
  const [theories, setTheories] = useState<AnyTheory[]>(THEORIES);
  const lastPrefetch = useRef(-1000);

  // ---- descent physics loop ----
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (targetRef.current !== null) {
        const d = targetRef.current - depthRef.current;
        depthRef.current += d * 0.055;
        if (Math.abs(d) < 0.8) targetRef.current = null;
      } else {
        velRef.current *= 0.928;
        if (Math.abs(velRef.current) < 0.002) velRef.current = 0;
        depthRef.current += velRef.current;
      }
      depthRef.current = Math.max(0, depthRef.current); // NO UPPER CAP
      depthStore.current = depthRef.current;
      setDepth(depthRef.current);
      audio.setDepth(depthRef.current);
      audio.setVelocity(velRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onWheel = (e: WheelEvent) => {
      targetRef.current = null;
      velRef.current += e.deltaY * 0.011;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "s") velRef.current += 1.6;
      if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "w") velRef.current -= 1.6;
    };
    let lastY = 0;
    const onTouchStart = (e: TouchEvent) => { lastY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      targetRef.current = null;
      velRef.current += (lastY - y) * 0.045;
      lastY = y;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // ---- stream Wikipedia theories ahead of the user's depth ----
  useEffect(() => {
    if (depth - lastPrefetch.current < 400) return;
    lastPrefetch.current = depth;
    ensureTheoriesUpTo(depth).then((wikiTheories) => {
      setTheories((prev) => {
        // keep curated + merge streamed, dedup by slug
        const seen = new Set(prev.map((t) => t.slug));
        const merged: AnyTheory[] = [...prev];
        for (const w of wikiTheories) {
          if (!seen.has(w.slug)) {
            seen.add(w.slug);
            merged.push(w);
          }
        }
        return merged;
      });
    });
  }, [depth]);

  // rotating subheading
  useEffect(() => {
    const int = setInterval(() => setSubIdx((i) => (i + 1) % SUBHEADINGS.length), 7000);
    return () => clearInterval(int);
  }, []);

  const jumpTo = (d: number) => {
    targetRef.current = Math.max(0, d - 60);
  };

  const surface = depth < 30;
  const darkness = Math.min(1, depth / 3000);

  return (
    <div className="fixed inset-0 bg-black crt crt-flicker overflow-hidden select-none">
      <Tunnel depth={depth} theories={theories} />

      {/* ---------- header ---------- */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 pointer-events-none">
        <h1
          className="glitch-text text-lg md:text-xl tracking-[0.4em] text-neutral-100 pointer-events-auto cursor-pointer"
          onClick={() => (targetRef.current = 0)}
          title="return to surface"
        >
          RABBIT&nbsp;HOLE
        </h1>
        <nav className="flex gap-4 md:gap-6 text-[10px] md:text-xs tracking-[0.25em] text-neutral-500 pointer-events-auto">
          <button className="hover:text-red-500" onClick={() => setPanel("about")}>ABOUT</button>
          <button className="hover:text-red-500" onClick={() => setPanel("archive")}>ARCHIVE</button>
          <button
            className={muted ? "text-red-500" : "hover:text-red-500"}
            onClick={() => {
              audio.start();
              audio.setMuted(!muted);
              setMuted(!muted);
            }}
          >
            AUDIO&nbsp;{muted ? "OFF" : "ON"}
          </button>
        </nav>
      </header>

      {/* ---------- search ---------- */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <SearchBar onJump={jumpTo} />
      </div>

      {/* ---------- subheading (surface only) ---------- */}
      {surface && (
        <div
          className="absolute top-[32%] left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none fade-in"
          style={{ opacity: 1 - depth / 30 }}
        >
          <p className="chromatic text-neutral-300 text-sm md:text-lg tracking-[0.3em] whitespace-pre-line leading-8">
            {SUBHEADINGS[subIdx]}
          </p>
        </div>
      )}

      {/* ---------- depth meter ---------- */}
      <DepthMeter depth={depth} />

      {/* ---------- scroll hint ---------- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <p className="text-neutral-600 text-[10px] tracking-[0.5em] animate-pulse">
          {surface ? "SCROLL TO DESCEND ▼" : darkness > 0.95 ? "KEEP DIGGING ▼" : "KEEP DIGGING ▼"}
        </p>
      </div>

      {/* ---------- hidden events ---------- */}
      <HiddenEvents depth={depth} />

      {/* ---------- panels ---------- */}
      {panel && (
        <div className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center p-6" onClick={() => setPanel(null)}>
          <div
            className="border border-neutral-800 bg-black max-w-lg w-full p-6 md:p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="glitch-text tracking-[0.35em] text-neutral-100">
                {panel === "about" ? "ABOUT" : "ARCHIVE"}
              </h2>
              <button className="text-neutral-600 hover:text-red-500 text-xs" onClick={() => setPanel(null)}>
                [ CLOSE ]
              </button>
            </div>
            {panel === "about" ? (
              <div className="text-xs text-neutral-400 leading-6 space-y-4 tracking-wider">
                <p>RABBIT HOLE is a descent, not a website.</p>
                <p>
                  Scroll and you fall. Every theory you pass is a real entry in the Wikipedia record of
                  conspiracy, folklore, pseudoscience, and fringe belief. Click any title to open its source.
                </p>
                <p>Below the first sixteen curated entries, the archive streams live from Wikipedia. There is no bottom.</p>
                <p>Nothing here is a recommendation to believe anything. Or not to.</p>
                <p className="text-red-500/80">Except one entry, which is entirely true. We won't say which.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-neutral-700 text-[10px] tracking-[0.3em] mb-3">CURATED ENTRIES</p>
                {THEORIES.map((t) => (
                  <div key={t.slug} className="flex items-center justify-between gap-2 text-xs">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-300 hover:text-red-500 tracking-widest text-left truncate"
                    >
                      {t.title}
                    </a>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-neutral-700 tabular-nums">{t.depth}m</span>
                      <button
                        className="text-neutral-600 hover:text-red-500"
                        onClick={() => {
                          jumpTo(t.depth);
                          setPanel(null);
                        }}
                      >
                        [ DIVE ]
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-red-500/60 pt-5 tracking-[0.3em]">
                  + ∞ STREAMED ENTRIES BELOW 1500m · LIVE FROM WIKIPEDIA · NEVER STOPS
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
