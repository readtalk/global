"use client";

const formulas = [
  "(a ± b)² = a² ± 2ab + b²", "D = b² - 4ac", "a² + b² = c²", "lim f(x) = ±∞",
  "aₙ = a₁ + d(n-1)", "Sₙ = (a₁ + aₙ)/2 · n", "P = 2πR", "π = 3,14", "e = 2,718",
  "logₐ X = b ⇒ aᵇ = X", "y = ∛(x+1)", "f(x) = 2⁻ˣ + 1", "e = cos x + tg x",
  "y = x²", "y = ctg x", "cos 2x = cos²x - sin²x", "tg X = sin X / cos X",
  "xᵃ · xᵇ = xᵃ⁺ᵇ", "(xᵃ / yᵃ) = (x/y)ᵃ", "a + b = b + a", "Σ = 0", "xy = 2a",
  "S₄ = | 0 1 0 1 |", "X₁ + X₂ = -b/a", "∫ xⁿ dx = xⁿ⁺¹ / (n+1) + C",
  "∫ A/(x-a) dx = A ln|x-a| + C", "SΔ = √p(p-a)(p-b)(p-c)", "a² = b² + c²",
  "logₐ X = 1/k logₐ X", "sin²(3X/2) + 1", "y' = x³ / 2xy", "√(abⁿ)",
  "lim n→∞ √(n³+1+n) / √(3n+2n-1)", "Xₙ₊₂ = ...", "eˣ cos X", "L₀ = 2πR",
  "a² + b² + c² = 0", "2x2 = 5", "Xₙ₊₁ = (Xₙ/3)", "G(x) + R²√21", "P(x)/Q(x) = 3",
  "x + y + z = 0", "ax - by + cz = 1", "3πL", "BO OD = A", "sin X / 2 sin X - 1",
  "√(n-1) / (n+5)", "r²√17", "y = ΔX / ΔZ", "(C·X)' = C", "Σ = n-1",
  "tg(-x) = -tg x", "√(2ab)", "Sₙ = b₁(1-qⁿ) / (1-q)", "(√a)ˣ = ⁿ√aˣ",
  "a² - b² = (a-b)(a+b)", "X₁/₂ = (b ± (a-c)) / √2a", "cos X - 2/3 = y",
];

const symbols = ["π", "Σ", "∫", "√", "∞", "Δ", "±", "≠", "°", "•", "·", "sin", "cos", "tg", "log", "e", "x", "y", "a", "b", "n"];

