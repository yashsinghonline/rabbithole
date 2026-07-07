/**
 * Wikipedia streaming conspiracy service.
 *
 * As the user descends, we lazily fetch category members from Wikipedia's
 * conspiracy / fringe / paranormal taxonomy and assign each a depth.
 * The stream is effectively infinite — there are thousands of articles.
 */

export interface WikiTheory {
  id: string;
  title: string;
  slug: string;
  summary: string;
  url: string;
  depth: number;
  procedural: true;
  category: string;
  dangerLevel: number;
  level: 5;
}

const WIKI_API = "https://en.wikipedia.org/w/api.php";

const CATEGORY_QUEUE = [
  "Conspiracy_theories",
  "Urban_legends",
  "Fringe_theories",
  "Pseudoscience",
  "Hoaxes",
  "Paranormal",
  "Unidentified_flying_objects",
  "Cryptids",
  "Occult",
  "Unsolved_murders",
  "Missing_person_cases",
  "Conspiracy_theories_in_the_United_States",
  "Political_conspiracy_theories",
  "Religious_conspiracy_theories",
  "Media-related_conspiracy_theories",
  "9/11_conspiracy_theories",
  "Moon_landing_conspiracy_theories",
  "New_World_Order_(conspiracy_theory)",
  "Flat_Earth",
  "Ufology",
  "Cryptozoology",
  "Supernatural_legends",
  "Ghost_stories",
  "Internet_mysteries",
  "Creepypasta",
  "ARG_fiction",
  "Alternate_history",
  "Time_travel",
  "Mind_control",
  "Secret_societies",
  "Freemasonry-related_controversies",
  "Illuminati",
  "Apocalypticism",
  "Doomsday_scenarios",
];

const pool: WikiTheory[] = [];
let nextDepth = 1560;
const SEEN_TITLES = new Set<string>();
let categoryIdx = 0;
let fetchInFlight = false;
const listeners = new Set<() => void>();

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((fn) => fn());
}

async function fetchNextCategory(): Promise<number> {
  if (fetchInFlight) return 0;
  fetchInFlight = true;
  let added = 0;
  try {
    const cat = CATEGORY_QUEUE[categoryIdx % CATEGORY_QUEUE.length];
    categoryIdx++;
    const params = new URLSearchParams({
      action: "query",
      generator: "categorymembers",
      gcmtitle: `Category:${cat}`,
      gcmtype: "page",
      gcmlimit: "50",
      prop: "extracts",
      exintro: "1",
      exsentences: "2",
      explaintext: "1",
      format: "json",
      origin: "*",
    });
    const res = await fetch(`${WIKI_API}?${params}`);
    if (!res.ok) return 0;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return 0;
    const entries: any[] = Object.values(pages);
    entries.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const page of entries) {
      const title: string | undefined = page.title;
      if (!title) continue;
      if (SEEN_TITLES.has(title)) continue;
      if (
        title.startsWith("List of") ||
        title.startsWith("Category:") ||
        title.includes("(disambiguation)") ||
        title.includes(" (list)")
      ) continue;
      SEEN_TITLES.add(title);
      const slug = title.replace(/ /g, "_");
      pool.push({
        id: `wiki-${page.pageid}`,
        title: title.toUpperCase(),
        slug,
        summary: page.extract || "",
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`,
        depth: nextDepth,
        procedural: true,
        category: cat.replace(/_/g, " ").toUpperCase(),
        dangerLevel: 3 + Math.floor(Math.random() * 3),
        level: 5,
      });
      nextDepth += 95;
      added++;
    }
  } catch {
    /* network failure — silent, will retry with next category */
  } finally {
    fetchInFlight = false;
    if (added > 0) emit();
  }
  return added;
}

/**
 * Make sure we have enough theories buffered to cover depth..depth+HORIZON.
 * Returns the full pool (the component filters the visible slice).
 */
const HORIZON = 1800;
const MIN_BUFFER_AHEAD = 18;

export async function ensureTheoriesUpTo(depth: number): Promise<WikiTheory[]> {
  // count how many we have between depth and depth+HORIZON
  const ahead = pool.filter((p) => p.depth >= depth && p.depth < depth + HORIZON).length;
  if (ahead < MIN_BUFFER_AHEAD) {
    // fetch up to 3 categories in a row if still short
    for (let i = 0; i < 3; i++) {
      const added = await fetchNextCategory();
      if (added === 0) break; // nothing came back, bail to avoid tight loop
      const fresh = pool.filter((p) => p.depth >= depth && p.depth < depth + HORIZON).length;
      if (fresh >= MIN_BUFFER_AHEAD) break;
    }
  }
  return pool.slice();
}

export function getPoolSnapshot(): WikiTheory[] {
  return pool.slice();
}

/** Wikipedia opensearch — used by the search bar. */
export async function wikiSearch(query: string): Promise<Array<{ title: string; summary: string; url: string }>> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    action: "opensearch",
    search: query,
    limit: "8",
    namespace: "0",
    format: "json",
    origin: "*",
  });
  try {
    const res = await fetch(`${WIKI_API}?${params}`);
    const data = await res.json();
    const titles: string[] = data[1] ?? [];
    const summaries: string[] = data[2] ?? [];
    const urls: string[] = data[3] ?? [];
    return titles.map((t, i) => ({
      title: t,
      summary: summaries[i] || "",
      url: urls[i] || `https://en.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, "_"))}`,
    }));
  } catch {
    return [];
  }
}
