"use client";

import { Sigma, Pi, Radical, Function, Triangle, Circle, Cube, Ruler, Calculator, Percent, Infinity as InfinityIcon, Divide, Equals, Plus, Minus, X, ChartLine } from "@phosphor-icons/react/dist/ssr";

export default function MathPattern() {
	const icons = [Sigma, Pi, Radical, Function, Triangle, Circle, Cube, Ruler, Calculator, Percent, InfinityIcon, Divide, Equals, Plus, Minus, X, ChartLine];
	const cols = 8;
	const rows = 9;
	const cells = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			cells.push({ r, c });
		}
	}
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
			{cells.map(({ r, c }, i) => {
				const Icon = icons[i % icons.length];
				const isMirror = (r + c) % 2 === 1;
				const rotate = ((i * 37) % 30) - 15;
				const size = 28 + ((i * 13) % 32);
				return (
					<div key={i} className="absolute text-zinc-900/[0.07] dark:text-white/[0.08]" style={{ top: `${r * 11.5 + (c % 2 === 0 ? 0 : 2)}%`, left: `${c * 12.5 - 2}%`, transform: `rotate(${rotate}deg) scaleX(${isMirror ? -1 : 1})` }}>
						<Icon size={size} weight="thin" />
					</div>
				);
			})}
			{cells.map(({ r, c }, i) => {
				const Icon = icons[(i + 5) % icons.length];
				const isMirror = (r + c) % 2 === 0;
				const rotate = ((i * 53) % 30) - 15;
				const size = 22 + ((i * 11) % 28);
				return (
					<div key={`m-${i}`} className="absolute text-zinc-900/[0.05] dark:text-white/[0.06]" style={{ top: `${r * 11.5 + 5}%`, left: `${c * 12.5 + 5}%`, transform: `rotate(${rotate}deg) scaleX(${isMirror ? -1 : 1})` }}>
						<Icon size={size} weight="thin" />
					</div>
				);
			})}
		</div>
	);
}
