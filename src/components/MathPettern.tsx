"use client";

import { Sigma, Pi, SquareRoot, Function, Triangle, Circle, Cube, Ruler, Calculator, Percent, Infinity as InfinityIcon, Divide, Equals, Plus, Minus, X, ChartLine } from "@phosphor-icons/react/dist/ssr";

export default function MathPattern() {
	const icons = [Sigma, Pi, SquareRoot, Function, Triangle, Circle, Cube, Ruler, Calculator, Percent, InfinityIcon, Divide, Equals, Plus, Minus, X, ChartLine];
	const positions = [
		{ top: "2%", left: "4%", rotate: "-12deg", size: 56 },
		{ top: "6%", left: "38%", rotate: "10deg", size: 44 },
		{ top: "3%", left: "72%", rotate: "-8deg", size: 64 },
		{ top: "14%", left: "18%", rotate: "14deg", size: 38 },
		{ top: "16%", left: "58%", rotate: "-18deg", size: 48 },
		{ top: "15%", left: "86%", rotate: "6deg", size: 36 },
		{ top: "28%", left: "8%", rotate: "8deg", size: 62 },
		{ top: "30%", left: "42%", rotate: "-14deg", size: 40 },
		{ top: "27%", left: "78%", rotate: "16deg", size: 52 },
		{ top: "42%", left: "22%", rotate: "-6deg", size: 46 },
		{ top: "44%", left: "60%", rotate: "12deg", size: 58 },
		{ top: "41%", left: "90%", rotate: "-10deg", size: 34 },
		{ top: "56%", left: "6%", rotate: "18deg", size: 42 },
		{ top: "58%", left: "36%", rotate: "-16deg", size: 60 },
		{ top: "55%", left: "70%", rotate: "8deg", size: 38 },
		{ top: "70%", left: "14%", rotate: "-10deg", size: 54 },
		{ top: "72%", left: "48%", rotate: "14deg", size: 44 },
		{ top: "70%", left: "82%", rotate: "-14deg", size: 66 },
		{ top: "84%", left: "10%", rotate: "10deg", size: 40 },
		{ top: "86%", left: "40%", rotate: "-8deg", size: 58 },
		{ top: "85%", left: "66%", rotate: "18deg", size: 36 },
		{ top: "88%", left: "90%", rotate: "-6deg", size: 46 },
	];
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
			{positions.map((pos, i) => {
				const Icon = icons[i % icons.length];
				return (
					<div key={i} className="absolute text-zinc-900/[0.06] dark:text-white/[0.07]" style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})` }}>
						<Icon size={pos.size} weight="thin" />
					</div>
				);
			})}
		</div>
	);
}