// --- SHAPES PERSIS KAYAK DI GAMBAR: ADA ARSIRAN, BUKAN POLOS ---
function CubeHatch() { return (<svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 22 L50 14 L58 44 L22 52 Z M14 22 L22 52 M50 14 L58 44 M14 22 L50 14 M22 52 L58 44" /><path d="M18 24 L48 18 M18 30 L52 24 M18 36 L54 30" strokeDasharray="2 2" opacity="0.7" /></svg>); }
function SphereLines() { return (<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="32" cy="32" r="26" /><ellipse cx="32" cy="32" rx="26" ry="10" strokeDasharray="3 3" /><ellipse cx="32" cy="32" rx="10" ry="26" strokeDasharray="3 3" /><ellipse cx="32" cy="32" rx="18" ry="26" strokeDasharray="2 3" /></svg>); }
function CylinderTilt() { return (<svg width="78" height="58" viewBox="0 0 78 58" fill="none" stroke="currentColor" strokeWidth="1"><g transform="rotate(-28 39 29)"><ellipse cx="39" cy="12" rx="20" ry="7" /><path d="M19 12 L19 46 C19 50 28 53 39 53 C50 53 59 50 59 46 L59 12" /><path d="M25 48 C25 51 31 53 39 53" strokeDasharray="2 2" /></g><path d="M58 8 L66 22" /></svg>); }
function PrismTrapezoid() { return (<svg width="96" height="68" viewBox="0 0 96 68" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 56 L48 62 L88 52 L72 8 L20 14 Z M6 56 L20 14 M72 8 L88 52 M20 14 L72 8" /><path d="M12 20 L74 12 M10 28 L80 20 M8 36 L86 28" strokeDasharray="3 2" /></svg>); }
function PieHatch() { return (<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="32" cy="32" r="26" /><path d="M32 32 L52 12 L58 26 Z" /><path d="M36 26 L54 14 M38 30 L56 18" strokeDasharray="2 2" /><path d="M32 32 L12 48" /></svg>); }
function Ruler() { return (<svg width="72" height="22" viewBox="0 0 72 22" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="4" width="68" height="14" /><path d="M10 4 L10 12 M18 4 L18 10 M26 4 L26 12 M34 4 L34 10 M42 4 L42 12 M50 4 L50 10 M58 4 L58 12" /></svg>); }
function SineBig() { return (<svg width="130" height="50" viewBox="0 0 130 50" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 25 L126 25 M20 4 L20 46" /><path d="M4 25 C16 2 28 48 40 25 C52 2 64 48 76 25 C88 2 100 48 112 25" /><text x="52" y="14" fontSize="10" fill="currentColor" stroke="none" fontStyle="italic">sin x</text></svg>); }
function ParabolaCoord() { return (<svg width="96" height="72" viewBox="0 0 96 72" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 36 L90 36 M48 4 L48 68" /><path d="M14 10 C30 28 40 36 48 36 C56 36 66 28 82 10" /><path d="M14 58 L82 58" strokeDasharray="2 2" /></svg>); }
function Pyramid() { return (<svg width="72" height="68" viewBox="0 0 72 68" fill="none" stroke="currentColor" strokeWidth="1"><path d="M36 6 L66 56 L6 56 Z M36 6 L36 56 M36 6 L24 56 M36 6 L48 56" /><circle cx="36" cy="38" r="10" /><text x="30" y="42" fontSize="10" fill="currentColor" stroke="none">r</text></svg>); }
function MatrixBox() { return (<svg width="62" height="58" viewBox="0 0 62 58" fill="none" stroke="currentColor" strokeWidth="1"><path d="M8 4 L16 4 L16 54 L8 54 M54 4 L46 4 L46 54 L54 54" /><text x="20" y="18" fontSize="9" fill="currentColor" stroke="none">0 1 0 1</text><text x="20" y="32" fontSize="9" fill="currentColor" stroke="none">1 0 1 0</text><text x="20" y="46" fontSize="9" fill="currentColor" stroke="none">0 1 1 0</text></svg>); }

const shapes = [CubeHatch, SphereLines, CylinderTilt, PrismTrapezoid, PieHatch, Ruler, SineBig, ParabolaCoord, Pyramid, MatrixBox];

// pseudo-random biar stabil, tapi keliatan acak kayak coretan tangan
function rnd(seed: number, max: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.abs(x - Math.floor(x)) * max;
}

export default function MathPattern() {
  // 130 item biar PADET kayak gambar lu, bukan 60 doang
  const items = Array.from({ length: 130 }, (_, i) => i);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white">
      {items.map((i) => {
        const Shape = shapes[i % shapes.length];
        // posisi acak total, bukan grid
        const top = rnd(i + 1, 98);
        const left = rnd(i + 101, 96);
        // ukuran ikut gelombang sinus kiri -> kanan + jitter acak
        // ini yang lu minta: gede - kecil - gede dari kiri ke kanan
        const wave = Math.sin((left / 100) * Math.PI * 3 + Math.floor(top / 10) * 0.8);
        const scale = 0.45 + (wave + 1) * 0.55 + rnd(i + 301, 0.4);
        const rotate = rnd(i + 201, 30) - 15;
        return (
          <div key={i} className="absolute text-zinc-800/[0.14]" style={{ top: `${top}%`, left: `${left}%`, transform: `rotate(${rotate}deg) scale(${scale})` }}>
            <Shape />
          </div>
        );
      })}

      {formulas.map((f, i) => {
        const top = rnd(i + 501, 98);
        const left = rnd(i + 601, 82);
        const rotate = rnd(i + 701, 24) - 12;
        // rumus juga ikut gelombang: di kiri kecil, di tengah gede, di kanan kecil lagi
        const wave = Math.sin((left / 100) * Math.PI * 2.5);
        const scale = 0.65 + (wave + 1) * 0.4 + rnd(i + 801, 0.25);
        return (
          <div key={`f-${i}`} className="absolute whitespace-nowrap text-zinc-800/[0.16]" style={{ top: `${top}%`, left: `${left}%`, transform: `rotate(${rotate}deg) scale(${scale})`, fontFamily: "'Segoe Script', 'Comic Sans MS', cursive", fontStyle: "italic", fontSize: "13px" }}>
            {f}
          </div>
        );
      })}

      {symbols.map((s, i) => {
        const top = rnd(i + 1001, 98);
        const left = rnd(i + 1101, 94);
        const rotate = rnd(i + 1201, 40) - 20;
        const size = 10 + rnd(i + 1301, 22);
        return (
          <div key={`s-${i}`} className="absolute text-zinc-800/[0.13]" style={{ top: `${top}%`, left: `${left}%`, transform: `rotate(${rotate}deg)`, fontSize: `${size}px`, fontFamily: "'Segoe Script', cursive", fontStyle: "italic" }}>
            {s}
          </div>
        );
      })}

      {/* titik-titik kecil ° kayak di gambar */}
      {Array.from({ length: 80 }, (_, i) => (
        <div key={`dot-${i}`} className="absolute rounded-full bg-zinc-800/[0.12]" style={{ top: `${rnd(i + 2001, 98)}%`, left: `${rnd(i + 2101, 98)}%`, width: 2 + rnd(i + 2201, 3), height: 2 + rnd(i + 2201, 3) }} />
      ))}
    </div>
  );
}
