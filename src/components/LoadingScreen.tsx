import { useEffect, useRef, useState } from "react";
import PixelRabbit from "./PixelRabbit";
import { audio } from "../audio/AudioEngine";
import { FALL_NAMES } from "../data/theories";

type Phase = "await" | "boot" | "walk" | "stare" | "glitch" | "crack" | "jump" | "fall";

const GLITCH_MSGS = ["THEY LIED", "KEEP DIGGING", "YOU ARE WATCHED", "WAKE UP"];

const BOOT_LINES = [
  "> establishing connection.....OK",
  "> verifying you are alone.....OK",
  "> loading burrow protocol.....OK",
  "> reality anchor..............FAILED",
];

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("await");
  const [walkFrame, setWalkFrame] = useState<"walk1" | "walk2">("walk1");
  const [blink, setBlink] = useState(false);
  const [glitchMsg, setGlitchMsg] = useState(GLITCH_MSGS[0]);
  const [bootLine, setBootLine] = useState(0);
  const redEyes = useRef(Math.random() < 0.12).current; // secret: sometimes the rabbit's eyes are red
  const timers = useRef<number[]>([]);

  const t = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const begin = () => {
    if (phase !== "await") return;
    audio.start();
    setPhase("boot");

    // boot lines
    BOOT_LINES.forEach((_, i) => t(() => setBootLine(i + 1), 150 + i * 180));

    // walk: 1s boot → 2s walk
    t(() => setPhase("walk"), 1000);
    const walkInt = window.setInterval(() => {
      setWalkFrame((f) => (f === "walk1" ? "walk2" : "walk1"));
    }, 160);
    timers.current.push(walkInt as unknown as number);

    // stare: 3s
    t(() => {
      clearInterval(walkInt);
      setPhase("stare");
      audio.setMuted(true); // audio cuts
    }, 3000);
    t(() => setBlink(true), 3800);
    t(() => setBlink(false), 4000);

    // glitch: 4.5s
    t(() => {
      audio.setMuted(false);
      audio.glitchBurst(0.3);
      setPhase("glitch");
    }, 4500);
    GLITCH_MSGS.forEach((m, i) =>
      t(() => {
        setGlitchMsg(m);
        audio.glitchBurst(0.08);
      }, 4500 + i * 240)
    );

    // crack: 5.5s
    t(() => {
      setPhase("crack");
      audio.boom();
    }, 5500);

    // jump: 6.7s
    t(() => setPhase("jump"), 6700);

    // fall: 7.5s
    t(() => {
      setPhase("fall");
      audio.glitchBurst(0.2);
    }, 7500);

    // done: 10.3s
    t(() => onDone(), 10300);
  };

  const rabbitPose = phase === "walk" || phase === "boot" ? walkFrame : blink ? "blink" : "front";

  return (
    <div
      className={`fixed inset-0 bg-black z-50 overflow-hidden select-none crt ${
        phase === "stare" ? "no-cursor" : ""
      } ${phase === "crack" ? "shake-hard" : phase === "walk" ? "shake-soft" : ""}`}
      onClick={begin}
    >
      {/* skip */}
      {phase !== "await" && phase !== "fall" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            timers.current.forEach(clearTimeout);
            audio.setMuted(false);
            onDone();
          }}
          className="absolute top-4 right-4 z-30 text-[10px] text-neutral-600 hover:text-red-500 tracking-widest"
        >
          [ SKIP ]
        </button>
      )}

      {/* ---------- PHASE: await / boot ---------- */}
      {(phase === "await" || phase === "boot") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <h1 className="glitch-text text-4xl md:text-6xl tracking-[0.35em] text-neutral-100">
            RABBIT&nbsp;HOLE
          </h1>
          {phase === "await" ? (
            <>
              <p className="text-neutral-500 text-sm tracking-widest caret">initializing...&nbsp;</p>
              <p className="mt-10 text-red-500/90 text-xs tracking-[0.3em] animate-pulse">
                [ CLICK TO ESTABLISH CONNECTION ]
              </p>
            </>
          ) : (
            <div className="text-left text-xs text-neutral-500 space-y-1 h-24">
              {BOOT_LINES.slice(0, bootLine).map((l, i) => (
                <p key={i} className={l.includes("FAILED") ? "text-red-500" : ""}>{l}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- PHASES: walk / stare / glitch / crack / jump ---------- */}
      {(phase === "walk" || phase === "stare" || phase === "glitch" || phase === "crack" || phase === "jump") && (
        <div className="absolute inset-0">
          {/* ground line */}
          {phase !== "crack" && phase !== "jump" && (
            <div className="absolute left-0 right-0 bottom-[28%] h-px bg-neutral-700" />
          )}

          {/* cracked ground */}
          {(phase === "crack" || phase === "jump") && (
            <svg className="absolute left-0 right-0 bottom-[24%] w-full h-24" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0,4 L38,4 L41,9 L44,3 L47,12 L50,18 L53,12 L56,3 L59,9 L62,4 L100,4" stroke="#555" strokeWidth="0.4" fill="none" />
              <path d="M44,6 L47,13 L50,19 L53,13 L56,6 Z" fill="#000" stroke="#333" strokeWidth="0.3" />
            </svg>
          )}

          {/* dust particles */}
          {(phase === "crack" || phase === "jump") &&
            Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-neutral-500"
                style={{
                  left: `${44 + Math.random() * 12}%`,
                  bottom: "26%",
                  animation: `floatDust ${0.6 + Math.random() * 0.8}s ${Math.random() * 0.5}s ease-out infinite`,
                }}
              />
            ))}

          {/* the rabbit */}
          <div
            className="absolute"
            style={{
              bottom: phase === "jump" ? "8%" : "28.2%",
              left: phase === "walk" ? undefined : "50%",
              transform: phase === "walk" ? undefined : "translateX(-50%)",
              opacity: phase === "jump" ? 0 : 1,
              transition: phase === "jump" ? "bottom 0.7s cubic-bezier(.5,-0.4,1,1), opacity 0.7s ease-in" : undefined,
              animation: phase === "walk" ? "rabbitWalk 2s linear forwards" : undefined,
            }}
          >
            <div style={{ transform: phase === "jump" ? "scale(0.4) rotate(18deg)" : "scale(1)", transition: "transform 0.7s ease-in" }}>
              <PixelRabbit pose={rabbitPose} redEyes={redEyes} px={9} />
            </div>
          </div>
          <style>{`@keyframes rabbitWalk { from { left: -10%; } to { left: 46%; } }`}</style>

          {/* glitch overlay */}
          {phase === "glitch" && (
            <div className="absolute inset-0 static-noise flex items-center justify-center bg-black/60">
              <p className="glitch-text text-red-500 text-3xl md:text-5xl tracking-[0.3em] font-bold">
                {glitchMsg}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------- PHASE: fall ---------- */}
      {phase === "fall" && (
        <div className="absolute inset-0 overflow-hidden">
          {/* speed lines */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-neutral-800"
              style={{
                left: `${(i * 41) % 100}%`,
                height: "40%",
                animation: `fallLine 0.4s ${(i * 0.09) % 0.4}s linear infinite`,
              }}
            />
          ))}
          {FALL_NAMES.map((name, i) => (
            <div
              key={name}
              className="absolute left-1/2 top-1/2 text-neutral-300 tracking-[0.3em] whitespace-nowrap chromatic"
              style={{ animation: `fallName 2.8s ${i * 0.38}s linear forwards`, opacity: 0 }}
            >
              [ {name} ]
            </div>
          ))}
          <div className="absolute inset-0 flex items-end justify-center pb-10">
            <p className="text-neutral-700 text-[10px] tracking-[0.4em] animate-pulse">DESCENDING</p>
          </div>
          <style>{`
            @keyframes fallName {
              0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
              20% { opacity: 0.9; }
              100% { transform: translate(-50%, -50%) scale(9); opacity: 0; }
            }
            @keyframes fallLine {
              from { top: -45%; } to { top: 110%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
