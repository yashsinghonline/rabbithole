interface Props {
  pose: "walk1" | "walk2" | "front" | "blink";
  redEyes?: boolean;
  smile?: boolean;
  px?: number; // pixel size
}

// Legend: . empty | # body | e eye | p inner ear | m mouth
const SIDE_1 = [
  "..........##....",
  "..........##....",
  ".........####...",
  ".........#e##...",
  ".........####...",
  "..##########....",
  ".############...",
  "#############...",
  ".############...",
  ".##..##...##....",
];

const SIDE_2 = [
  "..........##....",
  "..........##....",
  ".........####...",
  ".........#e##...",
  ".........####...",
  "..##########....",
  ".############...",
  "#############...",
  ".############...",
  "..##...##..##...",
];

const FRONT = [
  ".##....##.",
  ".#p#..#p#.",
  ".#p#..#p#.",
  ".########.",
  "##########",
  "#e######e#",
  "##########",
  "####mm####",
  ".########.",
  ".########.",
];

const FRONT_BLINK = FRONT.map((row, i) => (i === 5 ? "##########" : row));

const MAPS = { walk1: SIDE_1, walk2: SIDE_2, front: FRONT, blink: FRONT_BLINK };

export default function PixelRabbit({ pose, redEyes, smile, px = 8 }: Props) {
  const map = MAPS[pose];
  const rows = map.length;
  const cols = map[0].length;
  const color = (c: string): string | null => {
    switch (c) {
      case "#": return "#e2e2e2";
      case "p": return "#8a6b70";
      case "e": return redEyes ? "#ff2a2a" : "#000000";
      case "m": return smile ? "#ff2a2a" : "#e2e2e2";
      default: return null;
    }
  };
  return (
    <svg
      width={cols * px}
      height={rows * px}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      {map.flatMap((row, y) =>
        row.split("").map((c, x) => {
          const fill = color(c);
          return fill ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} /> : null;
        })
      )}
    </svg>
  );
}
