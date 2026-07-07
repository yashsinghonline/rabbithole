export interface Theory {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  dangerLevel: number;
  depth: number;
  level: number;
  /** External link — Wikipedia URL for curated entries, Wikipedia URL for streamed entries. */
  url: string;
}

const w = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`;

export const THEORIES: Theory[] = [
  // ---------------- LEVEL 1 ----------------
  {
    id: 1, slug: "area-51", title: "AREA 51",
    summary: "A classified USAF facility in the Nevada desert, long rumored to house recovered extraterrestrial craft and biology.",
    category: "Government", status: "EXISTENCE CONFIRMED / CONTENTS CLASSIFIED", dangerLevel: 2, depth: 60, level: 1,
    url: w("Area_51"),
  },
  {
    id: 2, slug: "moon-landing", title: "MOON LANDING",
    summary: "The claim that the 1969 Apollo 11 landing was staged in a studio — possibly directed by Stanley Kubrick.",
    category: "Space", status: "DEBUNKED / PERSISTENT", dangerLevel: 1, depth: 110, level: 1,
    url: w("Moon_landing_conspiracy_theories"),
  },
  {
    id: 3, slug: "illuminati", title: "ILLUMINATI",
    summary: "A Bavarian secret society dissolved in 1785 — or the hidden hand that has steered world events ever since.",
    category: "Secret Societies", status: "OFFICIALLY DISSOLVED 1785", dangerLevel: 2, depth: 170, level: 1,
    url: w("Illuminati"),
  },
  {
    id: 4, slug: "flat-earth", title: "FLAT EARTH",
    summary: "The belief that the Earth is a flat disc surrounded by an ice wall, and that all space agencies exist to conceal this.",
    category: "Cosmology", status: "DEBUNKED / GROWING ANYWAY", dangerLevel: 1, depth: 240, level: 1,
    url: w("Modern_flat_Earth_beliefs"),
  },

  // ---------------- LEVEL 2 ----------------
  {
    id: 5, slug: "mk-ultra", title: "MK-ULTRA",
    summary: "CIA mind control experiments conducted on unwitting citizens between 1953 and 1973. This one is real.",
    category: "Government", status: "PARTIALLY DECLASSIFIED", dangerLevel: 4, depth: 330, level: 2,
    url: w("Project_MKUltra"),
  },
  {
    id: 6, slug: "denver-airport", title: "DENVER AIRPORT",
    summary: "An airport 25 miles from the city it serves, with apocalyptic murals, a demonic horse statue, and five buried buildings.",
    category: "Architecture", status: "AIRPORT LEANS INTO IT", dangerLevel: 2, depth: 410, level: 2,
    url: w("Conspiracy_theories_about_Denver_International_Airport"),
  },
  {
    id: 7, slug: "haarp", title: "HAARP",
    summary: "An ionospheric research array in Alaska accused of controlling weather, triggering earthquakes, and broadcasting into minds.",
    category: "Technology", status: "TRANSFERRED TO CIVILIAN CONTROL", dangerLevel: 3, depth: 490, level: 2,
    url: w("High-frequency_Active_Auroral_Research_Program"),
  },
  {
    id: 8, slug: "philadelphia-experiment", title: "PHILADELPHIA EXPERIMENT",
    summary: "In 1943 the USS Eldridge allegedly turned invisible, teleported to Norfolk, and returned — with crew fused into the hull.",
    category: "Military", status: "NAVY DENIES ALL", dangerLevel: 4, depth: 580, level: 2,
    url: w("Philadelphia_Experiment"),
  },

  // ---------------- LEVEL 3 ----------------
  {
    id: 9, slug: "project-blue-beam", title: "PROJECT BLUE BEAM",
    summary: "An alleged plan to fake an alien invasion — or a second coming — with holograms, to unite Earth under one government.",
    category: "End Times", status: "UNVERIFIABLE BY DESIGN", dangerLevel: 4, depth: 680, level: 3,
    url: w("Project_Blue_Beam"),
  },
  {
    id: 10, slug: "hollow-earth", title: "HOLLOW EARTH",
    summary: "The planet is a shell. Openings at the poles lead to an inner sun and an inner world. Some say Byrd flew there.",
    category: "Cosmology", status: "GEOLOGICALLY IMPOSSIBLE / SPIRITUALLY PERSISTENT", dangerLevel: 3, depth: 780, level: 3,
    url: w("Hollow_Earth"),
  },
  {
    id: 11, slug: "simulation-theory", title: "SIMULATION THEORY",
    summary: "The proposition that this — all of this, including you reading this sentence — is computed.",
    category: "Reality", status: "UNFALSIFIABLE", dangerLevel: 5, depth: 880, level: 3,
    url: w("Simulation_hypothesis"),
  },
  {
    id: 12, slug: "cicada-3301", title: "CICADA 3301",
    summary: "The internet's most elaborate puzzle. Cryptography, Mayan numerology, physical posters on three continents. Recruiting for what?",
    category: "Internet", status: "UNSOLVED / SILENT SINCE 2017", dangerLevel: 3, depth: 990, level: 3,
    url: w("Cicada_3301"),
  },

  // ---------------- LEVEL 4 ----------------
  {
    id: 13, slug: "black-eyed-children", title: "BLACK EYED CHILDREN",
    summary: "They knock at night. They ask to come in. They are polite. Their eyes have no whites. Do not let them in.",
    category: "Entities", status: "FOLKLORE / FIRSTHAND REPORTS ONGOING", dangerLevel: 5, depth: 1100, level: 4,
    url: w("Black-eyed_kid"),
  },
  {
    id: 14, slug: "time-travelers", title: "TIME TRAVELERS",
    summary: "John Titor. The hipster at the 1941 bridge opening. The cell phone in the Chaplin film. Someone keeps visiting.",
    category: "Time", status: "AWAITING FUTURE CONFIRMATION", dangerLevel: 3, depth: 1220, level: 4,
    url: w("Time_travel_claims"),
  },
  {
    id: 15, slug: "alternate-timelines", title: "ALTERNATE TIMELINES",
    summary: "You remember it differently because it WAS different. The Mandela Effect as evidence of timeline merges.",
    category: "Reality", status: "YOUR MEMORY VS. THE RECORD", dangerLevel: 4, depth: 1340, level: 4,
    url: w("Mandela_effect"),
  },
  {
    id: 16, slug: "deep-web-mysteries", title: "DEEP WEB MYSTERIES",
    summary: "Red rooms, dead drops, number stations reborn as .onion addresses, and pages that should not know your name.",
    category: "Internet", status: "MOSTLY LEGEND / PARTLY NOT", dangerLevel: 5, depth: 1460, level: 4,
    url: w("Dark_web"),
  },
];

export const FALL_NAMES = ["AREA 51", "MK-ULTRA", "MOON LANDING", "PROJECT BLUE BEAM", "CICADA 3301", "PHILADELPHIA EXPERIMENT"];

export const SUBHEADINGS = [
  "THE DEEPER YOU SCROLL,\nTHE LESS REALITY MAKES SENSE.",
  "KEEP DIGGING.",
  "SOME HOLES HAVE NO BOTTOM.",
  "EVERY ANSWER CREATES MORE QUESTIONS.",
  "THERE IS NO FLOOR DOWN HERE.",
];
