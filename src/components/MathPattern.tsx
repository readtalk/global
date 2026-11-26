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

function rnd(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.abs(x - Math.floor(x));
}

export default function MathPattern() {
  const shapes = [Cube, Prism, Cylinder, Sphere, Pie, TriangleRuler, Ruler, SineGraph, ParabolaGraph, CoordGraph];
  const cells = [];
  for (let r = 0; r < 11; r++) for (let c = 0; c < 7; c++) cells.push({ r, c });
  const kawinSet = new Set([12, 47]);

  // KENTANG: rumus dilempar, bukan dijajar.
  // Kita bikin 3 lapis lemparan biar penuh dari ujung ke ujung.
  // Lapis 1: rumus panjang, 12 biji, dilempar acak penuh
  // Lapis 2: rumus panjang lagi tapi lebih kecil + kebalik, dilempar lagi, ngisi sela-sela lapis 1
  // Lapis 3: sin-cos-tan kecil, dilempar paling banyak, ngisi sela-sela yang masih kosong
  // Jadi yang bikin penuh tuh bukan kubusnya ditambah, tapi kentangnya yang dilempar terus sampe sela-nya ketutup.

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* KUBUS-SEGITIGA-LINGKARAN: tetep di cell-nya, ukuran beda-beda, arsir beda rasa */}
      {cells.map(({ r, c }, i) => {
        const Shape = shapes[i % shapes.length];
        const isMirror = (r + c) % 2 === 1;
        const isKawin = kawinSet.has(i);
        const scale = 0.45 + rnd(i * 3 + 7) * 1.65;
        // beda rasa: ada yang tipis, ada yang agak tebel, biar kubus sama kubus gak sama persis
        const weight = 0.7 + rnd(i * 7 + 2) * 0.8;
        return (
          <div key={`s-${i}`} className="absolute flex items-center justify-center text-zinc-900/[0.09] dark:text-white/[0.10]" style={{ top: `${r * 9.2}%`, left: `${c * 14.5 - 1}%`, width: "14.5%", height: "9.2%" }}>
            <div style={{ transform: `translate(${isKawin ? 22 : 0}px, ${isKawin ? -10 : 0}px) rotate(${((i * 31) % 20) - 10}deg) scale(${scale}) scaleX(${isMirror ? -1 : 1})`, opacity: 0.7 + rnd(i) * 0.3 }}>
              <div style={{ ['--w' as any]: weight }}>
                <Shape />
              </div>
            </div>
          </div>
        );
      })}

      {/* LAPIS KENTANG 1: rumus panjang, dilempar acak, ukuran 11-16px */}
      {formulas.map((f, i) => {
        const top = rnd(i * 13 + 101) * 92;
        const left = rnd(i * 29 + 202) * 70;
        const size = 11 + rnd(i * 7 + 3) * 5;
        return (
          <div key={`f-${i}`} className="absolute whitespace-nowrap font-medium text-zinc-900/[0.10] dark:text-white/[0.11]" style={{ top: `${top}%`, left: `${left}%`, fontSize: `${size}px`, transform: `rotate(${((i * 37) % 14) - 7}deg) scaleX(${i % 3 === 0 ? -1 : 1})` }}>
            {f}
          </div>
        );
      })}

      {/* LAPIS KENTANG 2: rumus yang sama tapi dilempar lagi ke tempat lain, lebih kecil, ngisi sela */}
      {formulas.map((f, i) => {
        const top = rnd(i * 41 + 505) * 94;
        const left = rnd(i * 17 + 606) * 65;
        const size = 9 + rnd(i * 11 + 9) * 4;
        return (
          <div key={`f2-${i}`} className="absolute whitespace-nowrap text-zinc-900/[0.07] dark:text-white/[0.08]" style={{ top: `${top}%`, left: `${left}%`, fontSize: `${size}px`, transform: `rotate(${((i * 53) % 16) - 8}deg) scaleX(-1)` }}>
            {f}
          </div>
        );
      })}

      {/* LAPIS KENTANG 3: sin-cos-tan + simbol kecil, dilempar PALING BANYAK, 3x lipat, biar sela kecil ketutup */}
      {[...symbols, ...symbols, ...symbols].map((s, i) => {
        const top = rnd(i * 19 + 707) * 96;
        const left = rnd(i * 31 + 808) * 92;
        const size = 12 + rnd(i * 23 + 5) * 30;
        return (
          <div key={`sym-${i}`} className="absolute font-bold text-zinc-900/[0.08] dark:text-white/[0.09]" style={{ top: `${top}%`, left: `${left}%`, fontSize: `${size}px`, transform: `rotate(${((i * 41) % 30) - 15}deg)` }}>
            {s}
          </div>
        );
      })}
    </div>
  );
}
