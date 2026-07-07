import { useEffect, useRef, useState } from "react";
import { THEORIES, type Theory } from "../data/theories";
import { wikiSearch, getPoolSnapshot } from "../services/wikipedia";

interface Props {
  onJump: (depth: number) => void;
}

type Result = { kind: "curated" | "wiki"; title: string; summary: string; url: string; depth?: number };

export default function SearchBar({ onJump }: Props) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [wikiResults, setWikiResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!q.trim()) {
      setWikiResults([]);
      return;
    }
    timerRef.current = window.setTimeout(async () => {
      setLoading(true);
      const results = await wikiSearch(q);
      setWikiResults(
        results.map((r) => ({ kind: "wiki", title: r.title, summary: r.summary, url: r.url }))
      );
      setLoading(false);
    }, 220);
  }, [q]);

  const curatedMatches = q.trim()
    ? THEORIES.filter((t) => t.title.toLowerCase().includes(q.trim().toLowerCase()) ||
        t.category.toLowerCase().includes(q.trim().toLowerCase())
      ).slice(0, 4)
    : [];

  // also surface any streamed theories that match the query (already in pool)
  const streamedMatches = q.trim()
    ? getPoolSnapshot()
        .filter((t) => t.title.toLowerCase().includes(q.trim().toLowerCase()))
        .slice(0, 3)
    : [];

  const results: Result[] = [
    ...curatedMatches.map((t: Theory) => ({ kind: "curated" as const, title: t.title, summary: t.summary, url: t.url, depth: t.depth })),
    ...streamedMatches.map((t) => ({ kind: "wiki" as const, title: t.title, summary: t.summary, url: t.url, depth: t.depth })),
    ...wikiResults,
  ].slice(0, 8);

  const open = (r: Result) => {
    setQ("");
    inputRef.current?.blur();
    if (r.depth !== undefined && r.kind === "curated") {
      onJump(r.depth);
    }
    window.open(r.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative w-64 md:w-96 pointer-events-auto">
      <div className="flex items-center border border-neutral-800 bg-black/80 px-3 py-1.5 focus-within:border-red-900/70">
        <span className="text-neutral-600 text-xs mr-2">&gt;</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder="Search conspiracy theories..."
          className="bg-transparent text-xs text-neutral-200 placeholder-neutral-600 w-full tracking-wider"
          spellCheck={false}
        />
      </div>
      {focused && q.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-neutral-800 bg-black/95 z-40 max-h-72 overflow-y-auto">
          {loading && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-neutral-600 tracking-widest">QUERYING THE ARCHIVE...</p>
          )}
          {results.length === 0 && !loading && (
            <p className="px-3 py-2 text-xs text-red-500/80 tracking-widest">NO RECORD. OR THE RECORD WAS REMOVED.</p>
          )}
          {results.map((r, i) => (
            <button
              key={r.url + i}
              onMouseDown={(e) => {
                e.preventDefault();
                open(r);
              }}
              className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-red-950/40 hover:text-red-400 flex justify-between gap-2 border-b border-neutral-900/60 last:border-0"
            >
              <div className="min-w-0">
                <p className="tracking-widest truncate">{r.title}</p>
                {r.summary && <p className="text-[10px] text-neutral-600 truncate">{r.summary}</p>}
              </div>
              <span className="text-neutral-600 tabular-nums shrink-0">
                {r.depth !== undefined ? `${r.depth}m · ` : ""}OPEN ↗
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
