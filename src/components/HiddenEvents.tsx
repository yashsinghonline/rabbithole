import { useEffect, useRef, useState } from "react";
import { audio } from "../audio/AudioEngine";

interface EventDef {
  at: number;
  text: string;
  sub?: string;
  blackout?: boolean;
  hold?: number;
}

const DEPTH_EVENTS: EventDef[] = [
  { at: 500, text: "YOU SHOULD STOP." },
  { at: 1000, text: "WHY ARE YOU STILL SCROLLING?" },
  { at: 1500, text: "", blackout: true },
  { at: 2000, text: "YOU HAVE BEEN HERE BEFORE." },
  { at: 3500, text: "IT KEEPS GOING." },
  { at: 5000, text: "THE ARCHIVE IS NOT CURATED." },
  { at: 8000, text: "YOU ARE BELOW THE FLOOR." },
];

const RANDOM_MSGS = ["FOLLOWED TOO CLOSELY", "YOU LOOKED TOO DEEP", "THERE IS NO EXIT", "ERR_0x52_OBSERVER_DETECTED"];

export default function HiddenEvents({ depth }: { depth: number }) {
  const triggered = useRef<Set<number>>(new Set());
  const [overlay, setOverlay] = useState<EventDef | null>(null);
  const [blackout, setBlackout] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const lastDepth = useRef(depth);

  // depth threshold events
  useEffect(() => {
    for (const ev of DEPTH_EVENTS) {
      if (lastDepth.current < ev.at && depth >= ev.at && !triggered.current.has(ev.at)) {
        triggered.current.add(ev.at);
        audio.glitchBurst(0.25);
        if (ev.blackout) {
          setBlackout(true);
          setTimeout(() => setBlackout(false), 1600);
        } else {
          setOverlay(ev);
          setTimeout(() => setOverlay(null), ev.hold ?? 2600);
        }
      }
    }
    lastDepth.current = depth;
  }, [depth]);

  // random paranoia flashes
  useEffect(() => {
    const int = setInterval(() => {
      if (Math.random() < 0.3) {
        const msg = RANDOM_MSGS[Math.floor(Math.random() * RANDOM_MSGS.length)];
        audio.glitchBurst(0.1);
        setFlash(msg);
        setTimeout(() => setFlash(null), 850);
      }
    }, 34000);
    return () => clearInterval(int);
  }, []);

  return (
    <>
      {overlay && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/85 static-noise pointer-events-none">
          <p className="glitch-text text-red-500 text-2xl md:text-4xl tracking-[0.3em] text-center px-4">
            {overlay.text}
          </p>
          {overlay.sub && (
            <p className="text-neutral-500 text-sm tracking-[0.4em] mt-6">{overlay.sub}</p>
          )}
        </div>
      )}
      {blackout && (
        <div className="fixed inset-0 z-50 bg-black flex items-end justify-end p-6">
          <p className="text-neutral-800 text-[10px] tracking-[0.4em]">NO SIGNAL</p>
        </div>
      )}
      {flash && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <p className="glitch-text text-red-500/90 text-lg md:text-2xl tracking-[0.35em] bg-black/70 px-6 py-3 border border-red-900/50">
            {flash}
          </p>
        </div>
      )}
    </>
  );
}
