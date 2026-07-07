const BASE_MARKS = [0, 100, 200, 300, 500, 1000, 1500, 3000];

function buildMarks(depth: number): number[] {
  // always include the base marks, then add round-number marks past 3000
  // up to roughly 1.6x the current depth so the user is always in the upper-middle of the meter
  const target = Math.max(3000, depth * 1.6);
  const result = [...BASE_MARKS];
  let step = 1000;
  let next = 4000;
  while (next <= target) {
    result.push(next);
    next += step;
    // widen step every 10km so marks don't become absurdly dense
    if (next >= 10000) step = 5000;
    if (next >= 50000) step = 25000;
    if (next >= 250000) step = 100000;
  }
  return result;
}

export default function DepthMeter({ depth }: { depth: number }) {
  const deep = depth > 1500;
  const abyss = depth > 10000;
  const marks = buildMarks(depth);

  let hereAfter = 0;
  for (let i = 0; i < marks.length; i++) {
    if (depth >= marks[i]) hereAfter = i;
  }

  return (
    <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 select-none pointer-events-none">
      <p className="text-[10px] tracking-[0.4em] text-neutral-500 mb-1">DEPTH</p>
      <p className={`text-xl md:text-2xl tabular-nums mb-4 ${abyss ? "text-red-500 glitch-text" : deep ? "text-red-500 chromatic" : "text-neutral-100 chromatic"}`}>
        {depth < 10000 ? depth.toFixed(1) : depth.toFixed(0)}&nbsp;m
      </p>
      <div className="text-[10px] leading-4 text-neutral-600">
        {marks.map((m, i) => (
          <div key={m}>
            <p className={depth >= m ? "text-neutral-400" : ""}>{formatDepth(m)}&nbsp;m</p>
            {i === hereAfter ? (
              <p className="text-red-500 animate-pulse">├── YOU ARE HERE</p>
            ) : (
              <p>│</p>
            )}
          </div>
        ))}
        <p className={`mt-2 tracking-[0.3em] ${abyss ? "text-red-500 animate-pulse" : deep ? "text-red-900" : "text-neutral-700"}`}>
          NO RETURN
        </p>
        {abyss && (
          <p className="mt-2 text-[9px] tracking-[0.3em] text-neutral-800 animate-pulse">
            METER IS ESTIMATED
          </p>
        )}
      </div>
    </div>
  );
}

function formatDepth(m: number): string {
  if (m >= 10000) return `${(m / 1000).toFixed(0)}k`;
  return String(m);
}
