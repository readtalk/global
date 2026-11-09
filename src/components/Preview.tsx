//
"use client";

type PreviewData = {
	url: string;
	title: string;
	description: string | null;
	image: string | null;
};

export default function Preview({ data }: { data: PreviewData }) {
	if (!data || !data.title) return null;

	return (
		<a href={data.url} target="_blank" rel="noopener noreferrer" className="mt-3 block w-full rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-50 transition">
			{data.image && (
				<div className="w-full h-48 bg-gray-200 overflow-hidden">
					<img src={data.image} alt={data.title} className="w-full h-full object-cover" />
				</div>
			)}
			<div className="p-3">
				<p className="text-xs text-gray-500 uppercase tracking-wide truncate">{new URL(data.url).hostname}</p>
				<h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">{data.title}</h3>
				{data.description && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{data.description}</p>}
			</div>
		</a>
	);
}
