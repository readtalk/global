"use client";

const formulas = ["(a ± b)² = a² ± 2ab + b²", "D = b² - 4ac", "a² + b² = c²", "lim f(x) = ±∞", "aₙ = a₁ + d(n-1)", "Sₙ = (a₁ + aₙ)/2 · n", "P = 2πR", "π = 3,14", "e = 2,718", "logₐ X = b ⇒ aᵇ = X", "y = √x + 1", "f(x) = 2⁻ˣ + 1"];
const symbols = ["π", "Σ", "∫", "√", "∞", "Δ", "±", "≠", "≡", "≥", "≤", "sin", "cos", "tan", "log", "e", "x", "y"];

function Cube() {
	return (<svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1"><path d="M26 6 L46 16 L46 36 L26 46 L6 36 L6 16 Z M26 6 L26 26 L46 16 M26 26 L6 16 M26 26 L26 46" /></svg>);
}
function Prism() {
	return (<svg width="64" height="44" viewBox="0 0 64 44" fill="none" stroke="currentColor" strokeWidth="1"><path d="M10 36 L30 6 L54 10 L34 40 Z M10 36 L34 40 M30 6 L34 40 M30 6 L54 10" /></svg>);
}
function Cylinder() {
	return (<svg width="44" height="58" viewBox="0 0 44 58" fill="none" stroke="currentColor" strokeWidth="1"><ellipse cx="22" cy="10" rx="18" ry="7" /><path d="M4 10 L4 48 C4 52 12 55 22 55 C32 55 40 52 40 48 L40 10" /><path d="M4 28 C4 32 12 35 22 35 C32 35 40 32 40 28" /></svg>);
}
function Sphere() {
	return (<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="24" cy="24" r="20" /><ellipse cx="24" cy="24" rx="20" ry="8" /><ellipse cx="24" cy="24" rx="8" ry="20" /></svg>);
}
function Pie() {
	return (<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="24" cy="24" r="20" /><path d="M24 24 L24 4 L40 12 Z" /><path d="M24 24 L10 36" /></svg>);
}
function TriangleRuler() {
	return (<svg width="56" height="48" viewBox="0 0 56 48" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 42 L50 42 L6 6 Z" /><path d="M14 34 L38 34 M14 26 L30 26 M14 18 L22 18" /></svg>);
}
function Ruler() {
	return (<svg width="64" height="20" viewBox="0 0 64 20" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="60" height="16" /><path d="M10 2 L10 10 M18 2 L18 8 M26 2 L26 10 M34 2 L34 8 M42 2 L42 10 M50 2 L50 8" /></svg>);
}
function SineGraph() {
	return (<svg width="88" height="44" viewBox="0 0 88 44" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 22 L84 22 M44 4 L44 40" /><path d="M4 22 C14 2 22 42 32 22 C42 2 50 42 60 22 C70 2 78 42 84 22" /></svg>);
}
function ParabolaGraph() {
	return (<svg width="72" height="56" viewBox="0 0 72 56" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 28 L66 28 M36 4 L36 52" /><path d="M10 6 C20 26 28 28 36 28 C44 28 52 26 62 6" /><path d="M10 28 L62 28" /></svg>);
}
function CoordGraph() {
	return (<svg width="72" height="56" viewBox="0 0 72 56" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 28 L66 28 M36 4 L36 52" /><circle cx="24" cy="18" r="2" fill="currentColor" /><circle cx="44" cy="34" r="2" fill="currentColor" /><circle cx="52" cy="14" r="2" fill="currentColor" /><circle cx="20" cy="38" r="2" fill="currentColor" /><path d="M24 18 L44 34 L52 14" strokeDasharray="2 2" /></svg>);
}

export default function MathPattern() {
	const shapes = [Cube, Prism, Cylinder, Sphere, Pie, TriangleRuler, Ruler, SineGraph, ParabolaGraph, CoordGraph];
	const cells = [];
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 7; c++) {
			cells.push({ r, c });
		}
	}
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
			{cells.map(({ r, c }, i) => {
				const Shape = shapes[i % shapes.length];
				const isMirror = (r + c) % 2 === 1;
				return (
					<div key={`s-${i}`} className="absolute text-zinc-900/[0.09] dark:text-white/[0.10]" style={{ top: `${r * 11.5}%`, left: `${c * 14.5 - 1}%`, transform: `rotate(${((i * 31) % 20) - 10}deg) scaleX(${isMirror ? -1 : 1})` }}>
						<Shape />
					</div>
				);
			})}
			{formulas.map((f, i) => (
				<div key={`f-${i}`} className="absolute whitespace-nowrap text-[13px] font-medium text-zinc-900/[0.10] dark:text-white/[0.11]" style={{ top: `${(i * 17 + 8) % 92}%`, left: `${(i * 23 + 4) % 68}%`, transform: `rotate(${i % 2 === 0 ? -4 : 4}deg) scaleX(${i % 3 === 0 ? -1 : 1})` }}>
					{f}
				</div>
			))}
			{symbols.map((s, i) => (
				<div key={`sym-${i}`} className="absolute text-[26px] font-bold text-zinc-900/[0.08] dark:text-white/[0.09]" style={{ top: `${(i * 19 + 4) % 90}%`, left: `${(i * 29 + 10) % 88}%`, transform: `rotate(${((i * 41) % 24) - 12}deg)` }}>
					{s}
				</div>
			))}
			{formulas.map((f, i) => (
				<div key={`f2-${i}`} className="absolute whitespace-nowrap text-[11px] text-zinc-900/[0.07] dark:text-white/[0.08]" style={{ top: `${(i * 23 + 48) % 94}%`, left: `${(i * 31 + 38) % 62}%`, transform: `rotate(${i % 2 === 0 ? 5 : -5}deg) scaleX(-1)` }}>
					{f}
				</div>
			))}
		</div>
	);
}
