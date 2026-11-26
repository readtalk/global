"use client";

const formulas = ["(a ± b)² = a² ± 2ab + b²", "D = b² - 4ac", "a² + b² = c²", "lim f(x) = ±∞", "aₙ = a₁ + d(n-1)", "Sₙ = (a₁ + aₙ)/2 · n", "P = 2πR", "π = 3,14", "e = 2,718", "logₐ X = b ⇒ aᵇ = X", "y = √x + 1", "f(x) = 2⁻ˣ + 1"];
const symbols = ["π", "Σ", "∫", "√", "∞", "Δ", "±", "≠", "≡", "≥", "≤", "sin", "cos", "tan", "log", "e", "x", "y"];

function Cube() { return (<svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1"><path d="M26 6 L46 16 L46 36 L26 46 L6 36 L6 16 Z M26 6 L26 26 L46 16 M26 26 L6 16 M26 26 L26 46" /></svg>); }
function Prism() { return (<svg width="64" height="44" viewBox="0 0 64 44" fill="none" stroke="currentColor" strokeWidth="1"><path d="M10 36 L30 6 L54 10 L34 40 Z M10 36 L34 40 M30 6 L34 40 M30 6 L54 10" /></svg>); }
function Cylinder() { return (<svg width="44" height="58" viewBox="0 0 44 58" fill="none" stroke="currentColor" strokeWidth="1"><ellipse cx="22" cy="10" rx="18" ry="7" /><path d="M4 10 L4 48 C4 52 12 55 22 55 C32 55 40 52 40 48 L40 10" /><path d="M4 28 C4 32 12 35 22 35 C32 35 40 32 40 28" /></svg>); }
function Sphere() { return (<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="24" cy="24" r="20" /><ellipse cx="24" cy="24" rx="20" ry="8" /><ellipse cx="24" cy="24" rx="8" ry="20" /></svg>); }
function Pie() { return (<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="24" cy="24" r="20" /><path d="M24 24 L24 4 L40 12 Z" /><path d="M24 24 L10 36" /></svg>); }
function TriangleRuler() { return (<svg width="56" height="48" viewBox="0 0 56 48" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 42 L50 42 L6 6 Z" /><path d="M14 34 L38 34 M14 26 L30 26 M14 18 L22 18" /></svg>); }
function Ruler() { return (<svg width="64" height="20" viewBox="0 0 64 20" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="60" height="16" /><path d="M10 2 L10 10 M18 2 L18 8 M26 2 L26 10 M34 2 L34 8 M42 2 L42 10 M50 2 L50 8" /></svg>); }
function SineGraph() { return (<svg width="88" height="44" viewBox="0 0 88 44" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 22 L84 22 M44 4 L44 40" /><path d="M4 22 C14 2 22 42 32 22 C42 2 50 42 60 22 C70 2 78 42 84 22" /></svg>); }
function ParabolaGraph() { return (<svg width="72" height="56" viewBox="0 0 72 56" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 28 L66 28 M36 4 L36 52" /><path d="M10 6 C20 26 28 28 36 28 C44 28 52 26 62 6" /><path d="M10 28 L62 28" /></svg>); }
function CoordGraph() { return (<svg width="72" height="56" viewBox="0 0 72 56" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 28 L66 28 M36 4 L36 52" /><circle cx="24" cy="18" r="2" fill="currentColor" /><circle cx="44" cy="34" r="2" fill="currentColor" /><circle cx="52" cy="14" r="2" fill="currentColor" /><circle cx="20" cy="38" r="2" fill="currentColor" /><path d="M24 18 L44 34 L52 14" strokeDasharray="2 2" /></svg>); }

function hash(seed: number) {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function rand(seed: number, salt: number) { return hash(seed * 1000 + salt * 7919 + 13); }

export default function MathPattern() {
  const shapes = [Cube, Prism, Cylinder, Sphere, Pie, TriangleRuler, Ruler, SineGraph, ParabolaGraph, CoordGraph];
  const ROWS = 11;
  const COLS = 7;

  // 1. ICONS: 1 cell 1 icon, gak numpuk
  const cells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells.push({ r, c });

  // 2. SYMBOLS: ditaro di pojok-pojok cell, ngelilingin icon, BUKAN di tengah cell
  // jadi symbol gak pernah nimpa icon
  const surround = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // tiap icon dikelilingi 3-4 symbol di sekelilingnya: atas-kiri, atas-kanan, bawah-kiri, bawah-kanan
      const corners = [
        { dx: -4.5, dy: -2.2 }, { dx: 4.8, dy: -2.4 },
        { dx: -4.8, dy: 2.6 }, { dx: 4.5, dy: 2.4 },
      ];
      corners.forEach((pos, k) => {
        surround.push({ r, c, ...pos, k });
      });
    }
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* LAYER 1: SYMBOLS DULU, DI BELAKANG, JADI KALO KEPEPET PUN ICON YANG MENANG */}
      {surround.map(({ r, c, dx, dy, k }, i) => {
        const s = symbols[Math.floor(rand(i, 50) * symbols.length)];
        const size = 10 + rand(i, 51) * 14; // kecil aja, 10-24px, biar jadi pengawal, bukan raja
        const rotate = (rand(i, 52) - 0.5) * 40;
        const opacity = 0.06 + rand(i, 53) * 0.06;
        return (
          <div key={`sur-${i}`} className="absolute font-bold text-zinc-900 dark:text-white" style={{ top: `${r * 9.2 + 4.6 + dy}%`, left: `${c * 14.5 + 6.5 + dx}%`, transform: `translate(-50%, -50%) rotate(${rotate}deg)`, fontSize: `${size}px`, opacity }}>
            {s}
          </div>
        );
      })}

      {/* LAYER 2: ICONS, DI ATAS SYMBOLS, SATU-SATU, GAK NUMPUK */}
      {cells.map(({ r, c }, i) => {
        const Shape = shapes[Math.floor(rand(i, 99) * shapes.length) % shapes.length];
        // INI KUNCI "RANDOM TAPI GAK NUMPUK":
        // scale random, tapi dibatasin 0.55 - 1.25 aja, biar muat di cell-nya sendiri
        // dulu gue bikin 0.3 - 2.4, makanya numpuk. Sekarang gak bisa numpuk.
        const scale = 0.55 + rand(i, 1) * 0.7;
        // gesernya juga dikit aja, ±1.2%, bukan ±3% kayak tadi yang bikin numpuk
        const jitterX = (rand(i, 2) - 0.5) * 2.4;
        const jitterY = (rand(i, 3) - 0.5) * 1.6;
        const rotate = (rand(i, 4) - 0.5) * 22; // rotasi juga kecil, -11° sampe +11°, biar gak nyenggol tetangga
        const opacity = 0.08 + rand(i, 5) * 0.05;
        const isMirror = rand(i, 6) > 0.5;
        return (
          <div key={`s-${i}`} className="absolute flex items-center justify-center text-zinc-900 dark:text-white" style={{ top: `${r * 9.2}%`, left: `${c * 14.5 - 1}%`, width: "14.5%", height: "9.2%", opacity }}>
            <div style={{ transform: `translate(${jitterX}px, ${jitterY}px) rotate(${rotate}deg) scale(${scale}) scaleX(${isMirror ? -1 : 1})` }}>
              <Shape />
            </div>
          </div>
        );
      })}

      {/* LAYER 3: RUMUS, ditaro di celah antar baris, bukan di tengah icon */}
      {formulas.map((f, i) => {
        const top = (Math.floor(rand(i, 70) * ROWS) + 0.5) * 9.2 + (rand(i, 71) - 0.5) * 3;
        const left = rand(i, 72) * 72;
        const rotate = (rand(i, 73) - 0.5) * 8;
        return (
          <div key={`f-${i}`} className="absolute whitespace-nowrap text-[12px] font-medium text-zinc-900/[0.08] dark:text-white/[0.09]" style={{ top: `${top}%`, left: `${left}%`, transform: `rotate(${rotate}deg)` }}>
            {f}
          </div>
        );
      })}
    </div>
  );
}
